// Dodopayments service for handling payment operations
interface DodoPaymentRequest {
  customer: {
    name: string
    email: string
    create_new_customer?: boolean
  }
  billing: {
    country: string
    state: string
    city: string
    street: string
    zipcode: string
  }
  product_cart: Array<{
    product_id: string
    quantity: number
    amount?: number
  }>
  payment_link: boolean
  return_url?: string
  metadata?: Record<string, string>
}

interface DodoPaymentResponse {
  payment_id: string
  payment_link: string | null
  total_amount: number
  client_secret: string
  customer: {
    customer_id: string
    name: string
    email: string
  }
  metadata: Record<string, string>
}

interface DodoPaymentDetail {
  payment_id: string
  business_id: string
  total_amount: number
  currency: string
  status: "succeeded" | "failed" | "cancelled" | "processing" | "requires_customer_action"
  customer: {
    customer_id: string
    name: string
    email: string
  }
  payment_method?: string
  payment_method_type?: string
  created_at: string
  updated_at?: string
  metadata: Record<string, string>
}

class DodoPaymentsService {
  private apiKey: string
  private baseUrl: string
  private productId: string

  constructor() {
    this.apiKey = process.env.DODO_API_KEY!
    this.productId = process.env.DODO_PRODUCT_ID!
    this.baseUrl =
      process.env.NEXT_PUBLIC_DODO_TEST_API === "true"
        ? "https://test.dodopayments.com"
        : "https://live.dodopayments.com"
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Dodo API Error: ${response.status} - ${errorData}`)
    }

    return response.json()
  }

  async createPayment(paymentData: DodoPaymentRequest): Promise<DodoPaymentResponse> {
    return this.makeRequest<DodoPaymentResponse>("/payments", {
      method: "POST",
      body: JSON.stringify(paymentData),
    })
  }

  async getPayment(paymentId: string): Promise<DodoPaymentDetail> {
    return this.makeRequest<DodoPaymentDetail>(`/payments/${paymentId}`)
  }

  async createLifetimeAccessPayment(
    userEmail: string,
    userName: string,
    userId: string,
    returnUrl?: string,
  ): Promise<DodoPaymentResponse> {
    const paymentData: DodoPaymentRequest = {
      customer: {
        name: userName,
        email: userEmail,
        create_new_customer: false,
      },
      billing: {
        country: "US",
        state: "CA",
        city: "San Francisco",
        street: "123 Main St",
        zipcode: "94105",
      },
      product_cart: [
        {
          product_id: this.productId,
          quantity: 1,
          amount: 500, // $5.00 in cents
        },
      ],
      payment_link: true,
      return_url: returnUrl,
      metadata: {
        user_id: userId,
        product_type: "lifetime_access",
        platform: "founder_wall",
      },
    }

    return this.createPayment(paymentData)
  }
}

export const dodoPayments = new DodoPaymentsService()
export type { DodoPaymentResponse, DodoPaymentDetail }
