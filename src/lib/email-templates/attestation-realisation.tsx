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

export interface AttestationRealisationProps {
  apprenantNom?: string
  formationTitre?: string
  dateDebut?: string
  dateFin?: string
  lien?: string
}

export function AttestationRealisationEmail({
  apprenantNom = '',
  formationTitre = 'votre formation',
  dateDebut = '',
  dateFin = '',
  lien = 'https://skills4mation.com/apprenant',
}: AttestationRealisationProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{`Votre attestation de réalisation — ${formationTitre}`}</Preview>
      <Body style={{ backgroundColor: '#f4f7fa', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '32px', maxWidth: '600px' }}>
          <Heading style={{ color: CHARTE.vert, fontSize: '20px' }}>
            Votre attestation de réalisation
          </Heading>
          <Hr style={{ borderColor: CHARTE.vertClair, borderTopWidth: '3px' }} />
          <Text style={{ color: CHARTE.texte, fontSize: '14px' }}>Bonjour {apprenantNom},</Text>
          <Text style={{ color: CHARTE.texte, fontSize: '14px' }}>
            Votre formation <strong>{formationTitre}</strong>
            {dateDebut ? ` du ${dateDebut}` : ''}
            {dateFin ? ` au ${dateFin}` : ''} est terminée. Votre attestation de réalisation est
            disponible au lien ci-dessous.
          </Text>
          <Text style={{ color: CHARTE.texte, fontSize: '14px' }}>
            Le lien reste valable 7 jours ; passé ce délai, l'attestation reste accessible dans
            votre espace apprenant.
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
            Télécharger mon attestation
          </Button>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: AttestationRealisationEmail,
  displayName: 'Attestation de réalisation (1B)',
  subject: (data: Record<string, any>) =>
    `Votre attestation de réalisation — ${data['formationTitre'] ?? 'formation'}`,
  previewData: {
    apprenantNom: 'Marie Dupont',
    formationTitre: 'Bureautique avancée',
    dateDebut: '2026-10-05',
    dateFin: '2026-10-09',
    lien: 'https://skills4mation.com/apprenant',
  },
} satisfies TemplateEntry
