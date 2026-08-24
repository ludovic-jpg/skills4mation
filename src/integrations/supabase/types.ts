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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      candidatures: {
        Row: {
          created_at: string
          email: string
          expertise: string | null
          id: string
          message: string | null
          nom: string
          prenom: string
          statut: Database["public"]["Enums"]["candidature_statut"]
          telephone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expertise?: string | null
          id?: string
          message?: string | null
          nom: string
          prenom: string
          statut?: Database["public"]["Enums"]["candidature_statut"]
          telephone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expertise?: string | null
          id?: string
          message?: string | null
          nom?: string
          prenom?: string
          statut?: Database["public"]["Enums"]["candidature_statut"]
          telephone?: string | null
        }
        Relationships: []
      }
      demandes_budget: {
        Row: {
          besoin: string | null
          budget_estime: string | null
          commentaire: string | null
          commentaire_admin: string | null
          contact: string | null
          created_at: string
          entreprise_prospect: string
          formateur_id: string
          id: string
          nb_participants: number | null
          statut: Database["public"]["Enums"]["budget_statut"]
        }
        Insert: {
          besoin?: string | null
          budget_estime?: string | null
          commentaire?: string | null
          commentaire_admin?: string | null
          contact?: string | null
          created_at?: string
          entreprise_prospect: string
          formateur_id: string
          id?: string
          nb_participants?: number | null
          statut?: Database["public"]["Enums"]["budget_statut"]
        }
        Update: {
          besoin?: string | null
          budget_estime?: string | null
          commentaire?: string | null
          commentaire_admin?: string | null
          contact?: string | null
          created_at?: string
          entreprise_prospect?: string
          formateur_id?: string
          id?: string
          nb_participants?: number | null
          statut?: Database["public"]["Enums"]["budget_statut"]
        }
        Relationships: []
      }
      documents_dossier: {
        Row: {
          dossier_id: string
          fichier_url: string
          formateur_id: string
          id: string
          nom_fichier: string | null
          type: Database["public"]["Enums"]["document_type"]
          uploaded_at: string
        }
        Insert: {
          dossier_id: string
          fichier_url: string
          formateur_id: string
          id?: string
          nom_fichier?: string | null
          type: Database["public"]["Enums"]["document_type"]
          uploaded_at?: string
        }
        Update: {
          dossier_id?: string
          fichier_url?: string
          formateur_id?: string
          id?: string
          nom_fichier?: string | null
          type?: Database["public"]["Enums"]["document_type"]
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_dossier_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      dossiers: {
        Row: {
          archived_at: string | null
          created_at: string
          documents_json: Json
          drive_folder_url: string | null
          entreprise_nom: string | null
          formateur_id: string
          id: string
          statut: Database["public"]["Enums"]["dossier_statut"]
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          documents_json?: Json
          drive_folder_url?: string | null
          entreprise_nom?: string | null
          formateur_id: string
          id?: string
          statut?: Database["public"]["Enums"]["dossier_statut"]
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          documents_json?: Json
          drive_folder_url?: string | null
          entreprise_nom?: string | null
          formateur_id?: string
          id?: string
          statut?: Database["public"]["Enums"]["dossier_statut"]
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          lien: string | null
          lu: boolean
          message: string | null
          titre: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lien?: string | null
          lu?: boolean
          message?: string | null
          titre: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lien?: string | null
          lu?: boolean
          message?: string | null
          titre?: string
          user_id?: string
        }
        Relationships: []
      }
      parcours_formation: {
        Row: {
          created_at: string
          description: string | null
          formateur_id: string
          id: string
          ordre: number
          titre: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          formateur_id: string
          id?: string
          ordre?: number
          titre: string
        }
        Update: {
          created_at?: string
          description?: string | null
          formateur_id?: string
          id?: string
          ordre?: number
          titre?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          date_naissance: string | null
          email: string
          id: string
          nom: string
          photo_url: string | null
          prenom: string
          siret: string | null
          statut_candidature: Database["public"]["Enums"]["candidature_statut"]
          telephone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_naissance?: string | null
          email?: string
          id: string
          nom?: string
          photo_url?: string | null
          prenom?: string
          siret?: string | null
          statut_candidature?: Database["public"]["Enums"]["candidature_statut"]
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_naissance?: string | null
          email?: string
          id?: string
          nom?: string
          photo_url?: string | null
          prenom?: string
          siret?: string | null
          statut_candidature?: Database["public"]["Enums"]["candidature_statut"]
          telephone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      catalogue_public: {
        Row: {
          description: string | null
          id: string | null
          nom: string | null
          ordre: number | null
          photo_url: string | null
          prenom: string | null
          titre: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "formateur" | "admin"
      budget_statut: "en_attente" | "en_cours_etude" | "validee" | "refusee"
      candidature_statut: "en_attente" | "valide" | "refuse"
      document_type: "signe" | "accord_financement" | "qualiopi_final"
      dossier_statut:
        | "brouillon"
        | "en_cours_generation"
        | "documents_generes"
        | "documents_signes"
        | "financement_depose"
        | "complet"
        | "archive"
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
      app_role: ["formateur", "admin"],
      budget_statut: ["en_attente", "en_cours_etude", "validee", "refusee"],
      candidature_statut: ["en_attente", "valide", "refuse"],
      document_type: ["signe", "accord_financement", "qualiopi_final"],
      dossier_statut: [
        "brouillon",
        "en_cours_generation",
        "documents_generes",
        "documents_signes",
        "financement_depose",
        "complet",
        "archive",
      ],
    },
  },
} as const
