import {
  FilePlus2,
  FolderKanban,
  Folders,
  LayoutDashboard,
  UserCog,
  Users,
} from "lucide-react";

import type { NavItem } from "@/components/app/AppShell";

export const FORMATEUR_NAV: NavItem[] = [
  { to: "/espace", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/espace/dossiers", label: "Mes dossiers", icon: Folders },
  { to: "/espace/dossiers/new", label: "Nouveau dossier", icon: FilePlus2 },
  { to: "/espace/candidature", label: "Ma candidature", icon: Users },
  { to: "/espace/profil", label: "Mon profil", icon: UserCog },
];

export const CANDIDAT_NAV: NavItem[] = [
  { to: "/espace/candidature", label: "Ma candidature", icon: Users },
  { to: "/espace/profil", label: "Mon profil", icon: UserCog },
];

export const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "Candidatures", icon: Users },
  { to: "/admin/dossiers", label: "CRM dossiers", icon: FolderKanban },
  { to: "/espace", label: "Espace formateur", icon: Folders },
];
