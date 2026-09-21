import { MyBadgesCard } from '@/components/nutriz/my-badges-card'
import { PostalDoBemCard } from '@/components/nutriz/postal-do-bem-card'

export function PersonalHighlights({
  registeredAt,
  donationDates,
  hasReferredSignup,
}: {
  registeredAt: Date
  donationDates: readonly Date[]
  hasReferredSignup: boolean
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 md:items-start">
      <MyBadgesCard
        registeredAt={registeredAt}
        donationDates={donationDates}
        hasReferredSignup={hasReferredSignup}
      />

      <PostalDoBemCard available={donationDates.length > 0} />
    </div>
  )
}
