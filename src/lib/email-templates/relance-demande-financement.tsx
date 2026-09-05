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

export interface RelanceDemandeFinancementProps {
  apprenantPrenom?: string
  dossierLabel?: string
  formationIntitule?: string
  dateDebut?: string
  formateurNom?: string
  lien?: string
}

export function RelanceDemandeFinancementEmail({
  apprenantPrenom = '',
  dossierLabel = '',
  formationIntitule = '',
  dateDebut = '',
  formateurNom = '',
  lien = 'https://skills4mation.com/apprenant',
}: RelanceDemandeFinancementProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{`Votre dossier de formation est validé : déposez votre demande de financement`}</Preview>
      <Body style={{ backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '32px', maxWidth: '600px' }}>
          <Heading style={{ color: CHARTE.vert, fontSize: '20px' }}>
            Dossier validé — à vous de jouer
          </Heading>
          <Hr style={{ borderColor: CHARTE.vertClair, borderTopWidth: '3px' }} />
          <Text style={{ color: CHARTE.texte, fontSize: '14px' }}>
            Bonjour {apprenantPrenom || 'et bienvenue'},
          </Text>
          <Text style={{ color: CHARTE.texte, fontSize: '14px' }}>
            Votre dossier <strong>{dossierLabel || formationIntitule}</strong> vient d&apos;être
            validé par l&apos;équipe Skills4mation.
          </Text>
          <Text style={{ color: CHARTE.texte, fontSize: '14px' }}>
            Formation : <strong>{formationIntitule || 'à préciser'}</strong>
            {dateDebut ? ` — démarrage prévu le ${dateDebut}` : ''}
          </Text>
          <Text style={{ color: CHARTE.texte, fontSize: '14px', marginTop: '16px' }}>
            <strong>Prochaine étape :</strong> déposer votre demande de financement auprès de votre
            financeur (OPCO, employeur ou moncompteformation) avec la convention, le planning et le
            programme de formation joints à votre espace.
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
            Accéder à mes documents
          </Button>
          <Text style={{ color: CHARTE.gris, fontSize: '13px', marginTop: '24px' }}>
            Une question ? Répondez simplement à cet e-mail
            {formateurNom ? `, votre formateur ${formateurNom} vous accompagne` : ''}.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: RelanceDemandeFinancementEmail,
  displayName: 'Relance demande de financement (apprenant)',
  subject: (data: Record<string, any>) =>
    `Déposez votre demande de financement${data['formationIntitule'] ? ` — ${data['formationIntitule']}` : ''}`,
  previewData: {
    apprenantPrenom: 'Marie',
    dossierLabel: 'Marie Dupont - Tableur (Excel)',
    formationIntitule: 'Tableur (Excel)',
    dateDebut: '12/10/2026',
    formateurNom: 'Ludovic Albisser',
    lien: 'https://skills4mation.com/apprenant',
  },
} satisfies TemplateEntry
