type LegalSection = {
  readonly title: string
  readonly paragraphs: readonly string[]
}

type LegalPageProps = {
  eyebrow: string
  title: string
  introduction: string
  updatedAt: string
  reviewNotice: string
  sections: readonly LegalSection[]
}

export function LegalPage({
  eyebrow,
  title,
  introduction,
  updatedAt,
  reviewNotice,
  sections,
}: LegalPageProps) {
  return (
    <article className="mx-auto max-w-4xl px-6 py-12 md:py-16">
      <header className="border-border space-y-4 border-b pb-8">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          {eyebrow}
        </p>
        <h1 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">
          {title}
        </h1>
        <p className="text-muted-foreground max-w-3xl text-lg leading-8">
          {introduction}
        </p>
        <p className="text-muted-foreground text-sm">{updatedAt}</p>
        <p className="bg-accent text-accent-foreground rounded-lg px-4 py-3 text-sm leading-6">
          {reviewNotice}
        </p>
      </header>

      <div className="mt-10 space-y-10">
        {sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-foreground text-xl font-semibold">
              {section.title}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-muted-foreground leading-7">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  )
}
