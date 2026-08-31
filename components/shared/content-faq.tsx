import Link from 'next/link'
import { ChevronDown, FileText, HelpCircle, MessageCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ContentSectionHeader } from '@/components/shared/content-section-header'
import { CONTENT } from '@/lib/i18n/pt-br'

export function ContentFaq() {
  const { faq } = CONTENT

  return (
    <section
      id="duvidas-frequentes"
      className="mx-auto max-w-3xl px-6 py-16 md:py-20"
    >
      <ContentSectionHeader
        icon={HelpCircle}
        eyebrow={faq.eyebrow}
        title={faq.title}
      />

      <ul className="mt-8 space-y-3">
        {faq.items.map((item) => (
          <li key={item.question}>
            <details className="group bg-card rounded-xl border">
              <summary className="flex list-none items-center justify-between gap-4 p-5 font-medium [&::-webkit-details-marker]:hidden">
                <span className="flex items-start gap-3">
                  <HelpCircle
                    className="text-primary mt-0.5 size-5 shrink-0"
                    aria-hidden="true"
                  />
                  {item.question}
                </span>
                <ChevronDown
                  className="text-primary size-5 shrink-0 transition-transform duration-200 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="text-muted-foreground px-5 pb-5 pl-13 leading-relaxed">
                {item.answer}
              </p>
            </details>
          </li>
        ))}
      </ul>

      <aside
        aria-labelledby="faq-help-title"
        className="bg-card mt-10 rounded-2xl border p-6 text-center shadow-sm sm:p-8"
      >
        <h3 id="faq-help-title" className="text-base sm:text-lg">
          {faq.help.title}
        </h3>

        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90 h-11 rounded-full px-7 has-[>svg]:px-6"
          >
            <Link href={faq.help.whatsapp.href}>
              <MessageCircle aria-hidden="true" />
              {faq.help.whatsapp.label}
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-11 rounded-full bg-transparent px-7 has-[>svg]:px-6"
          >
            <Link href={faq.help.articles.href}>
              <FileText aria-hidden="true" />
              {faq.help.articles.label}
            </Link>
          </Button>
        </div>
      </aside>
    </section>
  )
}
