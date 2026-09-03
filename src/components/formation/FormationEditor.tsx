import { useState } from "react";
import { ExternalLink, ImagePlus, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES } from "@/data/catalogue";
import { supabase } from "@/integrations/supabase/client";
import {
  FORMAT_OPTIONS,
  TARIF_UNITES,
  parseProgramme,
  slugify,
  visuelUrl,
  type FormationCatalogue,
  type ModuleProgramme,
} from "@/lib/formations";

type Props = {
  value: FormationCatalogue;
  saving?: boolean;
  onSave: (patch: Partial<FormationCatalogue>) => void;
};

function Field({
  label,
  value,
  onChange,
  type = "text",
  hint,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={`grid gap-2 ${className ?? ""}`}>
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Area({
  label,
  value,
  onChange,
  rows = 4,
  hint,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={`grid gap-2 ${className ?? ""}`}>
      <Label>{label}</Label>
      <Textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function ImageField({
  label,
  hint,
  path,
  busy,
  onFile,
}: {
  label: string;
  hint?: string;
  path: string | null;
  busy?: boolean;
  onFile: (file: File) => void;
}) {
  const url = visuelUrl(path);
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border p-4">
      <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
        {url ? (
          <img src={url} alt={label} className="size-full object-cover" />
        ) : (
          <ImagePlus className="size-6 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{hint ?? "JPG ou PNG, 10 Mo maximum"}</p>
      </div>
      <label>
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFile(file);
            event.target.value = "";
          }}
        />
        <span className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">
          <ImagePlus className="size-3.5" /> {busy ? "Envoi…" : url ? "Remplacer" : "Charger"}
        </span>
      </label>
    </div>
  );
}

const num = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")));
const str = (v: number | null | undefined) => (v === null || v === undefined ? "" : String(v));

export function FormationEditor({ value, saving, onSave }: Props) {
  const [f, setF] = useState<FormationCatalogue>(value);
  const [programme, setProgramme] = useState<ModuleProgramme[]>(parseProgramme(value.programme));
  const [uploading, setUploading] = useState<string | null>(null);

  const [syncRef, setSyncRef] = useState(value);
  if (value !== syncRef) {
    setSyncRef(value);
    setF(value);
    setProgramme(parseProgramme(value.programme));
  }

  function set<K extends keyof FormationCatalogue>(key: K, v: FormationCatalogue[K]) {
    setF((prev) => ({ ...prev, [key]: v }));
  }

  async function upload(kind: "visuel" | "photo", file: File) {
    setUploading(kind);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${f.formateur_id}/${f.id}-${kind}.${ext}`;
    const { error } = await supabase.storage
      .from("formations")
      .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });
    setUploading(null);
    if (error) {
      toast.error("Envoi de l'image impossible.");
      return;
    }
    const colonne = kind === "visuel" ? "visuel_url" : "photo_formateur_url";
    set(colonne, path);
    onSave({ [colonne]: path } as Partial<FormationCatalogue>);
  }

  function submit() {
    const titre = f.titre.trim();
    if (!titre) {
      toast.error("Le titre de la formation est requis.");
      return;
    }
    if (f.publiee && (!f.intro?.trim() || f.tarif_ht === null)) {
      toast.error("Pour publier la page, renseignez la présentation et le tarif.");
      return;
    }
    onSave({
      titre,
      slug: slugify(f.slug || titre),
      categorie: f.categorie,
      intro: f.intro,
      objectif: f.objectif,
      objectifs: (f.objectifs ?? []).filter((o) => o.trim()),
      prerequis: f.prerequis,
      niveau: f.niveau,
      public_cible: f.public_cible,
      duree_heures: f.duree_heures,
      duree_jours: f.duree_jours,
      format: f.format,
      lieu_defaut: f.lieu_defaut,
      lien_connexion: f.lien_connexion,
      modalites: (f.modalites ?? []).filter((m) => m.trim()),
      moyens_pedagogiques: f.moyens_pedagogiques,
      modalites_evaluation: f.modalites_evaluation,
      accessibilite: f.accessibilite,
      programme: programme.filter((m) => m.titre.trim() || m.points.length),
      certification: f.certification,
      tarif_ht: f.tarif_ht,
      tarif_unite: f.tarif_unite,
      tarif_details: f.tarif_details,
      tva: f.tva,
      cout_horaire: f.cout_horaire,
      formateur_nom: f.formateur_nom,
      formateur_bio: f.formateur_bio,
      publiee: f.publiee,
      inscriptions_ouvertes: f.inscriptions_ouvertes,
    });
  }

  const listeTexte = (list: string[] | null) => (list ?? []).join("\n");

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="text-base font-semibold sm:col-span-2">Identité de la formation</h2>
          <Field
            label="Titre de la formation"
            value={f.titre}
            onChange={(v) => set("titre", v)}
            className="sm:col-span-2"
          />
          <div className="grid gap-2">
            <Label>Catégorie</Label>
            <Select
              value={f.categorie ?? ""}
              onValueChange={(v) => set("categorie", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Field
            label="Adresse de la page publique"
            value={f.slug}
            onChange={(v) => set("slug", v)}
            hint={`/formations/${slugify(f.slug || f.titre)}`}
          />
          <Area
            label="Présentation (affichée sur le site)"
            value={f.intro ?? ""}
            onChange={(v) => set("intro", v)}
            className="sm:col-span-2"
          />
          <SelectAutre
            label="Niveau"
            value={f.niveau ?? ""}
            onChange={(v) => set("niveau", v)}
            options={NIVEAUX_OPTIONS}
            rows={2}
          />
          <SelectAutre
            label="Public visé"
            value={f.public_cible ?? ""}
            onChange={(v) => set("public_cible", v)}
            options={PUBLICS_OPTIONS}
            rows={2}
          />
          <Area
            label="Objectif général"
            value={f.objectif ?? ""}
            onChange={(v) => set("objectif", v)}
            rows={3}
          />
          <Area
            label="Objectifs pédagogiques (un par ligne)"
            value={listeTexte(f.objectifs)}
            onChange={(v) => set("objectifs", v.split("\n"))}
            rows={3}
          />
          <Area
            label="Prérequis"
            value={f.prerequis ?? ""}
            onChange={(v) => set("prerequis", v)}
            rows={2}
            className="sm:col-span-2"
          />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="text-base font-semibold sm:col-span-2">Organisation & Qualiopi</h2>
          <Field
            label="Durée totale (heures)"
            value={str(f.duree_heures)}
            onChange={(v) => set("duree_heures", num(v))}
          />
          <Field
            label="Nombre de jours"
            value={str(f.duree_jours)}
            onChange={(v) => set("duree_jours", num(v))}
          />
          <div className="grid gap-2">
            <Label>Modalité</Label>
            <Select value={f.format} onValueChange={(v) => set("format", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMAT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Field
            label="Lieu par défaut"
            value={f.lieu_defaut ?? ""}
            onChange={(v) => set("lieu_defaut", v)}
          />
          <SelectAutre
            label="Modalités pédagogiques"
            value={listeTexte(f.modalites)}
            onChange={(v) => set("modalites", [v])}
            options={MODALITES_OPTIONS}
          />
          <SelectAutre
            label="Moyens pédagogiques et techniques"
            value={f.moyens_pedagogiques ?? ""}
            onChange={(v) => set("moyens_pedagogiques", v)}
            options={MOYENS_OPTIONS}
          />
          <SelectAutre
            label="Modalités d'évaluation"
            value={f.modalites_evaluation ?? ""}
            onChange={(v) => set("modalites_evaluation", v)}
            options={EVALUATION_OPTIONS}
          />
          <SelectAutre
            label="Certification visée (ex. ICDL)"
            value={f.certification ?? ""}
            onChange={(v) => set("certification", v)}
            options={certificationsOptions}
            placeholder="Aucune certification"
            className="sm:col-span-2"
          />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="p-6">
          <h2 className="text-base font-semibold">Programme détaillé</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Six modules : indiquez un titre et le contenu de chacun. Les modules laissés vides ne
            sont pas affichés sur la page publique.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {modules.map((module, index) => (
              <div key={index} className="grid gap-3 rounded-xl border border-border p-4">
                <Field
                  label={`Module ${index + 1} — titre`}
                  value={module.titre}
                  onChange={(v) => majModule(index, { titre: v })}
                />
                <Area
                  label="Contenu (un point par ligne)"
                  value={module.points.join("\n")}
                  onChange={(v) => majModule(index, { points: v.split("\n") })}
                  rows={4}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="text-base font-semibold sm:col-span-2">Tarifs</h2>
          <Field
            label="Tarif HT"
            value={str(f.tarif_ht)}
            onChange={(v) => set("tarif_ht", num(v))}
          />
          <Area
            label="Précisions tarifaires affichées sur le site"
            value={f.tarif_details ?? ""}
            onChange={(v) => set("tarif_details", v)}
            rows={2}
            className="sm:col-span-2"
          />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="grid gap-4 p-6">
          <h2 className="text-base font-semibold">Visuels et formateur</h2>
          <ImageField
            label="Visuel de la formation"
            hint="Repris sur la page publique et en en-tête des documents Qualiopi"
            path={f.visuel_url}
            busy={uploading === "visuel"}
            onFile={(file) => void upload("visuel", file)}
          />
          <ImageField
            label="Photo du formateur"
            hint="Affichée sur la page publique de la formation"
            path={f.photo_formateur_url}
            busy={uploading === "photo"}
            onFile={(file) => void upload("photo", file)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Nom affiché du formateur"
              value={f.formateur_nom ?? ""}
              onChange={(v) => set("formateur_nom", v)}
            />
            <Area
              label="Présentation du formateur"
              value={f.formateur_bio ?? ""}
              onChange={(v) => set("formateur_bio", v)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="grid gap-4 p-6">
          <h2 className="text-base font-semibold">Publication sur le site Skills4mation</h2>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/40 p-4">
            <Badge variant={PUBLICATION_BADGE[etatPublication].variant}>
              {PUBLICATION_BADGE[etatPublication].label}
            </Badge>
            <p className="text-xs text-muted-foreground">
              La parution sur le site est validée par l'équipe Skills4mation.
            </p>
          </div>
          {value.publication_motif && etatPublication === "refusee" ? (
            <p className="text-sm text-destructive">Motif : {value.publication_motif}</p>
          ) : null}
          {etatPublication === "en_attente" ? (
            <Button
              variant="outline"
              className="justify-self-start"
              disabled={saving}
              onClick={() => onSave({ publication_statut: "brouillon" })}
            >
              Annuler ma demande de parution
            </Button>
          ) : etatPublication === "publiee" ? null : (
            <Button
              variant="cta"
              className="justify-self-start"
              disabled={saving}
              onClick={() => {
                if (!f.intro?.trim() || f.tarif_ht === null) {
                  toast.error("Pour demander la parution, renseignez la présentation et le tarif.");
                  return;
                }
                onSave({ publication_statut: "en_attente" });
              }}
            >
              Demander la parution sur le site
            </Button>
          )}
          <label className="flex items-start gap-3 text-sm">
            <Checkbox
              checked={f.inscriptions_ouvertes}
              onCheckedChange={(v) => set("inscriptions_ouvertes", Boolean(v))}
              className="mt-0.5"
            />
            <span>Autoriser les apprenants à s'inscrire depuis la page</span>
          </label>
          {value.publiee ? (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/40 p-4 text-sm">
              <span className="font-mono text-xs">/formations/{value.slug}</span>
              <Button asChild variant="outline" size="sm">
                <a href={`/formations/${value.slug}`} target="_blank" rel="noopener">
                  <ExternalLink className="mr-1.5 size-3.5" /> Voir la page
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  void navigator.clipboard.writeText(
                    `${window.location.origin}/formations/${value.slug}`,
                  );
                  toast.success("Lien d'inscription copié.");
                }}
              >
                Copier le lien apprenant
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="cta" disabled={saving} onClick={submit}>
          <Save className="mr-1.5 size-4" />
          {saving ? "Enregistrement…" : "Enregistrer la formation"}
        </Button>
      </div>
    </div>
  );
}
