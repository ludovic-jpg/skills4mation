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

export interface ConvocationStagiaireProps {
  apprenantNom?: string
  formationTitre?: string
  dateDebut?: string
  dateFin?: string
  lieu?: string
  formateurNom?: string
  lien?: string
}

export function ConvocationStagiaireEmail({
  apprenantNom = '',
  formationTitre = 'votre formation',
  dateDebut = '',
  dateFin = '',
  lieu = '',
  formateurNom = '',
  lien = 'https://skills4mation.com/apprenant',
}: ConvocationStagiaireProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{`Votre convocation à la formation « ${formationTitre} »`}</Preview>
      <Body style={{ backgroundColor: '#f4f7fa', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '32px', maxWidth: '600px' }}>
          <Heading style={{ color: CHARTE.vert, fontSize: '20px' }}>Votre convocation</Heading>
          <Hr style={{ borderColor: CHARTE.vertClair, borderTopWidth: '3px' }} />
          <Text style={{ color: CHARTE.texte, fontSize: '14px' }}>Bonjour {apprenantNom},</Text>
          <Text style={{ color: CHARTE.texte, fontSize: '14px' }}>
            Vous êtes convoqué(e) à la formation <strong>{formationTitre}</strong>
            {dateDebut ? ` du ${dateDebut}` : ''}
            {dateFin ? ` au ${dateFin}` : ''}
            {lieu ? `, ${lieu}` : ''}.
            {formateurNom ? ` Votre formateur : ${formateurNom}.` : ''}
          </Text>
          <Text style={{ color: CHARTE.texte, fontSize: '14px' }}>
            Votre convocation officielle est jointe au lien ci-dessous. Conservez-la : elle
            fait partie des pièces de votre dossier de formation.
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
            Ouvrir ma convocation
          </Button>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: ConvocationStagiaireEmail,
  displayName: 'Convocation stagiaire (3A)',
  subject: (data: Record<string, any>) =>
    `Convocation : ${data['formationTitre'] ?? 'votre formation'}`,
  previewData: {
    apprenantNom: 'Marie Dupont',
    formationTitre: 'Bureautique avancée',
    dateDebut: '2026-10-05',
    dateFin: '2026-10-09',
    lieu: 'Paris 11e',
    formateurNom: 'Ludovic Albisser',
    lien: 'https://skills4mation.com/apprenant',
  },
} satisfies TemplateEntry
