import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

export interface OrdreDeMissionFormateurProps {
  formateurPrenom?: string
  formationTitre?: string
  dossierLabel?: string
  lien?: string
}

export function OrdreDeMissionFormateurEmail({
  formateurPrenom = '',
  formationTitre = 'votre mission',
  dossierLabel = '',
  lien = 'https://skills4mation.com/espace/dossiers',
}: OrdreDeMissionFormateurProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{`Votre ordre de mission est à signer — ${formationTitre}`}</Preview>
      <Body style={{ backgroundColor: '#f4f7fa', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '32px', maxWidth: '600px' }}>
          <Heading style={{ color: '#0d2a4a', fontSize: '20px' }}>Ordre de mission à signer</Heading>
          <Hr style={{ borderColor: '#4f8f2f', borderTopWidth: '3px' }} />
          <Text style={{ color: '#12181f', fontSize: '14px' }}>Bonjour {formateurPrenom},</Text>
          <Text style={{ color: '#12181f', fontSize: '14px' }}>
            Le financement est accordé pour <strong>{formationTitre}</strong>
            {dossierLabel ? ` (${dossierLabel})` : ''}. Votre ordre de mission a été généré : il
            doit être signé en ligne avant le démarrage de la formation.
          </Text>
          <Text style={{ color: '#12181f', fontSize: '14px' }}>
            La signature se fait depuis la fiche du dossier, avec horodatage et certificat de
            preuve conservés au dossier.
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
            Signer mon ordre de mission
          </Button>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: OrdreDeMissionFormateurEmail,
  displayName: 'Ordre de mission formateur (F0C)',
  subject: () => 'Votre ordre de mission est à signer',
  previewData: {
    formateurPrenom: 'Ludovic',
    formationTitre: 'Bureautique avancée',
    dossierLabel: 'Acme - Bureautique avancée',
    lien: 'https://skills4mation.com/espace/dossiers',
  },
} satisfies TemplateEntry
