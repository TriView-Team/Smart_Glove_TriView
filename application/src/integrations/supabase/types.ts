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
      ai_stylist: {
        Row: {
          created_at: string
          id: string
          suggestion_text: string
          wardrobe_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          suggestion_text: string
          wardrobe_id: string
        }
        Update: {
          created_at?: string
          id?: string
          suggestion_text?: string
          wardrobe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_stylist_wardrobe_id_fkey"
            columns: ["wardrobe_id"]
            isOneToOne: false
            referencedRelation: "wardrobe"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_stylist_dataset: {
        Row: {
          audio_text_ar: string | null
          audio_text_en: string | null
          color: string
          created_at: string
          fabric_type: string
          id: string
          item_type: string | null
          pattern: string | null
          recommendation_ar: string
          recommendation_en: string
          updated_at: string
        }
        Insert: {
          audio_text_ar?: string | null
          audio_text_en?: string | null
          color: string
          created_at?: string
          fabric_type: string
          id?: string
          item_type?: string | null
          pattern?: string | null
          recommendation_ar: string
          recommendation_en: string
          updated_at?: string
        }
        Update: {
          audio_text_ar?: string | null
          audio_text_en?: string | null
          color?: string
          created_at?: string
          fabric_type?: string
          id?: string
          item_type?: string | null
          pattern?: string | null
          recommendation_ar?: string
          recommendation_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      audio_tips: {
        Row: {
          audio_url: string | null
          created_at: string
          description: string | null
          id: string
          language: string
          title: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          language?: string
          title: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          language?: string
          title?: string
        }
        Relationships: []
      }
      color_training_data: {
        Row: {
          clear: number
          created_at: string
          f1: number
          f2: number
          f3: number
          f4: number
          f5: number
          f6: number
          f7: number
          f8: number
          id: number
          label: string
          nir: number
        }
        Insert: {
          clear: number
          created_at?: string
          f1: number
          f2: number
          f3: number
          f4: number
          f5: number
          f6: number
          f7: number
          f8: number
          id?: number
          label: string
          nir: number
        }
        Update: {
          clear?: number
          created_at?: string
          f1?: number
          f2?: number
          f3?: number
          f4?: number
          f5?: number
          f6?: number
          f7?: number
          f8?: number
          id?: number
          label?: string
          nir?: number
        }
        Relationships: []
      }
      device_settings: {
        Row: {
          auto_connect: boolean
          created_at: string
          id: string
          preferred_language: string
          raspberry_id: string | null
          sensitivity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_connect?: boolean
          created_at?: string
          id?: string
          preferred_language?: string
          raspberry_id?: string | null
          sensitivity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_connect?: boolean
          created_at?: string
          id?: string
          preferred_language?: string
          raspberry_id?: string | null
          sensitivity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      devices: {
        Row: {
          created_at: string
          device_name: string
          device_status: string
          id: string
          last_connected_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_name: string
          device_status?: string
          id?: string
          last_connected_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_name?: string
          device_status?: string
          id?: string
          last_connected_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fabric_training_data: {
        Row: {
          created_at: string
          id: number
          label: string
          r: number
          s: number
          t: number
          u: number
          v: number
          w: number
        }
        Insert: {
          created_at?: string
          id?: number
          label: string
          r: number
          s: number
          t: number
          u: number
          v: number
          w: number
        }
        Update: {
          created_at?: string
          id?: number
          label?: string
          r?: number
          s?: number
          t?: number
          u?: number
          v?: number
          w?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          language: string
          name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string
          name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recognition_results: {
        Row: {
          color: string | null
          confidence: number | null
          created_at: string
          fabric_type: string | null
          id: string
          is_live: boolean
          pattern: string | null
          texture: string | null
          user_id: string
          wardrobe_id: string | null
        }
        Insert: {
          color?: string | null
          confidence?: number | null
          created_at?: string
          fabric_type?: string | null
          id?: string
          is_live?: boolean
          pattern?: string | null
          texture?: string | null
          user_id: string
          wardrobe_id?: string | null
        }
        Update: {
          color?: string | null
          confidence?: number | null
          created_at?: string
          fabric_type?: string | null
          id?: string
          is_live?: boolean
          pattern?: string | null
          texture?: string | null
          user_id?: string
          wardrobe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recognition_results_wardrobe_id_fkey"
            columns: ["wardrobe_id"]
            isOneToOne: false
            referencedRelation: "wardrobe"
            referencedColumns: ["id"]
          },
        ]
      }
      wardrobe: {
        Row: {
          color: string | null
          created_at: string
          fabric_type: string | null
          id: string
          image_url: string | null
          item_name: string
          notes: string | null
          pattern: string | null
          texture: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          fabric_type?: string | null
          id?: string
          image_url?: string | null
          item_name: string
          notes?: string | null
          pattern?: string | null
          texture?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          fabric_type?: string | null
          id?: string
          image_url?: string | null
          item_name?: string
          notes?: string | null
          pattern?: string | null
          texture?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const
