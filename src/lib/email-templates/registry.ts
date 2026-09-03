import type { ComponentType } from 'react'

import { template as signatureFormateurTemplate } from './signature-formateur'
import { template as depotFormateurTemplate } from './depot-formateur'
import { template as demandeFinancementOpcoTemplate } from './demande-financement-opco'
import { template as demandeFinancementCpfTemplate } from './demande-financement-cpf'
import { template as relanceDemandeFinancementTemplate } from './relance-demande-financement'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 *
 * Example:
 *   import { template as welcomeTemplate } from './welcome'
 *   // then add to TEMPLATES: 'welcome': welcomeTemplate
 */
export const TEMPLATES: Record<string, TemplateEntry> = {
  'signature-formateur': signatureFormateurTemplate,
  'depot-formateur': depotFormateurTemplate,
  'demande-financement-opco': demandeFinancementOpcoTemplate,
  'demande-financement-cpf': demandeFinancementCpfTemplate,
  'relance-demande-financement': relanceDemandeFinancementTemplate,
}
