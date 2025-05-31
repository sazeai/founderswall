import { createClient } from "@/utils/supabase/server"
import type { DodoPaymentDetail } from "./dodo-payments"
import { UserProfileService } from "./user-profile-service"

export interface PaymentRecord {
  id: string
  user_id: string
  payment_id: string
  customer_id?: string
  status: string
  amount: number
  currency: string
  payment_method?: string
  payment_method_type?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export class PaymentService {
  static async createPaymentRecord(
    userId: string,
    paymentId: string,
    amount: number,
    metadata: Record<string, any> = {},
  ): Promise<PaymentRecord | null> {
    const supabase = await createClient()

    // Ensure user profile exists when creating payment
    await UserProfileService.ensureUserProfile(userId)

    const { data, error } = await supabase
      .from("payments")
      .insert({
        user_id: userId,
        payment_id: paymentId,
        status: "pending",
        amount,
        currency: "USD",
        metadata,
      })
      .select()
      .single()

    if (error) {
      return null
    }

    return data as PaymentRecord
  }

  static async updatePaymentRecord(paymentId: string, updates: Partial<PaymentRecord>): Promise<PaymentRecord | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("payments")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("payment_id", paymentId)
      .select()
      .single()

    if (error) {
      return null
    }

    return data as PaymentRecord
  }

  static async getPaymentByPaymentId(paymentId: string): Promise<PaymentRecord | null> {
    const supabase = await createClient()

    const { data, error } = await supabase.from("payments").select("*").eq("payment_id", paymentId).single()

    if (error) {
      return null
    }

    return data as PaymentRecord
  }

  static async getUserPayments(userId: string): Promise<PaymentRecord[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      return []
    }

    return data as PaymentRecord[]
  }

  static async hasLifetimeAccess(userId: string): Promise<boolean> {
    const supabase = await createClient()

    // Check if user has any completed payment
    const { data: paymentData, error: paymentError } = await supabase
      .from("payments")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "completed")
      .limit(1)

    if (paymentError) {
      return false
    }

    return paymentData && paymentData.length > 0
  }

  static async processPaymentSuccess(paymentDetail: DodoPaymentDetail): Promise<boolean> {
    try {
      const userId = paymentDetail.metadata.user_id
      if (!userId) {
        return false
      }

      // Ensure user profile exists
      await UserProfileService.ensureUserProfile(userId)

      // Update payment record with completed status
      await this.updatePaymentRecord(paymentDetail.payment_id, {
        status: "completed", // Changed from paymentDetail.status to "completed"
        customer_id: paymentDetail.customer.customer_id,
        payment_method: paymentDetail.payment_method,
        payment_method_type: paymentDetail.payment_method_type,
      })

      return true
    } catch (error) {
      return false
    }
  }

  static async recordWebhookEvent(
    eventId: string,
    eventType: string,
    paymentId: string | null,
    objectId: string,
    eventData: any,
  ): Promise<boolean> {
    const supabase = await createClient()

    const { error } = await supabase.from("payment_events").insert({
      event_id: eventId,
      event_type: eventType,
      payment_id: paymentId,
      object_id: objectId,
      event_data: eventData,
      processed: false,
    })

    if (error) {
      return false
    }

    return true
  }

  static async markEventProcessed(eventId: string): Promise<boolean> {
    const supabase = await createClient()

    const { error } = await supabase.from("payment_events").update({ processed: true }).eq("event_id", eventId)

    if (error) {
      return false
    }

    return true
  }
}
