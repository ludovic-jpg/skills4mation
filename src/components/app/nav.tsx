import {
  Award,
  Banknote,
  ClipboardList,
  BarChart3,
  BookOpen,
  FilePlus2,
  GraduationCap,
  FolderKanban,
  Folders,
  Handshake,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

import type { NavItem } from "@/components/app/AppShell";

export const FORMATEUR_NAV: NavItem[] = [
  { to: "/espace", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/espace/profil", label: "Profil / Pièces de candidature", icon: UserCog },
  { to: "/espace/instructions", label: "Instructions", icon: LifeBuoy },
  { to: "/espace/candidature", label: "Ma candidature", icon: Users },
  { to: "/espace/formations", label: "Mes formations", icon: BookOpen },
  { to: "/espace/dossiers", label: "Mes dossiers", icon: Folders },
  { to: "/espace/dossiers/new", label: "Nouveau dossier", icon: FilePlus2 },
  { to: "/espace/financement", label: "Convention & financement", icon: Banknote },
  { to: "/espace/outils", label: "Mes outils pédagogiques", icon: ClipboardList },
  { to: "/espace/parrainage", label: "Programme ambassadeur", icon: Handshake },
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
  { to: "/admin/pilotage", label: "Pilotage", icon: BarChart3 },
  { to: "/admin/dossiers", label: "CRM dossiers", icon: FolderKanban },
  { to: "/admin/financements", label: "Demandes de financement", icon: Banknote },
  { to: "/admin/demandes", label: "Toutes les demandes", icon: Inbox },
  { to: "/admin/reclamations", label: "Réclamations & aléas", icon: MessageSquareWarning },
  { to: "/admin", label: "Candidatures", icon: Users },
  { to: "/espace", label: "Espace formateur", icon: Folders },
];

export const SUPER_ADMIN_NAV: NavItem[] = [
  ...ADMIN_NAV.slice(0, 7),
  { to: "/admin/certifications", label: "Certifications", icon: Award },
  { to: "/admin/comptes", label: "Comptes & rôles", icon: ShieldCheck },
  { to: "/espace", label: "Espace formateur", icon: Folders },
];


export function adminNav({ isSuperAdmin, isConseillere }: { isSuperAdmin: boolean; isConseillere: boolean }): NavItem[] {
  if (isSuperAdmin) return SUPER_ADMIN_NAV;
  // La conseillère de formation n'a pas accès au pilotage financier complet.
  if (isConseillere) return ADMIN_NAV.filter((item) => item.to !== "/admin/pilotage");
  return ADMIN_NAV;
}
