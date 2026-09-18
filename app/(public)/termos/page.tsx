import type { Metadata } from 'next'

import { LegalPage } from '@/components/shared/legal-page'
import { LEGAL } from '@/lib/i18n/pt-br'

export const metadata: Metadata = LEGAL.terms.meta

export default function TermsPage() {
  return <LegalPage {...LEGAL.terms} />
}
