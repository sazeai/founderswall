"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

interface PaymentStatus {
  has_lifetime_access: boolean
  payments: Array<{
    id: string
    payment_id: string
    status: string
    amount: number
    currency: string
    created_at: string
  }>
}

interface PaymentStatusContextType {
  paymentStatus: PaymentStatus | null
  loading: boolean
  refresh: () => Promise<void>
}

const PaymentStatusContext = createContext<PaymentStatusContextType | undefined>(undefined)

export const PaymentStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchPaymentStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/payments/status")
      if (response.ok) {
        const data = await response.json()
        setPaymentStatus(data)
      } else {
        setPaymentStatus(null)
      }
    } catch (error) {
      setPaymentStatus(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPaymentStatus()
    // Only run once per session unless refresh is called
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <PaymentStatusContext.Provider value={{ paymentStatus, loading, refresh: fetchPaymentStatus }}>
      {children}
    </PaymentStatusContext.Provider>
  )
}

export function usePaymentStatus() {
  const context = useContext(PaymentStatusContext)
  if (context === undefined) {
    throw new Error("usePaymentStatus must be used within a PaymentStatusProvider")
  }
  return context
} 