'use client'

import { useRef, useState, type PointerEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Droplet,
  MessageCircle,
  ShieldCheck,
  Tag,
  Snowflake,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

const ICONS = [Droplet, Snowflake, ShieldCheck, Tag, MessageCircle, Clock3]
const CARD_STYLES = [
  {
    card: 'border-primary bg-primary text-primary-foreground shadow-xl shadow-primary/20',
    icon: 'text-primary-foreground/20',
    tag: 'text-primary-foreground/75',
    description: 'text-primary-foreground/80',
  },
  {
    card: 'bg-card shadow-lg shadow-primary/10',
    icon: 'text-primary/12',
    tag: 'text-primary',
    description: 'text-muted-foreground',
  },
  {
    card: 'border-primary bg-primary text-primary-foreground shadow-xl shadow-primary/20',
    icon: 'text-primary-foreground/20',
    tag: 'text-primary-foreground/75',
    description: 'text-primary-foreground/80',
  },
  {
    card: 'bg-card shadow-lg shadow-primary/10',
    icon: 'text-primary/12',
    tag: 'text-primary',
    description: 'text-muted-foreground',
  },
  {
    card: 'border-primary bg-primary text-primary-foreground shadow-xl shadow-primary/20',
    icon: 'text-primary-foreground/20',
    tag: 'text-primary-foreground/75',
    description: 'text-primary-foreground/80',
  },
  {
    card: 'bg-card shadow-lg shadow-primary/10',
    icon: 'text-primary/12',
    tag: 'text-primary',
    description: 'text-muted-foreground',
  },
] as const

type Tip = {
  tag: string
  title: string
  description: string
}

type HomeTipsCarouselProps = {
  tips: readonly Tip[]
}

function getRelativePosition(
  index: number,
  activeIndex: number,
  count: number,
) {
  const distance = index - activeIndex
  const half = count / 2

  if (distance > half) return distance - count
  if (distance < -half) return distance + count
  return distance
}

export function HomeTipsCarousel({ tips }: HomeTipsCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [dragStartX, setDragStartX] = useState<number | null>(null)
  const wasDragged = useRef(false)

  const moveTo = (index: number) => {
    setActiveIndex((index + tips.length) % tips.length)
  }

  const previous = () => moveTo(activeIndex - 1)
  const next = () => moveTo(activeIndex + 1)

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    wasDragged.current = false
    setDragStartX(event.clientX)
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStartX === null) return

    const distance = event.clientX - dragStartX
    setDragStartX(null)

    if (Math.abs(distance) < 40) return

    wasDragged.current = true
    if (distance > 0) previous()
    else next()
  }

  return (
    <div
      role="region"
      aria-roledescription="carrossel"
      aria-label="Orientações para doação"
      className="relative mt-10 select-none md:mt-14"
    >
      <div
        className="relative h-[20rem] overflow-hidden rounded-[2.25rem] md:h-[19rem]"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => setDragStartX(null)}
      >
        {tips.map((tip, index) => {
          const Icon = ICONS[index] ?? Droplet
          const style = CARD_STYLES[index] ?? CARD_STYLES[0]
          const position = getRelativePosition(index, activeIndex, tips.length)
          const isActive = position === 0
          const isPreview = Math.abs(position) === 1
          const transform = `translateX(calc(-50% + ${position * 58}%)) scale(${isActive ? 1 : 0.9})`

          return (
            <article
              key={tip.title}
              aria-hidden={!isActive}
              className={`absolute inset-y-0 left-1/2 flex w-[76%] cursor-pointer flex-col overflow-hidden rounded-[2rem] border p-7 transition-[transform,opacity,filter] duration-500 ease-out md:w-[50%] md:p-7 ${style.card} ${
                isActive
                  ? 'z-20 opacity-100'
                  : isPreview
                    ? 'z-10 opacity-45 blur-[2px] hover:opacity-70'
                    : 'pointer-events-none z-0 opacity-0'
              }`}
              style={{ transform }}
              onClick={() => {
                if (wasDragged.current) {
                  wasDragged.current = false
                  return
                }

                moveTo(index)
              }}
            >
              <Icon
                className={`pointer-events-none absolute -top-5 -right-5 size-36 ${style.icon}`}
                aria-hidden="true"
              />

              <div className="relative z-10 mt-auto max-w-md">
                <p
                  className={`text-xs font-semibold tracking-[0.18em] uppercase ${style.tag}`}
                >
                  {tip.tag}
                </p>
                <h3 className="mt-5 text-2xl leading-[1.1] text-balance md:text-3xl">
                  {tip.title}
                </h3>
                <p
                  className={`mt-3 text-sm leading-6 text-pretty md:text-base ${style.description}`}
                >
                  {tip.description}
                </p>
              </div>
            </article>
          )
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={previous}
          aria-label="Ver orientação anterior"
        >
          <ArrowLeft aria-hidden="true" />
        </Button>
        <div className="flex gap-2" aria-label="Posição no carrossel">
          {tips.map((tip, index) => (
            <button
              key={tip.title}
              type="button"
              className={`h-2 rounded-full transition-all ${
                index === activeIndex
                  ? 'bg-primary hover:bg-primary/80 w-7'
                  : 'bg-border hover:bg-muted-foreground/50 w-2'
              }`}
              onClick={() => moveTo(index)}
              aria-label={`Ver ${tip.title}`}
              aria-current={index === activeIndex ? 'true' : undefined}
            />
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={next}
          aria-label="Ver próxima orientação"
        >
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
