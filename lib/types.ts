export interface Mugshot {
  id: string
  name: string
  crime: string
  note: string | null
  imageUrl: string | null
  mugshotUrl: string | null
  productUrl: string | null
  twitterHandle: string | null
  likes: number
  createdAt: string
  userId?: string | null
  isApproved?: boolean
  isVisible?: boolean
  paymentStatus?: string
  accessType?: "paid" | "community_pick"
  badgeType?: "wanted" | "community_pick" | "startup_saviour"
  featured?: boolean
}

export interface Connection {
  id: string
  fromCriminalId: string
  toCriminalId: string
  connectionType: string
  evidence: string | null
  createdBy: string
  upvotes: number
  createdAt: string
}

export interface Criminal {
  id: string
  name: string
  crime: string
  note: string | null
  imageUrl: string | null
  mugshotUrl: string | null
  productUrl: string | null
  twitterHandle: string | null
  likes: number
  createdAt: string
  connections: Connection[]
}

export interface Product {
  id: string
  slug: string
  caseId: string
  title: string
  founderId: string
  founderName?: string
  logoUrl: string | null
  screenshotUrl: string | null
  category: string
  status: string
  summary: string[]
  tags: string[]
  description: string | null
  productUrl: string
  socialLinks: {
    twitter?: string
    github?: string
    linkedin?: string
    discord?: string
    other?: string
  } | null
  launchDate: string
  createdAt: string
  updatedAt: string
  upvotes?: number
  timelineEntries?: TimelineEntry[]
}

export interface TimelineEntry {
  id: string
  productId: string
  date: string
  headline: string
  description: string | null
  createdAt: string
}

export interface ProductUpvote {
  id: string
  productId: string
  userId: string
  createdAt: string
}

export interface ProductFormData {
  title: string
  founderId: string
  logoFile: File | null
  logoPreview: string
  screenshotFile: File | null
  screenshotPreview: string
  category: string
  tags: string[]
  status: string
  summary: string[]
  description: string
  productUrl: string
  socialLinks: {
    twitter?: string
    github?: string
    linkedin?: string
    discord?: string
    other?: string
  }
  launchDate: string
  initialTimelineEntry?: {
    headline: string
    description: string
  }
}

export interface Nomination {
  id: string
  supporter_user_id: string
  supporter_mugshot_id?: string
  nominee_twitter_handle: string
  additional_message?: string
  created_at: string
}
