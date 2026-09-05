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
import { CHARTE } from "../charte";

export interface DocumentsFinancementProps {
  apprenantPrenom?: string
  dossierLabel?: string
  formationIntitule?: string
  pieces?: string
  lien?: string
}

export function DocumentsFinancementEmail({
  apprenantPrenom = '',
  dossierLabel = '',
  formationIntitule = '',
  pieces = 'Convention de formation, Planning, Programme de formation',
  lien = 'https://skills4mation.com/apprenant',
}: DocumentsFinancementProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>Vos documents pour la demande de financement sont disponibles</Preview>
      <Body style={{ backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '32px', maxWidth: '600px' }}>
          <Heading style={{ color: CHARTE.vert, fontSize: '20px' }}>
            Vos documents de financement
          </Heading>
          <Hr style={{ borderColor: CHARTE.vertClair, borderTopWidth: '3px' }} />
          <Text style={{ color: CHARTE.texte, fontSize: '14px' }}>
            Bonjour {apprenantPrenom || 'et bienvenue'},
          </Text>
          <Text style={{ color: CHARTE.texte, fontSize: '14px' }}>
            Les pièces nécessaires à votre demande de financement pour le dossier{' '}
            <strong>{dossierLabel || formationIntitule}</strong> sont désormais disponibles dans
            votre espace apprenant :
          </Text>
          <Text style={{ color: CHARTE.texte, fontSize: '14px', fontWeight: 700 }}>{pieces}</Text>
          <Text style={{ color: CHARTE.texte, fontSize: '14px' }}>
            Transmettez-les à votre financeur (OPCO, employeur ou moncompteformation) pour lancer la
            prise en charge.
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
            Voir mes documents
          </Button>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: DocumentsFinancementEmail,
  displayName: 'Documents pour la demande de financement (apprenant)',
  subject: (data: Record<string, any>) =>
    `Vos documents de financement${data['formationIntitule'] ? ` — ${data['formationIntitule']}` : ''}`,
  previewData: {
    apprenantPrenom: 'Marie',
    dossierLabel: 'Marie Dupont - Tableur (Excel)',
    formationIntitule: 'Tableur (Excel)',
    pieces: 'Convention de formation, Planning, Programme de formation',
    lien: 'https://skills4mation.com/apprenant',
  },
} satisfies TemplateEntry
