import { auth, defineMcp } from "@lovable.dev/mcp-js";

import getDossierTool from "./tools/get-dossier";
import listDossiersTool from "./tools/list-dossiers";
import listMesFormationsTool from "./tools/list-mes-formations";
import searchCatalogueTool from "./tools/search-catalogue";
import updateDossierStatutTool from "./tools/update-dossier-statut";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "skills4mation-hub",
  title: "Skills4mation Hub",
  version: "0.1.0",
  instructions:
    "Outils Skills4mation (portage Qualiopi). Utilisez `list_dossiers` et `get_dossier` pour consulter les dossiers de formation du formateur connecté, `update_dossier_statut_crm` pour les faire avancer dans le pipeline CRM, `list_mes_formations` pour ses formations enregistrées et `search_catalogue` pour le catalogue public.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listDossiersTool,
    getDossierTool,
    updateDossierStatutTool,
    listMesFormationsTool,
    searchCatalogueTool,
  ],
});
