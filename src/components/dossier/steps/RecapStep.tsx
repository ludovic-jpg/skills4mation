import type { DossierDonnees } from "@/lib/dossier/types";

function Ligne({ label, value }: { label: string; value?: string | undefined }) {
  return (
    <div className="grid grid-cols-[minmax(0,180px)_1fr] gap-3 py-1 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value?.trim() ? value : "—"}</dd>
    </div>
  );
}

function Bloc({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border/70 p-4">
      <h3 className="text-sm font-semibold">{titre}</h3>
      <dl className="mt-2 divide-y divide-border/50">{children}</dl>
    </section>
  );
}

const MODES: Record<string, string> = {
  opco: "OPCO / entreprise",
  cpf: "CPF",
  fonds_propres: "Fonds propres",
};

export function RecapStep({ d }: { d: DossierDonnees }) {
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        Vérifiez la synthèse ci-dessous avant de valider le dossier. Chaque modification est
        enregistrée automatiquement.
      </p>

      <Bloc titre="Entreprise cliente">
        <Ligne label="Raison sociale" value={d.entreprise.nom} />
        <Ligne label="SIRET" value={d.entreprise.siret} />
        <Ligne label="Adresse" value={d.entreprise.adresse} />
        <Ligne
          label="Contact"
          value={[
            `${d.entreprise.prenomRepresentant} ${d.entreprise.nomRepresentant}`.trim(),
            d.entreprise.email,
            d.entreprise.telephone,
          ]
            .filter((x) => x && x.trim())
            .join(" · ")}
        />
      </Bloc>

      <Bloc titre="Formation">
        <Ligne label="Titre" value={d.formation.titre} />
        <Ligne label="Dates" value={[d.formation.dateDebut, d.formation.dateFin].filter(Boolean).join(" → ")} />
        <Ligne
          label="Durée"
          value={[d.formation.heuresTotal && `${d.formation.heuresTotal} h`, d.formation.nbJours && `${d.formation.nbJours} jour(s)`]
            .filter(Boolean)
            .join(" · ")}
        />
        <Ligne label="Modalité" value={d.formation.format} />
        <Ligne label="Lieu" value={[d.lieu.intitule, d.lieu.adresse].filter(Boolean).join(" — ")} />
      </Bloc>

      <Bloc titre="Sessions">
        <Ligne label="Sessions planifiées" value={String(d.sessions.length)} />
        {d.sessions.map((s, i) => (
          <Ligne
            key={i}
            label={`Session ${i + 1}`}
            value={[s.date, [s.heureDebut, s.heureFin].filter(Boolean).join("–"), s.module, s.lieu]
              .filter((x) => x && String(x).trim())
              .join(" · ")}
          />
        ))}
      </Bloc>

      <Bloc titre="Apprenants">
        <Ligne label="Nombre" value={String(d.apprenants.length)} />
        {d.apprenants.map((a, i) => (
          <Ligne
            key={i}
            label={`Apprenant ${i + 1}`}
            value={[a.nom, a.poste, a.email, a.numeroCpf].filter((x) => x && x.trim()).join(" · ")}
          />
        ))}
      </Bloc>

      <Bloc titre="Tarifs & financement">
        <Ligne label="Mode de financement" value={MODES[d.tarifs.modeFinancement]} />
        {d.tarifs.modeFinancement === "opco" ? <Ligne label="OPCO" value={d.tarifs.opco} /> : null}
        <Ligne label="Prix total" value={d.tarifs.prixTotal ? `${d.tarifs.prixTotal} €` : ""} />
        <Ligne
          label="Montant pris en charge"
          value={d.tarifs.montantPrisEnCharge ? `${d.tarifs.montantPrisEnCharge} €` : ""}
        />
        <Ligne
          label="Coût de certification"
          value={d.tarifs.coutCertification ? `${d.tarifs.coutCertification} €` : ""}
        />
        <Ligne label="Subrogation" value={d.tarifs.subrogation} />
      </Bloc>

      <Bloc titre="Formateur">
        <Ligne label="Nom" value={`${d.formateur.prenom} ${d.formateur.nom}`.trim()} />
        <Ligne label="E-mail" value={d.formateur.email} />
        <Ligne label="NDA" value={d.formateur.nda} />
        <Ligne label="Entreprise" value={d.formateur.entreprise} />
      </Bloc>
    </div>
  );
}
