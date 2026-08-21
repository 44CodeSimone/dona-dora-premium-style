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
      customer_profiles: {
        Row: {
          address: Json
          created_at: string
          full_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: Json
          created_at?: string
          full_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: Json
          created_at?: string
          full_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
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
          previous_status: string | null
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
          previous_status?: string | null
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
          previous_status?: string | null
          status?: string
          subtotal?: number
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          allow_virtual_try_on: boolean
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
          allow_virtual_try_on?: boolean
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
          allow_virtual_try_on?: boolean
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
      reviews: {
        Row: {
          author_name: string
          comment: string
          created_at: string
          id: string
          product_id: string
          rating: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author_name: string
          comment: string
          created_at?: string
          id?: string
          product_id: string
          rating: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author_name?: string
          comment?: string
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
          live_description: string
          live_enabled: boolean
          live_featured_product_ids: Json
          live_title: string
          live_url: string | null
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
          virtual_tryon_enabled: boolean
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
          live_description?: string
          live_enabled?: boolean
          live_featured_product_ids?: Json
          live_title?: string
          live_url?: string | null
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
          virtual_tryon_enabled?: boolean
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
          live_description?: string
          live_enabled?: boolean
          live_featured_product_ids?: Json
          live_title?: string
          live_url?: string | null
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
          virtual_tryon_enabled?: boolean
          whatsapp?: string
          whatsapp_display?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
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
      virtual_try_on_consents: {
        Row: {
          accepted_at: string
          consent_text: string
          created_at: string
          id: string
          product_id: string
          selected_color: string | null
          selected_size: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string
          consent_text: string
          created_at?: string
          id?: string
          product_id: string
          selected_color?: string | null
          selected_size?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string
          consent_text?: string
          created_at?: string
          id?: string
          product_id?: string
          selected_color?: string | null
          selected_size?: string | null
          user_id?: string
        }
        Relationships: []
      }
      virtual_try_on_sessions: {
        Row: {
          consent_accepted: boolean
          created_at: string
          deleted_at: string | null
          expires_at: string
          generated_image_path: string | null
          id: string
          original_image_path: string | null
          product_id: string
          selected_color: string | null
          selected_size: string | null
          status: string
          user_id: string
        }
        Insert: {
          consent_accepted?: boolean
          created_at?: string
          deleted_at?: string | null
          expires_at?: string
          generated_image_path?: string | null
          id?: string
          original_image_path?: string | null
          product_id: string
          selected_color?: string | null
          selected_size?: string | null
          status?: string
          user_id: string
        }
        Update: {
          consent_accepted?: boolean
          created_at?: string
          deleted_at?: string | null
          expires_at?: string
          generated_image_path?: string | null
          id?: string
          original_image_path?: string | null
          product_id?: string
          selected_color?: string | null
          selected_size?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
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
