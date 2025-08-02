export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      bobinas: {
        Row: {
          codigo: string
          cor: string
          created_at: string
          data_entrada: string
          data_para_maquina: string | null
          data_validade: string | null
          em_maquina: boolean | null
          espessura: number
          fornecedor: string | null
          foto_url: string | null
          id: string
          largura: number
          localizacao: string | null
          observacoes: string | null
          peso: number
          prioridade: Database["public"]["Enums"]["prioridade_type"] | null
          quantidade_estoque: number
          quantidade_usada: number | null
          tipo_plastico: string
          updated_at: string
          user_id: string
          usuario_adicionou: string | null
        }
        Insert: {
          codigo: string
          cor: string
          created_at?: string
          data_entrada?: string
          data_para_maquina?: string | null
          data_validade?: string | null
          em_maquina?: boolean | null
          espessura: number
          fornecedor?: string | null
          foto_url?: string | null
          id?: string
          largura: number
          localizacao?: string | null
          observacoes?: string | null
          peso: number
          prioridade?: Database["public"]["Enums"]["prioridade_type"] | null
          quantidade_estoque?: number
          quantidade_usada?: number | null
          tipo_plastico: string
          updated_at?: string
          user_id: string
          usuario_adicionou?: string | null
        }
        Update: {
          codigo?: string
          cor?: string
          created_at?: string
          data_entrada?: string
          data_para_maquina?: string | null
          data_validade?: string | null
          em_maquina?: boolean | null
          espessura?: number
          fornecedor?: string | null
          foto_url?: string | null
          id?: string
          largura?: number
          localizacao?: string | null
          observacoes?: string | null
          peso?: number
          prioridade?: Database["public"]["Enums"]["prioridade_type"] | null
          quantidade_estoque?: number
          quantidade_usada?: number | null
          tipo_plastico?: string
          updated_at?: string
          user_id?: string
          usuario_adicionou?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bobinas_usuario_adicionou_fkey"
            columns: ["usuario_adicionou"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string | null
          created_at: string
          edited_at: string | null
          file_url: string | null
          id: string
          is_deleted: boolean | null
          message_type: string | null
          room_id: string | null
          sender_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          edited_at?: string | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean | null
          message_type?: string | null
          room_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          edited_at?: string | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean | null
          message_type?: string | null
          room_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      chat_participants: {
        Row: {
          id: string
          joined_at: string
          room_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string
          room_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string
          room_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      historico_bobinas: {
        Row: {
          bobina_id: string | null
          data_uso: string
          id: string
          maquina_id: string | null
          observacoes: string | null
          operador: string | null
          quantidade_usada: number
        }
        Insert: {
          bobina_id?: string | null
          data_uso?: string
          id?: string
          maquina_id?: string | null
          observacoes?: string | null
          operador?: string | null
          quantidade_usada: number
        }
        Update: {
          bobina_id?: string | null
          data_uso?: string
          id?: string
          maquina_id?: string | null
          observacoes?: string | null
          operador?: string | null
          quantidade_usada?: number
        }
        Relationships: [
          {
            foreignKeyName: "historico_bobinas_bobina_id_fkey"
            columns: ["bobina_id"]
            isOneToOne: false
            referencedRelation: "bobinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_bobinas_maquina_id_fkey"
            columns: ["maquina_id"]
            isOneToOne: false
            referencedRelation: "maquinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_bobinas_operador_fkey"
            columns: ["operador"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      maquinas: {
        Row: {
          ativa: boolean | null
          bobina_atual: string | null
          created_at: string
          id: string
          nome: string
          operador: string | null
          updated_at: string
        }
        Insert: {
          ativa?: boolean | null
          bobina_atual?: string | null
          created_at?: string
          id?: string
          nome: string
          operador?: string | null
          updated_at?: string
        }
        Update: {
          ativa?: boolean | null
          bobina_atual?: string | null
          created_at?: string
          id?: string
          nome?: string
          operador?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maquinas_bobina_atual_fkey"
            columns: ["bobina_atual"]
            isOneToOne: false
            referencedRelation: "bobinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maquinas_operador_fkey"
            columns: ["operador"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          role: string | null
          status: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      stickers: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
          url: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
          url: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_default_profiles: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      prioridade_type: "alta" | "media" | "baixa"
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
      prioridade_type: ["alta", "media", "baixa"],
    },
  },
} as const
