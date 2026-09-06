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
import { CHARTE } from '../charte'

export interface DossierRefuseProps {
  formateurPrenom?: string
  dossierLabel?: string
  formationIntitule?: string
  motif?: string
  auteur?: string
  lien?: string
}

export function DossierRefuseEmail({
  formateurPrenom = '',
  dossierLabel = '',
  formationIntitule = '',
  motif = '',
  auteur = 'Équipe Skills4mation',
  lien = 'https://skills4mation.com/espace/dossiers',
}: DossierRefuseProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{`Votre dossier de formation a été refusé : motif et suite à donner`}</Preview>
      <Body style={{ backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '32px', maxWidth: '600px' }}>
          <Heading style={{ color: CHARTE.vert, fontSize: '20px' }}>Dossier refusé</Heading>
          <Hr style={{ borderColor: CHARTE.vertClair, borderTopWidth: '3px' }} />
          <Text style={{ color: CHARTE.texte, fontSize: '14px' }}>
            Bonjour {formateurPrenom || ''},
          </Text>
          <Text style={{ color: CHARTE.texte, fontSize: '14px' }}>
            Après examen, votre dossier <strong>{dossierLabel || formationIntitule}</strong> n&apos;a
            pas pu être validé par {auteur}.
          </Text>
          <Text
            style={{
              color: CHARTE.texte,
              fontSize: '14px',
              backgroundColor: '#fdf6ec',
              padding: '16px',
              borderRadius: '8px',
            }}
          >
            <strong>Motif du refus :</strong>
            <br />
            {motif}
          </Text>
          <Text style={{ color: CHARTE.texte, fontSize: '14px', marginTop: '16px' }}>
            <strong>Prochaine étape :</strong> corrigez les points signalés dans votre dossier puis
            soumettez-le à nouveau à la validation depuis votre espace formateur.
          </Text>
          <Button
            href={lien}
            style={{
              backgroundColor: CHARTE.vert,
              color: '#ffffff',
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-block',
              marginTop: '8px',
            }}
          >
            Ouvrir mon dossier
          </Button>
          <Hr style={{ borderColor: CHARTE.vertClair, marginTop: '24px' }} />
          <Text style={{ color: CHARTE.texteDoux ?? CHARTE.texte, fontSize: '12px' }}>
            Skills4mation — portage Qualiopi. Cet e-mail est envoyé automatiquement à la suite d&apos;une
            décision de l&apos;équipe.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template: TemplateEntry = {
  component: DossierRefuseEmail,
  subject: (data) =>
    `Dossier refusé — ${String(data?.dossierLabel || data?.formationIntitule || 'votre dossier de formation')}`,
  displayName: 'Dossier refusé (motif)',
  previewData: {
    formateurPrenom: 'Camille',
    dossierLabel: 'ACME - Analyse financière',
    formationIntitule: 'Analyse financière',
    motif: 'Le SIRET de l’entreprise cliente est incomplet et le planning ne couvre pas les 14 heures annoncées.',
    auteur: 'Équipe Skills4mation',
  },
}
