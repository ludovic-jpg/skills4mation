import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

export interface SignatureFormateurProps {
  formateurPrenom?: string
  apprenantNom?: string
  documentCode?: string
  documentLabel?: string
  dossierLabel?: string
  signatureDate?: string
  hash?: string
  lien?: string
  driveUrl?: string
}

export function SignatureFormateurEmail({
  formateurPrenom = '',
  apprenantNom = 'Un apprenant',
  documentCode = '',
  documentLabel = 'un document',
  dossierLabel = '',
  signatureDate = '',
  hash = '',
  lien = 'https://skills4mation.com/espace/dossiers',
  driveUrl = '',
}: SignatureFormateurProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{`${apprenantNom} a signé « ${documentLabel} »`}</Preview>
      <Body style={{ backgroundColor: '#f4f7fa', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '32px', maxWidth: '600px' }}>
          <Heading style={{ color: '#0d2a4a', fontSize: '20px' }}>
            Document signé reçu
          </Heading>
          <Hr style={{ borderColor: '#4f8f2f', borderTopWidth: '3px' }} />
          <Text style={{ color: '#12181f', fontSize: '14px' }}>
            Bonjour {formateurPrenom},
          </Text>
          <Text style={{ color: '#12181f', fontSize: '14px' }}>
            {apprenantNom} a signé électroniquement{' '}
            <strong>
              {documentCode ? `${documentCode} — ` : ''}
              {documentLabel}
            </strong>
            {dossierLabel ? ` du dossier ${dossierLabel}` : ''}. Le document et son certificat de
            signature sont archivés dans votre espace et dans Google Drive.
          </Text>
          <Section style={{ backgroundColor: '#f4f7fa', padding: '16px' }}>
            {signatureDate ? (
              <Text style={{ fontSize: '12px', color: '#5b6472', margin: '0 0 6px' }}>
                Signé le {signatureDate}
              </Text>
            ) : null}
            {hash ? (
              <Text style={{ fontSize: '11px', color: '#5b6472', margin: 0, wordBreak: 'break-all' }}>
                Empreinte SHA-256 : {hash}
              </Text>
            ) : null}
          </Section>
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
          {driveUrl ? (
            <Text style={{ fontSize: '12px', color: '#5b6472', marginTop: '16px' }}>
              Archive Google Drive : {driveUrl}
            </Text>
          ) : null}
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: SignatureFormateurEmail,
  displayName: 'Signature apprenant reçue (formateur)',
  subject: (data: Record<string, any>) =>
    `Document signé reçu${data['documentCode'] ? ` : ${data['documentCode']}` : ''}`,
  previewData: {
    formateurPrenom: 'Ludovic',
    apprenantNom: 'Marie Dupont',
    documentCode: 'F3',
    documentLabel: 'Convention de formation professionnelle',
    dossierLabel: 'Acme - Bureautique avancée',
    signatureDate: '12 mars 2026 à 14:32:10',
    hash: 'a'.repeat(64),
    lien: 'https://skills4mation.com/espace/dossiers',
    driveUrl: 'https://drive.google.com/…',
  },
} satisfies TemplateEntry
