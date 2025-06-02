import { type NextRequest, NextResponse } from "next/server"
import { dodoPayments } from "@/lib/dodo-payments"
import { createServiceRoleClient } from "@/utils/supabase/service-role"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    // Get webhook headers (keep for logging, but don't use for signature verification)
    const webhookId = request.headers.get("webhook-id")
    const webhookSignature = request.headers.get("webhook-signature")
    const webhookTimestamp = request.headers.get("webhook-timestamp")
    const webhookSecret = process.env.DODO_WEBHOOK_KEY

    // Log incoming headers
    console.log("[Webhook] Headers:", {
      webhookId,
      webhookSignature,
      webhookTimestamp,
      webhookSecretExists: !!webhookSecret
    })

    // Clone the request to get the raw body for signature verification
    // and also parse it as JSON for processing
    const rawBody = await request.text()
    console.log("[Webhook] Raw body:", rawBody)
    let body
    try {
      body = JSON.parse(rawBody)
    } catch (err) {
      console.error("[Webhook] Failed to parse JSON body:", err)
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }
    console.log("[Webhook] Parsed body:", body)

    // --- REMOVE SIGNATURE VERIFICATION ---
    // (No signature check, just proceed)

    // Create a Supabase client with service role key to bypass RLS
    const supabase = createServiceRoleClient()

    // Extract event data - handle different webhook formats
    let eventId: string
    let eventType: string
    let objectId: string
    let eventData: any

    // Check if this is a Dodo webhook format
    if (body.event_id && body.event_type && body.object_id) {
      // Standard Dodo webhook format
      eventId = body.event_id
      eventType = body.event_type
      objectId = body.object_id
      eventData = body
      console.log("[Webhook] Using Dodo format", { eventId, eventType, objectId })
    } else if (body.type && body.data && body.data.payment_id) {
      // Alternative format based on documentation
      eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      eventType = body.type
      objectId = body.data.payment_id
      eventData = body
      console.log("[Webhook] Using alternative format", { eventId, eventType, objectId })
    } else {
      console.error("[Webhook] Unknown webhook format", body)
      return NextResponse.json({ error: "Unknown webhook format" }, { status: 400 })
    }

    // Record the webhook event using service role client to bypass RLS
    const { error: eventError } = await supabase.from("payment_events").insert({
      event_id: eventId,
      event_type: eventType,
      payment_id: objectId,
      object_id: objectId,
      event_data: eventData,
      processed: false,
    })

    if (eventError) {
      console.error("[Webhook] Failed to record event", eventError)
      return NextResponse.json({ error: "Failed to record event", details: eventError }, { status: 500 })
    } else {
      console.log("[Webhook] Event recorded", { eventId, eventType, objectId })
    }

    // Handle payment-related events
    if (eventType === "payment.succeeded" || eventType === "payment.completed") {
      try {
        // Get payment details from Dodo
        const paymentDetail = await dodoPayments.getPayment(objectId)
        console.log("[Webhook] Payment detail from Dodo:", paymentDetail)

        if (paymentDetail.status === "succeeded") {
          // Update payment status to completed using service role client to bypass RLS
          const { error: updateError } = await supabase
            .from("payments")
            .update({
              status: "completed",
              updated_at: new Date().toISOString(),
            })
            .eq("payment_id", objectId)

          if (updateError) {
            console.error("[Webhook] Failed to update payment status to completed", updateError)
            return NextResponse.json({ error: "Failed to update payment", details: updateError }, { status: 500 })
          } else {
            console.log("[Webhook] Payment status updated to completed", { payment_id: objectId })
          }
        } else {
          console.log("[Webhook] Payment detail status not succeeded", paymentDetail.status)
        }
      } catch (error) {
        console.error("[Webhook] Failed to process payment", error)
        return NextResponse.json({ error: "Failed to process payment", details: error }, { status: 500 })
      }
    } else if (eventType === "payment.failed") {
      // Update payment status to failed using service role client
      const { error: updateError } = await supabase
        .from("payments")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("payment_id", objectId)

      if (updateError) {
        console.error("[Webhook] Failed to update payment status to failed", updateError)
        return NextResponse.json({ error: "Failed to update payment status", details: updateError }, { status: 500 })
      } else {
        console.log("[Webhook] Payment status updated to failed", { payment_id: objectId })
      }
    } else if (eventType === "payment.cancelled") {
      // Update payment status to cancelled using service role client
      const { error: updateError } = await supabase
        .from("payments")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("payment_id", objectId)

      if (updateError) {
        console.error("[Webhook] Failed to update payment status to cancelled", updateError)
        return NextResponse.json({ error: "Failed to update payment status", details: updateError }, { status: 500 })
      } else {
        console.log("[Webhook] Payment status updated to cancelled", { payment_id: objectId })
      }
    }

    // Mark event as processed using service role client
    const { error: processedError } = await supabase
      .from("payment_events")
      .update({ processed: true })
      .eq("event_id", eventId)

    if (processedError) {
      console.error("[Webhook] Failed to mark event as processed", processedError)
      return NextResponse.json({ error: "Failed to mark event as processed", details: processedError }, { status: 500 })
    } else {
      console.log("[Webhook] Event marked as processed", { eventId })
    }

    return NextResponse.json({ received: true, eventId, eventType, objectId })
  } catch (error) {
    console.error("[Webhook] Webhook processing failed", error)
    return NextResponse.json({ error: "Webhook processing failed", details: error }, { status: 500 })
  }
}
