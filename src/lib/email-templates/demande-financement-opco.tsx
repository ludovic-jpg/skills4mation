import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'
import { CHARTE } from "../charte";

export interface DemandeFinancementOpcoProps {
  formateurPrenom?: string
  entrepriseNom?: string
  dossierLabel?: string
  montant?: string
  coutCertification?: string
  opco?: string
  pieces?: { label: string; url?: string }[]
  lien?: string
}

export function DemandeFinancementOpcoEmail({
  formateurPrenom = '',
  entrepriseNom = 'le client',
  dossierLabel = '',
  montant = '',
  coutCertification = '',
  opco = '',
  pieces = [],
  lien = 'https://skills4mation.com/espace/dossiers',
}: DemandeFinancementOpcoProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{`Demande de financement OPCO à déposer pour ${entrepriseNom}`}</Preview>
      <Body style={{ backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '32px', maxWidth: '600px' }}>
          <Heading style={{ color: CHARTE.vert, fontSize: '20px' }}>
            Dossier validé — demande de financement OPCO
          </Heading>
          <Hr style={{ borderColor: CHARTE.vertClair, borderTopWidth: '3px' }} />
          <Text style={{ color: CHARTE.texte, fontSize: '14px' }}>Bonjour {formateurPrenom},</Text>
          <Text style={{ color: CHARTE.texte, fontSize: '14px' }}>
            Le dossier <strong>{dossierLabel || entrepriseNom}</strong> est validé et signé par
            Skills4mation. Entreprise : <strong>{entrepriseNom}</strong>
            {opco ? ` — OPCO : ${opco}` : ''}.
          </Text>
          <Text style={{ color: CHARTE.texte, fontSize: '14px' }}>
            Montant de la formation : <strong>{montant || 'à préciser'}</strong>
          </Text>
          {coutCertification ? (
            <Text style={{ color: CHARTE.texte, fontSize: '14px' }}>
              Coût de la certification (ligne distincte) : <strong>{coutCertification}</strong>
            </Text>
          ) : null}
          <Text style={{ color: CHARTE.texte, fontSize: '14px', marginTop: '16px' }}>
            Pièces déjà générées et archivées :
          </Text>
          {pieces.length ? (
            pieces.map((p) => (
              <Text key={p.label} style={{ color: CHARTE.texte, fontSize: '13px', margin: '2px 0' }}>
                • {p.url ? <Link href={p.url}>{p.label}</Link> : p.label}
              </Text>
            ))
          ) : (
            <Text style={{ color: CHARTE.texte, fontSize: '13px' }}>
              • Convention, planning, convocations et recueil des besoins disponibles dans votre
              espace.
            </Text>
          )}
          <Text style={{ color: CHARTE.texte, fontSize: '14px', marginTop: '16px' }}>
            <strong>Vous n&apos;avez rien à déposer vous-même :</strong> le compte OPCO appartient à
            l&apos;entreprise cliente. L&apos;apprenant dispose désormais, dans son espace
            Skills4mation, d&apos;une étape dédiée pour déposer la demande de prise en charge — soit
            lui-même s&apos;il a accès à l&apos;espace OPCO de son entreprise, soit en la
            transmettant à son service RH.
          </Text>
          <Text style={{ color: CHARTE.texte, fontSize: '14px' }}>
            Dès qu&apos;il confirme le dépôt, vous recevez une notification et le dossier passe
            automatiquement au statut « demande de financement ». Votre rôle est de vérifier que
            les pièces ci-dessus sont bien à jour et de nous transmettre l&apos;accord de
            financement dès sa réception.
          </Text>
          <Button
            href={lien}
            style={{
              backgroundColor: CHARTE.vertClair,
              color: '#ffffff',
              padding: '12px 20px',
              borderRadius: '6px',
              fontSize: '14px',
              marginTop: '20px',
              display: 'inline-block',
            }}
          >
            Ouvrir le dossier
          </Button>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: DemandeFinancementOpcoEmail,
  displayName: 'Demande de financement OPCO (formateur)',
  subject: (data: Record<string, any>) =>
    `Demande de financement OPCO à déposer${data['entrepriseNom'] ? ` — ${data['entrepriseNom']}` : ''}`,
  previewData: {
    formateurPrenom: 'Ludovic',
    entrepriseNom: 'Acme',
    dossierLabel: 'Acme - Bureautique avancée',
    montant: '3 600,00 €',
    coutCertification: '89,00 €',
    opco: 'OPCO Atlas',
    pieces: [{ label: 'Convention signée (1A)', url: 'https://drive.google.com/' }],
    lien: 'https://skills4mation.com/espace/dossiers',
  },
} satisfies TemplateEntry
