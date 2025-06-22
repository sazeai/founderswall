"use client"

import SubmitLaunchForm from "./submit-launch-form"
import { PaymentStatusProvider } from "@/components/PaymentStatusProvider"
import AccessGuard from "@/components/access-guard"

export default function SubmitLaunchPage() {
  return (
    <PaymentStatusProvider>
      <AccessGuard requiresPayment={true}>
        <SubmitLaunchForm />
      </AccessGuard>
    </PaymentStatusProvider>
  )
}
