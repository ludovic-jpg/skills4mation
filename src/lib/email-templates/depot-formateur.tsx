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

export interface DepotFormateurProps {
  formateurPrenom?: string
  apprenantNom?: string
  documentCode?: string
  documentLabel?: string
  dossierLabel?: string
  fichierNom?: string
  lien?: string
}

export function DepotFormateurEmail({
  formateurPrenom = '',
  apprenantNom = 'Un apprenant',
  documentCode = '',
  documentLabel = 'un document',
  dossierLabel = '',
  fichierNom = '',
  lien = 'https://skills4mation.com/espace/dossiers',
}: DepotFormateurProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{`${apprenantNom} a déposé un fichier pour « ${documentLabel} »`}</Preview>
      <Body style={{ backgroundColor: '#f4f7fa', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '32px', maxWidth: '600px' }}>
          <Heading style={{ color: '#0d2a4a', fontSize: '20px' }}>Nouveau dépôt apprenant</Heading>
          <Hr style={{ borderColor: '#4f8f2f', borderTopWidth: '3px' }} />
          <Text style={{ color: '#12181f', fontSize: '14px' }}>Bonjour {formateurPrenom},</Text>
          <Text style={{ color: '#12181f', fontSize: '14px' }}>
            {apprenantNom} vient de déposer un fichier pour{' '}
            <strong>
              {documentCode ? `${documentCode} — ` : ''}
              {documentLabel}
            </strong>
            {dossierLabel ? ` du dossier ${dossierLabel}` : ''}.
            {fichierNom ? ` Fichier : ${fichierNom}.` : ''}
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
            Vérifier le dépôt
          </Button>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: DepotFormateurEmail,
  displayName: 'Dépôt apprenant (formateur)',
  subject: (data: Record<string, any>) =>
    `Nouveau dépôt apprenant${data['documentCode'] ? ` : ${data['documentCode']}` : ''}`,
  previewData: {
    formateurPrenom: 'Ludovic',
    apprenantNom: 'Marie Dupont',
    documentCode: 'F6',
    documentLabel: "Feuille d'émargement",
    dossierLabel: 'Acme - Bureautique avancée',
    fichierNom: 'F6_Marie_Dupont_SIGNE.pdf',
    lien: 'https://skills4mation.com/espace/dossiers',
  },
} satisfies TemplateEntry
