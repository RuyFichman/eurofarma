import { describe, expect, it } from 'vitest'

import { getNutrizBadges, NUTRIZ_BADGE_IDS } from '../../lib/journey/badges'

const registeredAt = new Date('2026-09-05T12:00:00.000Z')

function badges(input: {
  donationDates?: readonly Date[]
  hasReferredSignup?: boolean
}) {
  const list = getNutrizBadges({
    registeredAt,
    donationDates: input.donationDates ?? [],
    hasReferredSignup: input.hasReferredSignup ?? false,
  })

  return new Map(list.map((badge) => [badge.id, badge]))
}

describe('selos da área pessoal', () => {
  it('apresenta os cinco selos na ordem da jornada', () => {
    const list = getNutrizBadges({
      registeredAt,
      donationDates: [],
      hasReferredSignup: false,
    })

    expect(list.map((badge) => badge.id)).toEqual([...NUTRIZ_BADGE_IDS])
  })

  it('conquista o primeiro passo na data do cadastro', () => {
    const first = badges({}).get('FIRST_STEP')

    expect(first?.achieved).toBe(true)
    expect(first?.achievedAt).toEqual(registeredAt)
    expect(first?.progress).toBeNull()
  })

  it('usa a data da própria doação que concedeu cada selo', () => {
    const donations = [
      new Date('2026-08-20T10:00:00.000Z'),
      new Date('2026-09-10T10:00:00.000Z'),
      new Date('2026-09-20T10:00:00.000Z'),
    ]
    const result = badges({ donationDates: donations })

    expect(result.get('LIFE_GIFT')?.achievedAt).toEqual(donations[0])
    expect(result.get('GENEROUS_HEART')?.achievedAt).toEqual(donations[1])
    expect(result.get('STEADY_SOURCE')?.achieved).toBe(false)
    expect(result.get('STEADY_SOURCE')?.achievedAt).toBeNull()
  })

  it('ordena as doações antes de escolher a data do selo', () => {
    const result = badges({
      donationDates: [
        new Date('2026-09-10T10:00:00.000Z'),
        new Date('2026-08-20T10:00:00.000Z'),
      ],
    })

    expect(result.get('LIFE_GIFT')?.achievedAt).toEqual(
      new Date('2026-08-20T10:00:00.000Z'),
    )
    expect(result.get('GENEROUS_HEART')?.achievedAt).toEqual(
      new Date('2026-09-10T10:00:00.000Z'),
    )
  })

  it('mostra progresso somente em selo que exige mais de uma doação', () => {
    const result = badges({
      donationDates: [new Date('2026-08-20T10:00:00.000Z')],
    })

    expect(result.get('LIFE_GIFT')?.progress).toBeNull()
    expect(result.get('GENEROUS_HEART')?.progress).toEqual({
      done: 1,
      target: 2,
    })
    expect(result.get('STEADY_SOURCE')?.progress).toEqual({
      done: 1,
      target: 5,
    })
  })

  it('limita o progresso ao alvo do selo já conquistado', () => {
    const result = badges({
      donationDates: [
        new Date('2026-08-01T10:00:00.000Z'),
        new Date('2026-08-10T10:00:00.000Z'),
        new Date('2026-08-20T10:00:00.000Z'),
      ],
    })

    expect(result.get('GENEROUS_HEART')?.achieved).toBe(true)
    expect(result.get('GENEROUS_HEART')?.progress).toEqual({
      done: 2,
      target: 2,
    })
    expect(result.get('STEADY_SOURCE')?.progress).toEqual({
      done: 3,
      target: 5,
    })
  })

  it('conquista a corrente do bem sem data nem contagem de quem se cadastrou', () => {
    expect(badges({ hasReferredSignup: false }).get('CHAIN_OF_GOOD')).toEqual({
      id: 'CHAIN_OF_GOOD',
      achieved: false,
      achievedAt: null,
      progress: null,
    })
    expect(badges({ hasReferredSignup: true }).get('CHAIN_OF_GOOD')).toEqual({
      id: 'CHAIN_OF_GOOD',
      achieved: true,
      achievedAt: null,
      progress: null,
    })
  })

  it('não deriva doação de aptidão registrada: só as datas recebidas contam', () => {
    const result = badges({ donationDates: [] })

    expect(result.get('LIFE_GIFT')?.achieved).toBe(false)
    expect(result.get('GENEROUS_HEART')?.progress).toEqual({
      done: 0,
      target: 2,
    })
  })
})
