import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { PaymentService } from "@/lib/payment-service"

export async function GET() {
  try {
    const supabase = await createClient()

    // Use getUser() instead of getSession() for security
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (!user || userError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has lifetime access - only from payments table
    const hasAccess = await PaymentService.hasLifetimeAccess(user.id)

    return NextResponse.json({
      user_id: user.id,
      has_lifetime_access: hasAccess,
      payments: await PaymentService.getUserPayments(user.id),
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
