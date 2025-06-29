export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      mugshots: {
        Row: {
          id: string
          name: string
          crime: string
          note: string | null
          image_url: string | null
          mugshot_url: string | null
          product_url: string | null
          twitter_handle: string | null
          likes: number | null
          created_at: string
          user_id: string | null
          is_approved: boolean | null
          is_visible: boolean | null
          payment_status: string | null
          slug: string
        }
        Insert: {
          id?: string
          name: string
          crime: string
          note?: string | null
          image_url?: string | null
          mugshot_url?: string | null
          product_url?: string | null
          twitter_handle?: string | null
          likes?: number | null
          created_at?: string
          user_id?: string | null
          is_approved?: boolean | null
          is_visible?: boolean | null
          payment_status?: string | null
          slug: string
        }
        Update: {
          id?: string
          name?: string
          crime?: string
          note?: string | null
          image_url?: string | null
          mugshot_url?: string | null
          product_url?: string | null
          twitter_handle?: string | null
          likes?: number | null
          created_at?: string
          user_id?: string | null
          is_approved?: boolean | null
          is_visible?: boolean | null
          payment_status?: string | null
          slug: string
        }
      }
      connections: {
        Row: {
          id: string
          from_criminal_id: string
          to_criminal_id: string
          connection_type: string
          evidence: string | null
          created_by: string
          upvotes: number | null
          created_at: string
        }
        Insert: {
          id?: string
          from_criminal_id: string
          to_criminal_id: string
          connection_type: string
          evidence?: string | null
          created_by: string
          upvotes?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          from_criminal_id?: string
          to_criminal_id?: string
          connection_type?: string
          evidence?: string | null
          created_by?: string
          upvotes?: number | null
          created_at?: string
        }
      }
      upvotes: {
        Row: {
          id: string
          connection_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          connection_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          connection_id?: string
          user_id?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          slug: string
          case_id: string
          title: string
          founder_id: string
          logo_url: string | null
          screenshot_url: string | null
          category: string
          status: string
          summary: string[]
          tags: string[]
          description: string | null
          product_url: string
          social_links: Json | null
          launch_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          case_id: string
          title: string
          founder_id: string
          logo_url?: string | null
          screenshot_url?: string | null
          category: string
          status?: string
          summary: string[]
          tags: string[]
          description?: string | null
          product_url: string
          social_links?: Json | null
          launch_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          case_id?: string
          title?: string
          founder_id?: string
          logo_url?: string | null
          screenshot_url?: string | null
          category?: string
          status?: string
          summary?: string[]
          tags?: string[]
          description?: string | null
          product_url?: string
          social_links?: Json | null
          launch_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      timeline_entries: {
        Row: {
          id: string
          product_id: string
          date: string
          headline: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          date: string
          headline: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          date?: string
          headline?: string
          description?: string | null
          created_at?: string
        }
      }
      product_upvotes: {
        Row: {
          id: string
          product_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          created_at?: string
        }
      }
      pins: {
        Row: {
          id: string
          content: string
          user_id: string
          product_id: string | null
          visibility: 'public' | 'private'
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          user_id: string
          product_id?: string | null
          visibility: 'public' | 'private'
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          user_id?: string
          product_id?: string | null
          visibility?: 'public' | 'private'
          created_at?: string
        }
      }
      pin_reactions: {
        Row: {
          id: string
          pin_id: string
          user_id: string
          emoji: string
          created_at: string
        }
        Insert: {
          id?: string
          pin_id: string
          user_id: string
          emoji: string
          created_at?: string
        }
        Update: {
          id?: string
          pin_id?: string
          user_id?: string
          emoji?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
