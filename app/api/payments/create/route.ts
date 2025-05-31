import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { dodoPayments } from "@/lib/dodo-payments"
import { PaymentService } from "@/lib/payment-service"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user already has lifetime access
    const hasAccess = await PaymentService.hasLifetimeAccess(user.id)
    if (hasAccess) {
      return NextResponse.json({ error: "User already has lifetime access" }, { status: 400 })
    }

    // Get user details
    const userEmail = user.email!
    const userName = user.user_metadata?.name || user.email!.split("@")[0]

    // Create return URL
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`

    // Create payment with Dodo
    const paymentResponse = await dodoPayments.createLifetimeAccessPayment(userEmail, userName, user.id, returnUrl)

    // Create payment record in our database
    await PaymentService.createPaymentRecord(user.id, paymentResponse.payment_id, paymentResponse.total_amount, {
      customer_id: paymentResponse.customer.customer_id,
      product_type: "lifetime_access",
    })

    return NextResponse.json({
      payment_id: paymentResponse.payment_id,
      payment_link: paymentResponse.payment_link,
      total_amount: paymentResponse.total_amount,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
}
