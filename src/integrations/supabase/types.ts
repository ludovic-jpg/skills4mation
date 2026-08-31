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
      candidatures: {
        Row: {
          adresse: string | null
          assigne_a: string | null
          assigne_nom: string | null
          commentaire_admin: string | null
          created_at: string
          cv_url: string | null
          date_naissance: string | null
          deroule_pedagogique_url: string | null
          email: string
          expertise: string | null
          id: string
          message: string | null
          nom: string
          numero_nda: string | null
          parcours_formation: string | null
          parcours_formation_url: string | null
          prenom: string
          profile_id: string | null
          siret: string | null
          statut: Database["public"]["Enums"]["candidature_statut"]
          telephone: string | null
          traitee_at: string | null
        }
        Insert: {
          adresse?: string | null
          assigne_a?: string | null
          assigne_nom?: string | null
          commentaire_admin?: string | null
          created_at?: string
          cv_url?: string | null
          date_naissance?: string | null
          deroule_pedagogique_url?: string | null
          email: string
          expertise?: string | null
          id?: string
          message?: string | null
          nom: string
          numero_nda?: string | null
          parcours_formation?: string | null
          parcours_formation_url?: string | null
          prenom: string
          profile_id?: string | null
          siret?: string | null
          statut?: Database["public"]["Enums"]["candidature_statut"]
          telephone?: string | null
          traitee_at?: string | null
        }
        Update: {
          adresse?: string | null
          assigne_a?: string | null
          assigne_nom?: string | null
          commentaire_admin?: string | null
          created_at?: string
          cv_url?: string | null
          date_naissance?: string | null
          deroule_pedagogique_url?: string | null
          email?: string
          expertise?: string | null
          id?: string
          message?: string | null
          nom?: string
          numero_nda?: string | null
          parcours_formation?: string | null
          parcours_formation_url?: string | null
          prenom?: string
          profile_id?: string | null
          siret?: string | null
          statut?: Database["public"]["Enums"]["candidature_statut"]
          telephone?: string | null
          traitee_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidatures_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      demandes_budget: {
        Row: {
          assigne_a: string | null
          assigne_nom: string | null
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
          assigne_a?: string | null
          assigne_nom?: string | null
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
          assigne_a?: string | null
          assigne_nom?: string | null
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
      demandes_contact: {
        Row: {
          assigne_a: string | null
          assigne_nom: string | null
          budget_estime: string | null
          created_at: string
          disponibilites: string | null
          email: string
          formation_souhaitee: string | null
          id: string
          message: string | null
          nom: string
          note_admin: string | null
          objectif: string | null
          prenom: string
          profil: string | null
          statut: Database["public"]["Enums"]["budget_statut"]
          telephone: string | null
        }
        Insert: {
          assigne_a?: string | null
          assigne_nom?: string | null
          budget_estime?: string | null
          created_at?: string
          disponibilites?: string | null
          email: string
          formation_souhaitee?: string | null
          id?: string
          message?: string | null
          nom: string
          note_admin?: string | null
          objectif?: string | null
          prenom: string
          profil?: string | null
          statut?: Database["public"]["Enums"]["budget_statut"]
          telephone?: string | null
        }
        Update: {
          assigne_a?: string | null
          assigne_nom?: string | null
          budget_estime?: string | null
          created_at?: string
          disponibilites?: string | null
          email?: string
          formation_souhaitee?: string | null
          id?: string
          message?: string | null
          nom?: string
          note_admin?: string | null
          objectif?: string | null
          prenom?: string
          profil?: string | null
          statut?: Database["public"]["Enums"]["budget_statut"]
          telephone?: string | null
        }
        Relationships: []
      }
      demandes_droits_formation: {
        Row: {
          assigne_a: string | null
          assigne_nom: string | null
          budget_estime: string | null
          created_at: string
          disponibilites: string | null
          dispositifs: string[] | null
          email: string
          formation_visee: string | null
          id: string
          message: string | null
          nom: string
          note_admin: string | null
          objectif_professionnel: string | null
          prenom: string
          situation: string | null
          statut: Database["public"]["Enums"]["budget_statut"]
          statut_pro: string | null
          telephone: string | null
        }
        Insert: {
          assigne_a?: string | null
          assigne_nom?: string | null
          budget_estime?: string | null
          created_at?: string
          disponibilites?: string | null
          dispositifs?: string[] | null
          email: string
          formation_visee?: string | null
          id?: string
          message?: string | null
          nom: string
          note_admin?: string | null
          objectif_professionnel?: string | null
          prenom: string
          situation?: string | null
          statut?: Database["public"]["Enums"]["budget_statut"]
          statut_pro?: string | null
          telephone?: string | null
        }
        Update: {
          assigne_a?: string | null
          assigne_nom?: string | null
          budget_estime?: string | null
          created_at?: string
          disponibilites?: string | null
          dispositifs?: string[] | null
          email?: string
          formation_visee?: string | null
          id?: string
          message?: string | null
          nom?: string
          note_admin?: string | null
          objectif_professionnel?: string | null
          prenom?: string
          situation?: string | null
          statut?: Database["public"]["Enums"]["budget_statut"]
          statut_pro?: string | null
          telephone?: string | null
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
      dossier_historique: {
        Row: {
          ancien_statut: Database["public"]["Enums"]["crm_statut"] | null
          auteur_id: string | null
          commentaire: string | null
          created_at: string
          dossier_id: string
          id: string
          nouveau_statut: Database["public"]["Enums"]["crm_statut"]
        }
        Insert: {
          ancien_statut?: Database["public"]["Enums"]["crm_statut"] | null
          auteur_id?: string | null
          commentaire?: string | null
          created_at?: string
          dossier_id: string
          id?: string
          nouveau_statut: Database["public"]["Enums"]["crm_statut"]
        }
        Update: {
          ancien_statut?: Database["public"]["Enums"]["crm_statut"] | null
          auteur_id?: string | null
          commentaire?: string | null
          created_at?: string
          dossier_id?: string
          id?: string
          nouveau_statut?: Database["public"]["Enums"]["crm_statut"]
        }
        Relationships: [
          {
            foreignKeyName: "dossier_historique_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      dossier_pieces: {
        Row: {
          code: string
          created_at: string
          dossier_id: string
          fichier_url: string | null
          formateur_id: string
          generated_at: string | null
          id: string
          remarque: string | null
          statut: Database["public"]["Enums"]["piece_statut"]
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          dossier_id: string
          fichier_url?: string | null
          formateur_id: string
          generated_at?: string | null
          id?: string
          remarque?: string | null
          statut?: Database["public"]["Enums"]["piece_statut"]
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          dossier_id?: string
          fichier_url?: string | null
          formateur_id?: string
          generated_at?: string | null
          id?: string
          remarque?: string | null
          statut?: Database["public"]["Enums"]["piece_statut"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dossier_pieces_dossier_id_fkey"
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
          commentaire_admin: string | null
          created_at: string
          date_debut: string | null
          date_fin: string | null
          documents_json: Json
          donnees: Json
          dossier_nom: string | null
          drive_folder_url: string | null
          entreprise_nom: string | null
          entreprise_siret: string | null
          formateur_id: string
          id: string
          statut: Database["public"]["Enums"]["dossier_statut"]
          statut_crm: Database["public"]["Enums"]["crm_statut"]
          tally_submission_id: string | null
          titre_formation: string | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          commentaire_admin?: string | null
          created_at?: string
          date_debut?: string | null
          date_fin?: string | null
          documents_json?: Json
          donnees?: Json
          dossier_nom?: string | null
          drive_folder_url?: string | null
          entreprise_nom?: string | null
          entreprise_siret?: string | null
          formateur_id: string
          id?: string
          statut?: Database["public"]["Enums"]["dossier_statut"]
          statut_crm?: Database["public"]["Enums"]["crm_statut"]
          tally_submission_id?: string | null
          titre_formation?: string | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          commentaire_admin?: string | null
          created_at?: string
          date_debut?: string | null
          date_fin?: string | null
          documents_json?: Json
          donnees?: Json
          dossier_nom?: string | null
          drive_folder_url?: string | null
          entreprise_nom?: string | null
          entreprise_siret?: string | null
          formateur_id?: string
          id?: string
          statut?: Database["public"]["Enums"]["dossier_statut"]
          statut_crm?: Database["public"]["Enums"]["crm_statut"]
          tally_submission_id?: string | null
          titre_formation?: string | null
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
          adresse: string | null
          created_at: string
          cv_url: string | null
          date_naissance: string | null
          deroule_pedagogique_url: string | null
          email: string
          entreprise: string | null
          entreprise_adresse: string | null
          id: string
          nda_document_url: string | null
          nda_region: string | null
          nom: string
          numero_nda: string | null
          parcours_formation: string | null
          parcours_formation_url: string | null
          photo_url: string | null
          prenom: string
          siret: string | null
          statut_candidature: Database["public"]["Enums"]["candidature_statut"]
          telephone: string | null
          updated_at: string
        }
        Insert: {
          adresse?: string | null
          created_at?: string
          cv_url?: string | null
          date_naissance?: string | null
          deroule_pedagogique_url?: string | null
          email?: string
          entreprise?: string | null
          entreprise_adresse?: string | null
          id: string
          nda_document_url?: string | null
          nda_region?: string | null
          nom?: string
          numero_nda?: string | null
          parcours_formation?: string | null
          parcours_formation_url?: string | null
          photo_url?: string | null
          prenom?: string
          siret?: string | null
          statut_candidature?: Database["public"]["Enums"]["candidature_statut"]
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          adresse?: string | null
          created_at?: string
          cv_url?: string | null
          date_naissance?: string | null
          deroule_pedagogique_url?: string | null
          email?: string
          entreprise?: string | null
          entreprise_adresse?: string | null
          id?: string
          nda_document_url?: string | null
          nda_region?: string | null
          nom?: string
          numero_nda?: string | null
          parcours_formation?: string | null
          parcours_formation_url?: string | null
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
      candidature_statut: "en_attente" | "valide" | "refuse" | "en_cours"
      crm_statut:
        | "brouillon"
        | "demande_validation"
        | "dossier_valide"
        | "demande_financement"
        | "accord_financement"
        | "finalisation_administrative"
        | "paiement"
        | "paiement_formateur"
        | "refuse"
      document_type: "signe" | "accord_financement" | "qualiopi_final"
      dossier_statut:
        | "brouillon"
        | "en_cours_generation"
        | "documents_generes"
        | "documents_signes"
        | "financement_depose"
        | "complet"
        | "archive"
      piece_statut:
        | "a_generer"
        | "en_attente_tally"
        | "rapport_a_classer"
        | "complete"
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
      candidature_statut: ["en_attente", "valide", "refuse", "en_cours"],
      crm_statut: [
        "brouillon",
        "demande_validation",
        "dossier_valide",
        "demande_financement",
        "accord_financement",
        "finalisation_administrative",
        "paiement",
        "paiement_formateur",
        "refuse",
      ],
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
      piece_statut: [
        "a_generer",
        "en_attente_tally",
        "rapport_a_classer",
        "complete",
      ],
    },
  },
} as const
