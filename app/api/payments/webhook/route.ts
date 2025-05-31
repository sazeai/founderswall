import { type NextRequest, NextResponse } from "next/server"
import { dodoPayments } from "@/lib/dodo-payments"
import { createServiceRoleClient } from "@/utils/supabase/service-role"

export async function POST(request: NextRequest) {
  try {
    // Create a Supabase client with service role key to bypass RLS
    const supabase = createServiceRoleClient()

    // Verify webhook signature (if Dodo provides one)
    const webhookKey = process.env.DODO_WEBHOOK_KEY
    const signature = request.headers.get("x-dodo-signature")

    // TODO: Implement signature verification when Dodo provides it
    const body = await request.json()

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
    } else if (body.data && body.data.payment_id) {
      // Alternative format - create our own event ID
      eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      eventType = body.data.status === "succeeded" ? "payment.succeeded" : `payment.${body.data.status}`
      objectId = body.data.payment_id
      eventData = body
    } else {
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
      return NextResponse.json({ error: "Failed to record event", details: eventError }, { status: 500 })
    }

    // Handle payment-related events
    if (eventType === "payment.succeeded" || eventType === "payment.completed") {
      try {
        // Get payment details from Dodo
        const paymentDetail = await dodoPayments.getPayment(objectId)

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
            return NextResponse.json({ error: "Failed to update payment", details: updateError }, { status: 500 })
          }
        }
      } catch (error) {
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
        return NextResponse.json({ error: "Failed to update payment status", details: updateError }, { status: 500 })
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
        return NextResponse.json({ error: "Failed to update payment status", details: updateError }, { status: 500 })
      }
    }

    // Mark event as processed using service role client
    const { error: processedError } = await supabase
      .from("payment_events")
      .update({ processed: true })
      .eq("event_id", eventId)

    if (processedError) {
      return NextResponse.json({ error: "Failed to mark event as processed", details: processedError }, { status: 500 })
    }

    return NextResponse.json({ received: true, eventId, eventType, objectId })
  } catch (error) {
    return NextResponse.json({ error: "Webhook processing failed", details: error }, { status: 500 })
  }
}
