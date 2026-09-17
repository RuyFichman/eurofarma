import { NextResponse } from 'next/server'

import { requireNutrizUser } from '@/lib/auth/get-nutriz-user'
import { getNutrizPersonalExportData } from '@/lib/db/queries/nutriz-personal-area'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'
import { buildNutrizHistoryPdf } from '@/lib/pdf/nutriz-history'
import { formatLongDate, formatTime } from '@/lib/utils/format-date'

export const runtime = 'nodejs'

export async function GET() {
  const nutriz = await requireNutrizUser()
  const data = await getNutrizPersonalExportData(nutriz.id)
  if (!data) return new NextResponse('Not found', { status: 404 })

  const copy = NUTRIZ_AUTH.area.personal.history.pdf
  const pdf = buildNutrizHistoryPdf(
    data,
    copy,
    (status) => NUTRIZ_AUTH.area.journey.status[status].label,
    (date) => `${formatLongDate(date)} ${formatTime(date)}`,
  )

  return new NextResponse(pdf as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        'attachment; filename="historico-pessoal-nutrilink.pdf"',
      'Cache-Control': 'private, no-store',
    },
  })
}
