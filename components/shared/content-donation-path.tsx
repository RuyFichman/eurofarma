import { CONTENT } from '@/lib/i18n/pt-br'

export function ContentDonationPath() {
  const { donationPath } = CONTENT

  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20 lg:py-24">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-primary text-xs font-medium tracking-[0.24em] uppercase">
            {donationPath.eyebrow}
          </p>
          <h2
            id="donation-path-title"
            className="text-foreground mt-5 text-3xl font-semibold tracking-[-0.03em] text-balance md:text-4xl"
          >
            {donationPath.title}
          </h2>
          <p className="text-muted-foreground mt-4 text-sm text-pretty md:text-base">
            {donationPath.description}
          </p>
        </header>

        <ol
          aria-labelledby="donation-path-title"
          className="md:before:bg-border relative mt-14 grid gap-10 md:mt-16 md:grid-cols-6 md:gap-5 md:before:absolute md:before:top-6 md:before:right-[calc(100%/12)] md:before:left-[calc(100%/12)] md:before:h-px md:before:content-['']"
        >
          {donationPath.steps.map((step, index) => (
            <li
              key={step.title}
              className="relative grid grid-cols-[3rem_minmax(0,1fr)] items-start gap-x-5 md:block md:text-center"
            >
              <span className="bg-primary text-primary-foreground border-primary relative z-10 flex size-12 items-center justify-center rounded-full border text-xs font-semibold shadow-sm md:mx-auto">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="pt-1 md:pt-0">
                <h3 className="text-foreground text-base font-semibold md:mt-6">
                  {step.title}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-6 md:mt-3">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
