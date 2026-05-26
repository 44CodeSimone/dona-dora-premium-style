export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      brands: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          featured: boolean
          id: string
          logo_url: string | null
          name: string
          order_index: number
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          logo_url?: string | null
          name: string
          order_index?: number
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          logo_url?: string | null
          name?: string
          order_index?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          customer_interest: string | null
          customer_name: string | null
          customer_whatsapp: string | null
          id: string
          session_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_interest?: string | null
          customer_name?: string | null
          customer_whatsapp?: string | null
          id?: string
          session_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_interest?: string | null
          customer_name?: string | null
          customer_whatsapp?: string | null
          id?: string
          session_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          budget: string | null
          conversation_id: string | null
          created_at: string
          email: string | null
          emailed: boolean
          id: string
          interest: string | null
          message: string | null
          name: string | null
          product: string | null
          read: boolean
          size: string | null
          source: string
          style: string | null
          whatsapp: string | null
        }
        Insert: {
          budget?: string | null
          conversation_id?: string | null
          created_at?: string
          email?: string | null
          emailed?: boolean
          id?: string
          interest?: string | null
          message?: string | null
          name?: string | null
          product?: string | null
          read?: boolean
          size?: string | null
          source?: string
          style?: string | null
          whatsapp?: string | null
        }
        Update: {
          budget?: string | null
          conversation_id?: string | null
          created_at?: string
          email?: string | null
          emailed?: boolean
          id?: string
          interest?: string | null
          message?: string | null
          name?: string | null
          product?: string | null
          read?: boolean
          size?: string | null
          source?: string
          style?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_whatsapp: string
          id: string
          items: Json
          notes: string | null
          status: string
          subtotal: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_whatsapp: string
          id?: string
          items?: Json
          notes?: string | null
          status?: string
          subtotal?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_whatsapp?: string
          id?: string
          items?: Json
          notes?: string | null
          status?: string
          subtotal?: number
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          alt_text: string | null
          available: boolean
          brand: string | null
          category: string
          colors: string[]
          created_at: string
          description: string | null
          featured: boolean
          id: string
          image_url: string | null
          images: string[]
          installments: number
          name: string
          pix_price: number | null
          price: number | null
          promo: boolean
          promo_price: number | null
          sizes: string[]
          slug: string | null
          stock: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          alt_text?: string | null
          available?: boolean
          brand?: string | null
          category?: string
          colors?: string[]
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          images?: string[]
          installments?: number
          name: string
          pix_price?: number | null
          price?: number | null
          promo?: boolean
          promo_price?: number | null
          sizes?: string[]
          slug?: string | null
          stock?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          alt_text?: string | null
          available?: boolean
          brand?: string | null
          category?: string
          colors?: string[]
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          images?: string[]
          installments?: number
          name?: string
          pix_price?: number | null
          price?: number | null
          promo?: boolean
          promo_price?: number | null
          sizes?: string[]
          slug?: string | null
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          accent_color: string
          address: string
          benefits: Json
          bg_color: string
          brand_name: string
          dora_system_prompt: string
          dora_welcome_message: string
          facebook_url: string | null
          hero_cta_link: string
          hero_cta_text: string
          hero_image_url: string | null
          hero_subtitle: string
          hero_title: string
          hours_saturday: string
          hours_weekday: string
          id: number
          instagram_handle: string
          instagram_url: string
          lead_email: string
          logo_url: string | null
          payment_methods: Json
          policies: Json
          primary_color: string
          seo_description: string
          seo_keywords: string
          seo_og_image: string | null
          seo_title: string
          tiktok_url: string | null
          topbar_text: string
          updated_at: string
          vip_benefits: Json
          vip_image_url: string | null
          vip_link: string
          vip_subtitle: string
          vip_title: string
          whatsapp: string
          whatsapp_display: string
        }
        Insert: {
          accent_color?: string
          address?: string
          benefits?: Json
          bg_color?: string
          brand_name?: string
          dora_system_prompt?: string
          dora_welcome_message?: string
          facebook_url?: string | null
          hero_cta_link?: string
          hero_cta_text?: string
          hero_image_url?: string | null
          hero_subtitle?: string
          hero_title?: string
          hours_saturday?: string
          hours_weekday?: string
          id?: number
          instagram_handle?: string
          instagram_url?: string
          lead_email?: string
          logo_url?: string | null
          payment_methods?: Json
          policies?: Json
          primary_color?: string
          seo_description?: string
          seo_keywords?: string
          seo_og_image?: string | null
          seo_title?: string
          tiktok_url?: string | null
          topbar_text?: string
          updated_at?: string
          vip_benefits?: Json
          vip_image_url?: string | null
          vip_link?: string
          vip_subtitle?: string
          vip_title?: string
          whatsapp?: string
          whatsapp_display?: string
        }
        Update: {
          accent_color?: string
          address?: string
          benefits?: Json
          bg_color?: string
          brand_name?: string
          dora_system_prompt?: string
          dora_welcome_message?: string
          facebook_url?: string | null
          hero_cta_link?: string
          hero_cta_text?: string
          hero_image_url?: string | null
          hero_subtitle?: string
          hero_title?: string
          hours_saturday?: string
          hours_weekday?: string
          id?: number
          instagram_handle?: string
          instagram_url?: string
          lead_email?: string
          logo_url?: string | null
          payment_methods?: Json
          policies?: Json
          primary_color?: string
          seo_description?: string
          seo_keywords?: string
          seo_og_image?: string | null
          seo_title?: string
          tiktok_url?: string | null
          topbar_text?: string
          updated_at?: string
          vip_benefits?: Json
          vip_image_url?: string | null
          vip_link?: string
          vip_subtitle?: string
          vip_title?: string
          whatsapp?: string
          whatsapp_display?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
