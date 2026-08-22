import { FilePlus2, FolderKanban, LayoutDashboard, UserCog, Users } from "lucide-react";

import type { NavItem } from "@/components/app/AppShell";

export const FORMATEUR_NAV: NavItem[] = [
  { to: "/espace", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/espace/dossiers/new", label: "Nouveau dossier", icon: FilePlus2 },
  { to: "/espace/profil", label: "Mon profil", icon: UserCog },
];

export const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "Candidatures", icon: Users },
  { to: "/espace", label: "Espace formateur", icon: FolderKanban },
];
