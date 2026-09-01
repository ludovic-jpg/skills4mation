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
          <Heading style={{ color: '#0d2a4a', fontSize: '20px' }}>
            Dossier validé — demande de financement OPCO
          </Heading>
          <Hr style={{ borderColor: '#4f8f2f', borderTopWidth: '3px' }} />
          <Text style={{ color: '#12181f', fontSize: '14px' }}>Bonjour {formateurPrenom},</Text>
          <Text style={{ color: '#12181f', fontSize: '14px' }}>
            Le dossier <strong>{dossierLabel || entrepriseNom}</strong> est validé et signé par
            Skills4mation. Entreprise : <strong>{entrepriseNom}</strong>
            {opco ? ` — OPCO : ${opco}` : ''}.
          </Text>
          <Text style={{ color: '#12181f', fontSize: '14px' }}>
            Montant de la formation : <strong>{montant || 'à préciser'}</strong>
          </Text>
          {coutCertification ? (
            <Text style={{ color: '#12181f', fontSize: '14px' }}>
              Coût de la certification (ligne distincte) : <strong>{coutCertification}</strong>
            </Text>
          ) : null}
          <Text style={{ color: '#12181f', fontSize: '14px', marginTop: '16px' }}>
            Pièces déjà générées et archivées :
          </Text>
          {pieces.length ? (
            pieces.map((p) => (
              <Text key={p.label} style={{ color: '#12181f', fontSize: '13px', margin: '2px 0' }}>
                • {p.url ? <Link href={p.url}>{p.label}</Link> : p.label}
              </Text>
            ))
          ) : (
            <Text style={{ color: '#12181f', fontSize: '13px' }}>
              • Convention, planning, convocations et recueil des besoins disponibles dans votre
              espace.
            </Text>
          )}
          <Text style={{ color: '#12181f', fontSize: '14px', marginTop: '16px' }}>
            Il vous reste à <strong>déposer la demande de prise en charge sur le portail de votre
            OPCO</strong> avec ces pièces, puis à nous transmettre l&apos;accord de financement.
          </Text>
          <Button
            href={lien}
            style={{
              backgroundColor: '#4f8f2f',
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
