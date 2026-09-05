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

export interface DemandePaiementApprenantProps {
  apprenantPrenom?: string
  dossierLabel?: string
  formationIntitule?: string
  lien?: string
}

export function DemandePaiementApprenantEmail({
  apprenantPrenom = '',
  dossierLabel = '',
  formationIntitule = '',
  lien = 'https://skills4mation.com/apprenant',
}: DemandePaiementApprenantProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>Votre dossier de formation est complet : demande de paiement</Preview>
      <Body style={{ backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '32px', maxWidth: '600px' }}>
          <Heading style={{ color: CHARTE.vert, fontSize: '20px' }}>
            Dossier complet — demande de paiement
          </Heading>
          <Hr style={{ borderColor: CHARTE.vertClair, borderTopWidth: '3px' }} />
          <Text style={{ color: CHARTE.texte, fontSize: '14px' }}>
            Bonjour {apprenantPrenom || 'et bienvenue'},
          </Text>
          <Text style={{ color: CHARTE.texte, fontSize: '14px' }}>
            Toutes les pièces Qualiopi de votre dossier{' '}
            <strong>{dossierLabel || formationIntitule}</strong> sont archivées et complètes.
          </Text>
          <Text style={{ color: CHARTE.texte, fontSize: '14px' }}>
            <strong>Prochaine étape :</strong> déposer votre demande de paiement auprès de votre
            financeur en vous appuyant sur l&apos;ensemble des pièces archivées, accessibles depuis
            votre espace.
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
            Voir les pièces du dossier
          </Button>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: DemandePaiementApprenantEmail,
  displayName: 'Demande de paiement (apprenant)',
  subject: (data: Record<string, any>) =>
    `Demande de paiement${data['formationIntitule'] ? ` — ${data['formationIntitule']}` : ''}`,
  previewData: {
    apprenantPrenom: 'Marie',
    dossierLabel: 'Marie Dupont - Tableur (Excel)',
    formationIntitule: 'Tableur (Excel)',
    lien: 'https://skills4mation.com/apprenant',
  },
} satisfies TemplateEntry
