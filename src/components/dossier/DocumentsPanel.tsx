import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Archive, Download, FolderTree, Mail, Printer } from "lucide-react";
import JSZip from "jszip";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { docFileName, documentsApplicables } from "@/lib/dossier/html";
import { nomRangement, type DossierDonnees } from "@/lib/dossier/types";

export function DocumentsPanel({
  dossierId,
  formateurId,
  donnees,
}: {
  dossierId: string;
  formateurId: string;
  donnees: DossierDonnees;
}) {
  const docs = useMemo(() => documentsApplicables(donnees), [donnees]);
  const [active, setActive] = useState(docs[0]?.code ?? "1A");
  const [zipping, setZipping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [apprenantRangement, setApprenantRangement] = useState(donnees.apprenants[0]?.nom ?? "");
  const frameRef = useRef<HTMLIFrameElement>(null);

  const current = docs.find((d) => d.code === active) ?? docs[0];
  const html = current ? current.build(donnees) : "";

  function imprimer() {
    const win = frameRef.current?.contentWindow;
    if (!win) return;
    win.focus();
    win.print();
  }

  function telecharger() {
    if (!current) return;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = docFileName(current.code, donnees);
    a.click();
    URL.revokeObjectURL(url);
  }

  function envoyer() {
    if (!current) return;
    const to = current
      .destinataires(donnees)
      .map((x) => x.trim())
      .filter(Boolean);
    if (to.length === 0) {
      toast.error("Aucun e-mail renseigné pour ce document.");
      return;
    }
    const sujet = `${current.code} — ${current.label} — ${donnees.formation.titre || "Formation"}`;
    const corps = [
      "Bonjour,",
      "",
      `Vous trouverez ci-joint le document « ${current.label} » relatif à la formation « ${donnees.formation.titre} ».`,
      "",
      "Merci de télécharger le document depuis le portail puis de le joindre à cet e-mail avant envoi.",
      "",
      `${donnees.formateur.prenom} ${donnees.formateur.nom} — ${donnees.organisme}`,
    ].join("\n");
    window.location.href = `mailto:${encodeURIComponent(to.join(","))}?subject=${encodeURIComponent(
      sujet,
    )}&body=${encodeURIComponent(corps)}`;
  }

  async function exportZip() {
    setZipping(true);
    try {
      const zip = new JSZip();
      for (const doc of docs) zip.file(docFileName(doc.code, donnees), doc.build(donnees));
      zip.file(
        "etat-du-dossier.csv",
        ["Code;Document", ...docs.map((d) => `${d.code};${d.label}`)].join("\n"),
      );
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dossier-${donnees.adf || dossierId.slice(0, 8)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Dossier complet exporté.");
    } catch {
      toast.error("Export ZIP impossible.");
    } finally {
      setZipping(false);
    }
  }

  const baseRangement = nomRangement(
    apprenantRangement,
    donnees.formation.titre,
    donnees.formation.dateFin || donnees.formation.dateDebut,
  );

  async function classerRapport(file: File) {
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "pdf";
    const path = `${formateurId}/${dossierId}/evaluations/${baseRangement}.${ext}`;
    const { error } = await supabase.storage.from("documents").upload(path, file);
    if (error) {
      setUploading(false);
      toast.error("Classement impossible (le fichier existe peut-être déjà).");
      return;
    }
    const { error: insertError } = await supabase.from("documents_dossier").insert({
      dossier_id: dossierId,
      formateur_id: formateurId,
      type: "qualiopi_final",
      fichier_url: path,
      nom_fichier: `${baseRangement}.${ext}`,
    });
    setUploading(false);
    if (insertError) {
      toast.error("Le rapport n'a pas pu être rattaché au dossier.");
      return;
    }
    toast.success(`Rapport classé sous ${baseRangement}.${ext}`);
  }

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Documents générés</h2>
              <p className="text-sm text-muted-foreground">
                {docs.length} documents pré-remplis avec les données du dossier.
              </p>
            </div>
            <Button variant="cta" disabled={zipping} onClick={() => void exportZip()}>
              <Archive className="mr-1.5 size-4" />
              {zipping ? "Préparation…" : "Export ZIP du dossier"}
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {docs.map((doc) => (
              <Button
                key={doc.code}
                size="sm"
                variant={doc.code === active ? "teal" : "outline"}
                onClick={() => setActive(doc.code)}
              >
                {doc.code} — {doc.label}
              </Button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="cta" onClick={imprimer}>
              <Printer className="mr-1.5 size-4" /> Imprimer / Exporter en PDF
            </Button>
            <Button size="sm" variant="outline" onClick={telecharger}>
              <Download className="mr-1.5 size-4" /> Télécharger le HTML
            </Button>
            <Button size="sm" variant="outline" onClick={envoyer}>
              <Mail className="mr-1.5 size-4" /> Envoyer par e-mail
            </Button>
          </div>

          <iframe
            ref={frameRef}
            title={`Aperçu ${current?.label ?? ""}`}
            srcDoc={html}
            className="mt-4 h-[900px] w-full rounded-xl border border-border bg-white"
          />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <FolderTree className="size-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">
              Classement automatique des rapports d'évaluation (F0B / F6)
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Les rapports et certificats déposés sont renommés et rangés au format
            [Nom_Apprenant]_[Nom_Formation]_[Date].
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Apprenant concerné</Label>
              <Input
                value={apprenantRangement}
                onChange={(event) => setApprenantRangement(event.target.value)}
                placeholder="Prénom et nom"
                list="apprenants-dossier"
              />
              <datalist id="apprenants-dossier">
                {donnees.apprenants.map((a, i) => (
                  <option key={i} value={a.nom} />
                ))}
              </datalist>
            </div>
            <div className="grid gap-2">
              <Label>Rapport ou certificat</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.xlsx,.png,.jpg"
                disabled={uploading || !apprenantRangement}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void classerRapport(file);
                }}
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Nom de rangement : <code>{baseRangement}</code>
            {uploading ? " — classement en cours…" : null}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
