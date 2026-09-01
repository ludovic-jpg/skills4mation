import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

export interface DemandeFinancementCpfProps {
  formateurPrenom?: string
  apprenantNom?: string
  dossierLabel?: string
  formationIntitule?: string
  dureeHeures?: string
  prixCpf?: string
  coutCertification?: string
  lienMonCompteFormation?: string
  lien?: string
}

export function DemandeFinancementCpfEmail({
  formateurPrenom = '',
  apprenantNom = "l'apprenant",
  dossierLabel = '',
  formationIntitule = '',
  dureeHeures = '',
  prixCpf = '',
  coutCertification = '',
  lienMonCompteFormation = '',
  lien = 'https://skills4mation.com/espace/dossiers',
}: DemandeFinancementCpfProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{`Lien CPF à transférer à ${apprenantNom}`}</Preview>
      <Body style={{ backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '32px', maxWidth: '600px' }}>
          <Heading style={{ color: '#0d2a4a', fontSize: '20px' }}>
            Dossier validé — inscription CPF
          </Heading>
          <Hr style={{ borderColor: '#4f8f2f', borderTopWidth: '3px' }} />
          <Text style={{ color: '#12181f', fontSize: '14px' }}>Bonjour {formateurPrenom},</Text>
          <Text style={{ color: '#12181f', fontSize: '14px' }}>
            Le dossier <strong>{dossierLabel || formationIntitule}</strong> est validé et signé par
            Skills4mation. Le financement se fera par le CPF de {apprenantNom}.
          </Text>
          <Text style={{ color: '#12181f', fontSize: '14px' }}>
            Formation : <strong>{formationIntitule || 'à préciser'}</strong>
            {dureeHeures ? ` — ${dureeHeures} heures` : ''}
            {prixCpf ? ` — ${prixCpf}` : ''}
          </Text>
          {coutCertification ? (
            <Text style={{ color: '#12181f', fontSize: '14px' }}>
              Coût de la certification (ligne distincte) : <strong>{coutCertification}</strong>
            </Text>
          ) : null}
          <Text style={{ color: '#12181f', fontSize: '14px', marginTop: '16px' }}>
            <strong>À transférer à l&apos;apprenant :</strong> il doit s&apos;inscrire depuis son
            compte moncompteformation.gouv.fr via le lien exact de cette durée.
          </Text>
          {lienMonCompteFormation ? (
            <Text style={{ color: '#12181f', fontSize: '13px', wordBreak: 'break-all' }}>
              <Link href={lienMonCompteFormation}>{lienMonCompteFormation}</Link>
            </Text>
          ) : (
            <Text style={{ color: '#a13c1c', fontSize: '13px' }}>
              Aucun lien moncompteformation n&apos;est enregistré pour cette formation et cette
              durée : contactez Skills4mation avant de transférer cet e-mail.
            </Text>
          )}
          <Button
            href={lienMonCompteFormation || lien}
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
            Transférer à l&apos;apprenant
          </Button>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: DemandeFinancementCpfEmail,
  displayName: 'Demande de financement CPF (formateur)',
  subject: (data: Record<string, any>) =>
    `Inscription CPF à transmettre${data['formationIntitule'] ? ` — ${data['formationIntitule']}` : ''}`,
  previewData: {
    formateurPrenom: 'Ludovic',
    apprenantNom: 'Marie Dupont',
    dossierLabel: 'Marie Dupont - Tableur (Excel)',
    formationIntitule: 'Tableur (Excel)',
    dureeHeures: '28',
    prixCpf: '1 400,00 €',
    coutCertification: '89,00 €',
    lienMonCompteFormation: 'https://www.moncompteformation.gouv.fr/espace-prive/html/#/formation',
    lien: 'https://skills4mation.com/espace/dossiers',
  },
} satisfies TemplateEntry
