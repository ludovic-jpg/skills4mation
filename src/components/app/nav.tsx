import {
  BarChart3,
  BookOpen,
  FilePlus2,
  GraduationCap,
  FolderKanban,
  Folders,
  Handshake,
  Inbox,
  LayoutDashboard,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

import type { NavItem } from "@/components/app/AppShell";

export const FORMATEUR_NAV: NavItem[] = [
  { to: "/espace", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/espace/formations", label: "Mes formations", icon: BookOpen },
  { to: "/espace/dossiers", label: "Mes dossiers", icon: Folders },
  { to: "/espace/dossiers/new", label: "Nouveau dossier", icon: FilePlus2 },
  { to: "/espace/parrainage", label: "Programme Ambassadeur", icon: Handshake },
  { to: "/espace/candidature", label: "Ma candidature", icon: Users },
  { to: "/espace/profil", label: "Mon profil", icon: UserCog },
];

export const CANDIDAT_NAV: NavItem[] = [
  { to: "/espace/candidature", label: "Ma candidature", icon: Users },
  { to: "/espace/profil", label: "Mon profil", icon: UserCog },
];

export const APPRENANT_NAV: NavItem[] = [
  { to: "/apprenant", label: "Mon espace apprenant", icon: GraduationCap },
];

export const ADMIN_NAV: NavItem[] = [
  { to: "/admin/validation", label: "File de validation", icon: ShieldCheck },
  { to: "/admin", label: "Candidatures", icon: Users },
  { to: "/admin/pilotage", label: "Pilotage", icon: BarChart3 },
  { to: "/admin/demandes", label: "Toutes les demandes", icon: Inbox },
  { to: "/admin/dossiers", label: "CRM dossiers", icon: FolderKanban },
  { to: "/espace", label: "Espace formateur", icon: Folders },
];

export const SUPER_ADMIN_NAV: NavItem[] = [
  ...ADMIN_NAV.slice(0, 5),
  { to: "/admin/comptes", label: "Comptes & rôles", icon: ShieldCheck },
  { to: "/espace", label: "Espace formateur", icon: Folders },
];
