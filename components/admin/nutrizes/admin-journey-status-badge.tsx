import { Badge } from '@/components/ui/badge'
import { getJourneyStatusLabel } from '@/lib/admin/nutrizes/journey-labels'
import type { JourneyStatusValue } from '@/lib/journey/status'

const STATUS_VARIANT: Record<
  JourneyStatusValue,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  REGISTERED: 'outline',
  FORM_RECEIVED: 'secondary',
  EXAM_SCHEDULED: 'secondary',
  AWAITING_RESULT: 'secondary',
  ELIGIBLE: 'default',
  NOT_ELIGIBLE: 'destructive',
  KIT_DELIVERED: 'default',
  RECURRING_DONATION_ELIGIBLE: 'default',
}

export function AdminJourneyStatusBadge({
  status,
}: {
  status: JourneyStatusValue
}) {
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      {getJourneyStatusLabel(status)}
    </Badge>
  )
}
