import {
  BookOpen,
  FilePlus2,
  GraduationCap,
  FolderKanban,
  Folders,
  Inbox,
  LayoutDashboard,
  UserCog,
  Users,
} from "lucide-react";

import type { NavItem } from "@/components/app/AppShell";

export const FORMATEUR_NAV: NavItem[] = [
  { to: "/espace", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/espace/formations", label: "Mes formations", icon: BookOpen },
  { to: "/espace/dossiers", label: "Mes dossiers", icon: Folders },
  { to: "/espace/dossiers/new", label: "Nouveau dossier", icon: FilePlus2 },
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
  { to: "/admin", label: "Candidatures", icon: Users },
  { to: "/admin/demandes", label: "Toutes les demandes", icon: Inbox },
  { to: "/admin/dossiers", label: "CRM dossiers", icon: FolderKanban },
  { to: "/espace", label: "Espace formateur", icon: Folders },
];
