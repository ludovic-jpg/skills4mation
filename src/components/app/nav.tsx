import {
  Award,
  Banknote,
  ClipboardList,
  BarChart3,
  Smile,
  BookOpen,
  FilePlus2,
  FileSpreadsheet,
  GraduationCap,
  HeartHandshake,
  FolderKanban,
  Folders,
  Handshake,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  MessageSquareWarning,
  MessagesSquare,
  Radar,

  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

import type { NavItem } from "@/components/app/AppShell";

export const FORMATEUR_NAV: NavItem[] = [
  { to: "/espace", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/espace/instructions", label: "Instructions", icon: LifeBuoy },
  { to: "/espace/profil", label: "Profil / Pièces de candidature", icon: UserCog },
  { to: "/espace/formations", label: "Mes formations", icon: BookOpen },
  { to: "/espace/outils", label: "Mes outils pédagogiques", icon: ClipboardList },
  { to: "/espace/communication", label: "Communication avec Apprenant", icon: MessagesSquare },

  { to: "/espace/dossiers", label: "Mes dossiers", icon: Folders },
  { to: "/espace/dossiers/new", label: "Nouveau dossier", icon: FilePlus2 },
  

  { to: "/espace/parrainage", label: "Programme ambassadeur", icon: Handshake },
];

export const CANDIDAT_NAV: NavItem[] = [
  { to: "/espace/instructions", label: "Instructions", icon: LifeBuoy },
  { to: "/espace/profil", label: "Mon profil / Ma candidature", icon: UserCog },
];

export const APPRENANT_NAV: NavItem[] = [
  { to: "/apprenant", label: "Mon espace apprenant", icon: GraduationCap },
];

const ADMIN_BASE: NavItem[] = [
  { to: "/admin/validation", label: "File de validation", icon: ShieldCheck },
  { to: "/admin/formations", label: "Parutions formations", icon: BookOpen },
  { to: "/admin/pilotage", label: "Pilotage", icon: BarChart3 },
  { to: "/admin/dossiers", label: "CRM dossiers", icon: FolderKanban },
  { to: "/admin/financements", label: "Demandes de financement", icon: Banknote },
  { to: "/admin/bpf", label: "Bilan Pédagogique (BPF)", icon: FileSpreadsheet },
  { to: "/admin/demandes", label: "Toutes les demandes", icon: Inbox },
  { to: "/admin/reclamations", label: "Réclamations & aléas", icon: MessageSquareWarning },
  { to: "/admin/satisfaction", label: "Satisfaction agrégée", icon: Smile },
  { to: "/admin/handicap", label: "Référent handicap", icon: HeartHandshake },
  { to: "/admin/veille", label: "Veille réglementaire", icon: Radar },
  { to: "/admin", label: "Candidatures", icon: Users },
];

/** Navigation complète de l'équipe : le conseiller formation a tous les droits. */
export const ADMIN_NAV: NavItem[] = [
  ...ADMIN_BASE,
  { to: "/admin/certifications", label: "Certifications", icon: Award },
  { to: "/admin/comptes", label: "Comptes & rôles", icon: ShieldCheck },
  { to: "/espace", label: "Espace formateur", icon: Folders },
];

export function adminNav(): NavItem[] {
  return ADMIN_NAV;
}
