import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  type DocumentProps,
} from "@react-pdf/renderer";
import type { ReactElement } from "react";

import { dateFr, euros, FORMAT_LABELS, type DossierDonnees } from "./types";
import { CHARTE } from "../charte";




const s = StyleSheet.create({
  page: { paddingTop: 38, paddingBottom: 46, paddingHorizontal: 42, fontSize: 9.5, color: CHARTE.texte },
  brand: { fontSize: 14, fontWeight: 700, color: CHARTE.vert },
  brandLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  ref: { fontSize: 8, color: CHARTE.gris },
  rule: { height: 2, backgroundColor: CHARTE.vertClair, marginTop: 6, marginBottom: 16 },
  h1: { fontSize: 13, fontWeight: 700, color: CHARTE.vert, marginBottom: 10, textTransform: "uppercase" },
  h2: { fontSize: 10, fontWeight: 700, color: CHARTE.vert, marginTop: 14, marginBottom: 5 },
  p: { lineHeight: 1.5, marginBottom: 5 },
  row: { flexDirection: "row", marginBottom: 3 },
  key: { width: 150, color: CHARTE.gris },
  val: { flex: 1, fontWeight: 700 },
  box: { borderWidth: 1, borderColor: CHARTE.bordure, borderRadius: 4, padding: 10, marginBottom: 8 },
  th: {
    flexDirection: "row",
    backgroundColor: CHARTE.fondDoux,
    borderWidth: 1,
    borderColor: CHARTE.bordure,
    paddingVertical: 4,
    paddingHorizontal: 5,
    fontWeight: 700,
  },
  tr: {
    flexDirection: "row",
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: CHARTE.bordure,
    paddingVertical: 5,
    paddingHorizontal: 5,
    minHeight: 20,
  },
  sign: { flexDirection: "row", justifyContent: "space-between", marginTop: 26 },
  signBox: {
    width: "46%",
    borderWidth: 1,
    borderColor: CHARTE.bordure,
    borderRadius: 4,
    padding: 8,
    height: 82,
  },
  footer: {
    position: "absolute",
    bottom: 22,
    left: 42,
    right: 42,
    fontSize: 7.5,
    color: "#7b8494",
    textAlign: "center",
  },
});

function Head({ titre, adf }: { titre: string; adf: string }) {
  return (
    <View>
      <View style={s.brandLine}>
        <Text style={s.brand}>SKILLS4MATION</Text>
        <Text style={s.ref}>Dossier ADF n° {adf || "—"}</Text>
      </View>
      <View style={s.rule} />
      <Text style={s.h1}>{titre}</Text>
    </View>
  );
}

function Foot({ code }: { code: string }) {
  return (
    <Text
      style={s.footer}
      render={({ pageNumber, totalPages }) =>
        `Skills4mation — Portage Qualiopi — Pièce ${code} — page ${pageNumber}/${totalPages}`
      }
      fixed
    />
  );
}

function KV({ k, v }: { k: string; v?: string | null }) {
  return (
    <View style={s.row}>
      <Text style={s.key}>{k}</Text>
      <Text style={s.val}>{v && v.trim() ? v : "—"}</Text>
    </View>
  );
}

function Cell({ w, children }: { w: string; children?: string }) {
  return <Text style={{ width: w }}>{children ?? ""}</Text>;
}

function apprenantsRows(d: DossierDonnees) {
  return d.apprenants.length ? d.apprenants : [{ nom: "—", poste: "—" }];
}

function ConventionDoc({ d }: { d: DossierDonnees }) {
  return (
    <Document title={`1A Convention ${d.adf}`}>
      <Page size="A4" style={s.page}>
        <Head titre="Convention de formation professionnelle" adf={d.adf} />
        <Text style={s.p}>
          Entre l'organisme de formation Skills4mation et l'entreprise désignée ci-dessous, il est
          conclu la présente convention en application des articles L.6353-1 et suivants du Code du
          travail.
        </Text>

        <Text style={s.h2}>1. Entreprise bénéficiaire</Text>
        <View style={s.box}>
          <KV k="Raison sociale" v={d.entreprise.nom} />
          <KV k="Nom commercial" v={d.entreprise.nomCommercial} />
          <KV k="Adresse" v={d.entreprise.adresse} />
          <KV k="SIRET" v={d.entreprise.siret} />
          <KV
            k="Représentant"
            v={`${d.entreprise.prenomRepresentant} ${d.entreprise.nomRepresentant}`.trim()}
          />
        </View>

        <Text style={s.h2}>2. Action de formation</Text>
        <View style={s.box}>
          <KV k="Intitulé" v={d.formation.titre} />
          <KV k="Objectifs pédagogiques" v={d.formation.objectifs} />
          <KV k="Niveau" v={d.formation.niveau} />
          <KV k="Prérequis" v={d.formation.prerequis} />
          <KV k="Dates" v={`du ${dateFr(d.formation.dateDebut)} au ${dateFr(d.formation.dateFin)}`} />
          <KV k="Durée totale" v={d.formation.heuresTotal ? `${d.formation.heuresTotal} h` : ""} />
          <KV k="Nombre de jours" v={d.formation.nbJours} />
          <KV k="Modalité" v={FORMAT_LABELS[d.formation.format]} />
          {d.formation.heuresPresentiel ? (
            <KV k="Dont présentiel" v={`${d.formation.heuresPresentiel} h`} />
          ) : null}
        </View>

        <Text style={s.h2}>3. Lieu de la formation</Text>
        <View style={s.box}>
          <KV k="Lieu" v={d.lieu.intitule} />
          <KV k="Adresse" v={d.lieu.adresse} />
          <KV k="SIRET du lieu" v={d.lieu.siret} />
        </View>

        <Text style={s.h2}>4. Participants</Text>
        <View style={s.th}>
          <Cell w="8%">#</Cell>
          <Cell w="52%">Nom et prénom</Cell>
          <Cell w="40%">Fonction</Cell>
        </View>
        {apprenantsRows(d)
          .slice(0, 8)
          .map((a, i) => (
            <View style={s.tr} key={i}>
              <Cell w="8%">{String(i + 1)}</Cell>
              <Cell w="52%">{a.nom}</Cell>
              <Cell w="40%">{a.poste}</Cell>
            </View>
          ))}

        <Text style={s.h2}>5. Dispositions financières</Text>
        <View style={s.box}>
          <KV k="Prix unitaire / stagiaire" v={euros(d.tarifs.prixUnitaire)} />
          <KV k="Nombre de stagiaires" v={d.tarifs.nbStagiaires || String(d.apprenants.length)} />
          <KV k="Prix total" v={euros(d.tarifs.prixTotal)} />
          {d.tarifs.prixPresentiel ? (
            <KV k="Dont part présentiel" v={euros(d.tarifs.prixPresentiel)} />
          ) : null}
          <KV k="OPCO / financeur" v={d.tarifs.opco} />
          <KV k="Subrogation de paiement" v={d.tarifs.subrogation === "oui" ? "Oui" : "Non"} />
        </View>

        <Text style={s.p}>
          Fait à {d.convention.lieu || "—"}, le {dateFr(d.convention.date)}, en deux exemplaires
          originaux.
        </Text>
        <View style={s.sign}>
          <View style={s.signBox}>
            <Text>Pour Skills4mation</Text>
          </View>
          <View style={s.signBox}>
            <Text>Pour {d.entreprise.nom || "l'entreprise"}</Text>
          </View>
        </View>
        <Foot code="1A" />
      </Page>
    </Document>
  );
}

function PlanningDoc({ d }: { d: DossierDonnees }) {
  return (
    <Document title={`2 Planning ${d.adf}`}>
      <Page size="A4" style={s.page}>
        <Head titre="Planning de la formation" adf={d.adf} />
        <View style={s.box}>
          <KV k="Formation" v={d.formation.titre} />
          <KV k="Démarrage" v={dateFr(d.formation.dateDebut)} />
          <KV k="Fin" v={dateFr(d.formation.dateFin)} />
          <KV k="Durée totale" v={d.formation.heuresTotal ? `${d.formation.heuresTotal} h` : ""} />
          <KV k="Nombre de jours" v={d.formation.nbJours} />
          <KV k="Lieu" v={d.lieu.adresse || d.lieu.intitule} />
        </View>

        <Text style={s.h2}>Effectif</Text>
        <Text style={s.p}>
          {d.apprenants.length
            ? d.apprenants.map((a) => `${a.nom}${a.poste ? ` (${a.poste})` : ""}`).join(" • ")
            : "—"}
        </Text>

        <Text style={s.h2}>Sessions programmées</Text>
        <View style={s.th}>
          <Cell w="10%">N°</Cell>
          <Cell w="26%">Date</Cell>
          <Cell w="20%">Début</Cell>
          <Cell w="20%">Fin</Cell>
          <Cell w="24%">Lieu</Cell>
        </View>
        {(d.sessions.length ? d.sessions : [{ date: "", heureDebut: "", heureFin: "" }])
          .slice(0, 20)
          .map((sess, i) => (
            <View style={s.tr} key={i}>
              <Cell w="10%">{String(i + 1)}</Cell>
              <Cell w="26%">{dateFr(sess.date)}</Cell>
              <Cell w="20%">{sess.heureDebut || "—"}</Cell>
              <Cell w="20%">{sess.heureFin || "—"}</Cell>
              <Cell w="24%">{sess.lieu || d.lieu.intitule || "—"}</Cell>
            </View>
          ))}

        <Text style={s.p}>
          Convention établie à {d.convention.lieu || "—"} le {dateFr(d.convention.date)} —
          représentant de l'entreprise : {d.entreprise.prenomRepresentant}{" "}
          {d.entreprise.nomRepresentant}.
        </Text>
        <Foot code="2" />
      </Page>
    </Document>
  );
}

function ConvocationDoc({ d }: { d: DossierDonnees }) {
  const premiere = d.sessions[0];
  const liste = apprenantsRows(d);
  return (
    <Document title={`3A Convocations ${d.adf}`}>
      {liste.map((a, index) => (
        <Page size="A4" style={s.page} key={index}>
          <Head titre="Convocation à une action de formation" adf={d.adf} />
          <Text style={s.p}>Madame, Monsieur {a.nom},</Text>
          <Text style={s.p}>
            Vous êtes convoqué(e) à l'action de formation « {d.formation.titre || "—"} » organisée
            par Skills4mation pour le compte de {d.entreprise.nom || "votre entreprise"}.
          </Text>
          <View style={s.box}>
            <KV k="Stagiaire" v={a.nom} />
            <KV k="Fonction" v={a.poste} />
            <KV k="Première session" v={dateFr(premiere?.date || d.formation.dateDebut)} />
            <KV k="Horaires" v={`${premiere?.heureDebut || "—"} – ${premiere?.heureFin || "—"}`} />
            <KV k="Modalité" v={FORMAT_LABELS[d.formation.format]} />
            <KV k="Lieu" v={`${d.lieu.intitule} ${d.lieu.adresse}`.trim()} />
            {d.formation.lienConnexion ? (
              <KV k="Lien de connexion" v={d.formation.lienConnexion} />
            ) : null}
          </View>
          <Text style={s.h2}>Votre formateur</Text>
          <View style={s.box}>
            <KV k="Formateur" v={`${d.formateur.prenom} ${d.formateur.nom}`.trim()} />
            <KV k="E-mail" v={d.formateur.email} />
            <KV k="Téléphone" v={d.formateur.telephone} />
          </View>
          <Text style={s.p}>
            Merci de vous présenter 10 minutes avant le début de la session. Le lien de connexion et
            l'environnement technique relèvent de la responsabilité du formateur.
          </Text>
          <Text style={s.p}>
            Effectif convoqué : {liste.map((x) => x.nom).join(", ")}.
          </Text>
          <Foot code="3A" />
        </Page>
      ))}
    </Document>
  );
}

function OdmDoc({ d }: { d: DossierDonnees }) {
  return (
    <Document title={`F0C ODM ${d.adf}`}>
      <Page size="A4" style={s.page}>
        <Head titre="Ordre de mission / contrat de sous-traitance" adf={d.adf} />
        <Text style={s.h2}>Formateur sous-traitant</Text>
        <View style={s.box}>
          <KV k="Nom du formateur" v={`${d.formateur.prenom} ${d.formateur.nom}`.trim()} />
          <KV k="Entreprise" v={d.formateur.entreprise} />
          <KV k="Adresse" v={d.formateur.adresse} />
          <KV k="SIRET" v={d.formateur.siret} />
          <KV k="Numéro de déclaration d'activité" v={d.formateur.nda} />
          <KV k="Région de dépôt du NDA" v={d.formateur.ndaRegion} />
        </View>

        <Text style={s.h2}>Mission confiée</Text>
        <View style={s.box}>
          <KV k="Formation" v={d.formation.titre} />
          <KV k="Objectifs pédagogiques" v={d.formation.objectifs} />
          <KV k="Dates" v={`du ${dateFr(d.formation.dateDebut)} au ${dateFr(d.formation.dateFin)}`} />
          <KV k="Heures totales" v={d.formation.heuresTotal} />
          <KV k="Heures en présentiel" v={d.formation.heuresPresentiel} />
          <KV k="Lieu d'exécution" v={d.lieu.adresse || d.lieu.intitule} />
          <KV k="Mission ouverte le" v={dateFr(d.formateur.dateMissionOuverte)} />
        </View>

        <Text style={s.h2}>Client final</Text>
        <View style={s.box}>
          <KV k="Entreprise cliente" v={d.entreprise.nom} />
          <KV
            k="Représentant"
            v={`${d.entreprise.prenomRepresentant} ${d.entreprise.nomRepresentant}`.trim()}
          />
          <KV k="Téléphone" v={d.entreprise.telephone} />
        </View>

        <Text style={s.h2}>Stagiaires</Text>
        <View style={s.th}>
          <Cell w="8%">#</Cell>
          <Cell w="52%">Nom et prénom</Cell>
          <Cell w="40%">Poste</Cell>
        </View>
        {apprenantsRows(d)
          .slice(0, 8)
          .map((a, i) => (
            <View style={s.tr} key={i}>
              <Cell w="8%">{String(i + 1)}</Cell>
              <Cell w="52%">{a.nom}</Cell>
              <Cell w="40%">{a.poste}</Cell>
            </View>
          ))}

        <Text style={s.h2}>Rémunération</Text>
        <View style={s.box}>
          <KV k="Coût horaire" v={euros(d.formateur.coutHoraire)} />
          <KV k="Total recette mission" v={euros(d.formateur.totalRecette)} />
          <KV k="Modalité de règlement" v="Sous 8 jours ouvrés à réception des fonds" />
        </View>

        <View style={s.sign}>
          <View style={s.signBox}>
            <Text>Pour Skills4mation</Text>
          </View>
          <View style={s.signBox}>
            <Text>Le formateur</Text>
          </View>
        </View>
        <Foot code="F0C" />
      </Page>
    </Document>
  );
}

function EmargementDoc({ d }: { d: DossierDonnees }) {
  const sessions = d.sessions.length ? d.sessions : [{ date: "", heureDebut: "", heureFin: "" }];
  return (
    <Document title={`F3 Emargement ${d.adf}`}>
      {sessions.slice(0, 20).map((sess, index) => (
        <Page size="A4" style={s.page} key={index}>
          <Head titre="Relevé de fréquentation / feuille d'émargement" adf={d.adf} />
          <View style={s.box}>
            <KV k="Formation" v={d.formation.titre} />
            <KV k="Objectif pédagogique" v={d.formation.objectifs} />
            <KV k="Durée totale" v={d.formation.heuresTotal ? `${d.formation.heuresTotal} h` : ""} />
            <KV k="Période" v={`du ${dateFr(d.formation.dateDebut)} au ${dateFr(d.formation.dateFin)}`} />
            <KV k="Entreprise d'accueil" v={d.lieu.intitule} />
            <KV k="Adresse d'accueil" v={d.lieu.adresse} />
            <KV k="Entreprise cliente" v={d.entreprise.nom} />
            <KV k="SIRET" v={d.entreprise.siret} />
            <KV
              k={`Session ${index + 1}`}
              v={`${dateFr(sess.date)} — ${sess.heureDebut || "—"} à ${sess.heureFin || "—"}`}
            />
          </View>

          <Text style={s.h2}>Signatures des apprenants</Text>
          <View style={s.th}>
            <Cell w="8%">#</Cell>
            <Cell w="42%">Prénom et nom</Cell>
            <Cell w="25%">Matin</Cell>
            <Cell w="25%">Après-midi</Cell>
          </View>
          {apprenantsRows(d)
            .slice(0, 5)
            .map((a, i) => (
              <View style={[s.tr, { minHeight: 34 }]} key={i}>
                <Cell w="8%">{String(i + 1)}</Cell>
                <Cell w="42%">{a.nom}</Cell>
                <Cell w="25%">{""}</Cell>
                <Cell w="25%">{""}</Cell>
              </View>
            ))}
          <View style={s.sign}>
            <View style={s.signBox}>
              <Text>Signature du formateur</Text>
            </View>
            <View style={s.signBox}>
              <Text>Cachet de l'entreprise</Text>
            </View>
          </View>
          <Foot code="F3" />
        </Page>
      ))}
    </Document>
  );
}

function RecueilDoc({ d }: { d: DossierDonnees }) {
  return (
    <Document title={`F0A Recueil des besoins ${d.adf}`}>
      <Page size="A4" style={s.page}>
        <Head titre="Recueil et analyse des besoins" adf={d.adf} />
        <View style={s.box}>
          <KV k="Entreprise" v={d.entreprise.nom} />
          <KV
            k="Interlocuteur"
            v={`${d.entreprise.prenomRepresentant} ${d.entreprise.nomRepresentant}`.trim()}
          />
          <KV k="Formation envisagée" v={d.formation.titre} />
          <KV k="Effectif concerné" v={String(d.apprenants.length || "—")} />
        </View>

        <Text style={s.h2}>Contexte et enjeux</Text>
        <Text style={s.p}>{d.besoins.contexte || "—"}</Text>
        <Text style={s.h2}>Attentes et objectifs opérationnels</Text>
        <Text style={s.p}>{d.besoins.attentes || "—"}</Text>
        <Text style={s.h2}>Niveau de départ des participants</Text>
        <Text style={s.p}>{d.besoins.niveauDepart || "—"}</Text>
        <Text style={s.h2}>Contraintes (organisation, matériel, accessibilité)</Text>
        <Text style={s.p}>{d.besoins.contraintes || "—"}</Text>
        <Text style={s.h2}>Modalités d'évaluation retenues</Text>
        <Text style={s.p}>{d.besoins.modalitesEvaluation || "—"}</Text>

        <Text style={s.h2}>Participants identifiés</Text>
        <View style={s.th}>
          <Cell w="8%">#</Cell>
          <Cell w="52%">Nom et prénom</Cell>
          <Cell w="40%">Poste</Cell>
        </View>
        {apprenantsRows(d).map((a, i) => (
          <View style={s.tr} key={i}>
            <Cell w="8%">{String(i + 1)}</Cell>
            <Cell w="52%">{a.nom}</Cell>
            <Cell w="40%">{a.poste}</Cell>
          </View>
        ))}
        <Foot code="F0A" />
      </Page>
    </Document>
  );
}

const BUILDERS: Record<string, (d: DossierDonnees) => ReactElement<DocumentProps>> = {
  "1A": (d) => <ConventionDoc d={d} />,
  "2": (d) => <PlanningDoc d={d} />,
  "3A": (d) => <ConvocationDoc d={d} />,
  F0A: (d) => <RecueilDoc d={d} />,
  F0C: (d) => <OdmDoc d={d} />,
  F3: (d) => <EmargementDoc d={d} />,
};

export function pieceFileName(code: string, d: DossierDonnees) {
  const slug = (d.entreprise.nom || "dossier")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `${code}-${slug || "dossier"}.pdf`;
}

export async function renderPieceBlob(code: string, donnees: DossierDonnees): Promise<Blob> {
  const builder = BUILDERS[code];
  if (!builder) throw new Error(`Aucun gabarit PDF pour la pièce ${code}`);
  const { pdf } = await import("@react-pdf/renderer");
  return pdf(builder(donnees)).toBlob();
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportDossierZip(
  codes: string[],
  donnees: DossierDonnees,
  extras: { name: string; content: string }[] = [],
) {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  for (const code of codes) {
    if (!BUILDERS[code]) continue;
    const blob = await renderPieceBlob(code, donnees);
    zip.file(pieceFileName(code, donnees), blob);
  }
  for (const extra of extras) zip.file(extra.name, extra.content);
  return zip.generateAsync({ type: "blob" });
}
