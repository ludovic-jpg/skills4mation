import {
  Body,
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

export interface CandidatureFormateurProps {
  prenom?: string
  nom?: string
  email?: string
  telephone?: string
  statut?: string
  expertise?: string
  experience?: string
  volume?: string
  qualiopi?: string
  message?: string
}

const ligne = { color: CHARTE.texte, fontSize: '14px', margin: '4px 0' }

export function CandidatureFormateurEmail({
  prenom = '',
  nom = '',
  email = '',
  telephone = '',
  statut = '',
  expertise = '',
  experience = '',
  volume = '',
  qualiopi = '',
  message = '',
}: CandidatureFormateurProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{`Nouvelle demande de portage Qualiopi : ${prenom} ${nom}`}</Preview>
      <Body style={{ backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <Container style={{ padding: '32px 25px', maxWidth: '600px' }}>
          <Heading style={{ color: CHARTE.vert, fontSize: '20px' }}>
            Nouvelle demande de portage Qualiopi
          </Heading>
          <Hr style={{ borderColor: CHARTE.vertClair, borderTopWidth: '3px' }} />
          <Text style={ligne}>
            <strong>
              {prenom} {nom}
            </strong>
          </Text>
          <Text style={ligne}>Email : {email}</Text>
          {telephone ? <Text style={ligne}>Téléphone : {telephone}</Text> : null}
          {statut ? <Text style={ligne}>Statut : {statut}</Text> : null}
          {expertise ? <Text style={ligne}>Domaines d'expertise : {expertise}</Text> : null}
          {experience ? <Text style={ligne}>Expérience : {experience}</Text> : null}
          {volume ? <Text style={ligne}>Volume annuel envisagé : {volume}</Text> : null}
          {qualiopi ? <Text style={ligne}>Situation Qualiopi : {qualiopi}</Text> : null}
          {message ? (
            <>
              <Hr style={{ borderColor: '#e5e7eb' }} />
              <Text style={ligne}>{message}</Text>
            </>
          ) : null}
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: CandidatureFormateurEmail,
  displayName: 'Demande de portage (formateur)',
  subject: (data: Record<string, any>) =>
    `Nouvelle demande de portage Qualiopi : ${data['prenom'] ?? ''} ${data['nom'] ?? ''}`.trim(),
  to: 'contact@skills4mation.com',
  previewData: {
    prenom: 'Marie',
    nom: 'Dupont',
    email: 'marie.dupont@example.com',
    telephone: '06 12 34 56 78',
    statut: 'Indépendant(e)',
    expertise: 'Management, communication',
    experience: '5 à 10 ans',
    volume: '20 000 à 50 000 € HT',
    qualiopi: 'Non certifié(e)',
    message: 'Je souhaite démarrer rapidement.',
  },
} satisfies TemplateEntry
