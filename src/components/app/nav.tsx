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
  MessageSquareWarning,
  MessagesSquare,


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
  { to: "/admin/demandes", label: "Toutes les demandes", icon: Inbox },
  { to: "/admin/reclamations", label: "Réclamations & aléas", icon: MessageSquareWarning },
  { to: "/admin", label: "Candidatures", icon: Users },
];

export const ADMIN_NAV: NavItem[] = [
  ...ADMIN_BASE,
  { to: "/espace", label: "Espace formateur", icon: Folders },
];

export const SUPER_ADMIN_NAV: NavItem[] = [
  ...ADMIN_BASE,
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
