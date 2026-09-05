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

export interface SatisfactionAFroidProps {
  apprenantNom?: string
  formationTitre?: string
  lien?: string
}

export function SatisfactionAFroidEmail({
  apprenantNom = '',
  formationTitre = 'votre formation',
  lien = 'https://skills4mation.com/apprenant',
}: SatisfactionAFroidProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{`3 mois après « ${formationTitre} » : votre retour en 3 minutes`}</Preview>
      <Body style={{ backgroundColor: '#f4f7fa', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '32px', maxWidth: '600px' }}>
          <Heading style={{ color: CHARTE.vert, fontSize: '20px' }}>Votre retour à 3 mois</Heading>
          <Hr style={{ borderColor: CHARTE.vertClair, borderTopWidth: '3px' }} />
          <Text style={{ color: CHARTE.texte, fontSize: '14px' }}>Bonjour {apprenantNom},</Text>
          <Text style={{ color: CHARTE.texte, fontSize: '14px' }}>
            Vous avez suivi la formation <strong>{formationTitre}</strong> il y a trois mois. Nous
            aimerions savoir ce que vous en avez retiré dans votre activité au quotidien.
          </Text>
          <Text style={{ color: CHARTE.texte, fontSize: '14px' }}>
            Le questionnaire se remplit en ligne en quelques minutes depuis votre espace.
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
            Répondre au questionnaire
          </Button>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: SatisfactionAFroidEmail,
  displayName: 'Satisfaction à froid (F7)',
  subject: (data: Record<string, any>) =>
    `Votre retour 3 mois après « ${data['formationTitre'] ?? 'votre formation'} »`,
  previewData: {
    apprenantNom: 'Marie Dupont',
    formationTitre: 'Bureautique avancée',
    lien: 'https://skills4mation.com/apprenant',
  },
} satisfies TemplateEntry
