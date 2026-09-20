/**
 * Selos da área pessoal da nutriz.
 *
 * Eles são **derivados**, não armazenados. A fonte é o histórico append-only
 * da jornada — cada `DONATION_CONFIRMED` registrado pelo Lactare é uma doação
 * — e a atribuição de indicação do RF15. Derivar evita um segundo estado que
 * poderia divergir do histórico e é o que permite mostrar progresso
 * ("1 de 2 doações"), algo que uma linha booleana em `nutriz_recognitions`
 * não expressa. Aquela tabela continua sendo o registro do RF14/UC15, escrito
 * na mesma transação da mudança de status.
 *
 * Nada aqui infere doação a partir de registros pessoais de extração nem
 * trata `RECURRING_DONATION_ELIGIBLE` como coleta: aquilo é aptidão
 * registrada, não doação.
 */

export const NUTRIZ_BADGE_IDS = [
  'FIRST_STEP',
  'LIFE_GIFT',
  'GENEROUS_HEART',
  'STEADY_SOURCE',
  'CHAIN_OF_GOOD',
] as const

export type NutrizBadgeId = (typeof NUTRIZ_BADGE_IDS)[number]

export type NutrizBadgeState = {
  id: NutrizBadgeId
  achieved: boolean
  /**
   * Data do evento que concedeu o selo. Fica `null` enquanto o selo não foi
   * conquistado e também em `CHAIN_OF_GOOD`, cuja data seria o cadastro de
   * outra pessoa — o RF15 atribui a indicação sem expor dados de quem foi
   * indicada, e uma data já seria um dado dela.
   */
  achievedAt: Date | null
  /**
   * Só existe nos selos que exigem mais de uma doação; os demais são binários
   * e não exibem contagem.
   */
  progress: { done: number; target: number } | null
}

/** Quantas doações confirmadas cada selo de doação exige. */
const DONATION_TARGET = {
  LIFE_GIFT: 1,
  GENEROUS_HEART: 2,
  STEADY_SOURCE: 5,
} as const satisfies Partial<Record<NutrizBadgeId, number>>

export function getNutrizBadges(input: {
  registeredAt: Date
  /** Datas das doações confirmadas; a ordem de entrada não importa. */
  donationDates: readonly Date[]
  hasReferredSignup: boolean
}): readonly NutrizBadgeState[] {
  const donations = [...input.donationDates].sort(
    (a, b) => a.getTime() - b.getTime(),
  )

  function donationBadge(id: keyof typeof DONATION_TARGET): NutrizBadgeState {
    const target = DONATION_TARGET[id]
    const achievedAt = donations[target - 1] ?? null

    return {
      id,
      achieved: achievedAt !== null,
      achievedAt,
      progress:
        target > 1
          ? { done: Math.min(donations.length, target), target }
          : null,
    }
  }

  return [
    {
      id: 'FIRST_STEP',
      achieved: true,
      achievedAt: input.registeredAt,
      progress: null,
    },
    donationBadge('LIFE_GIFT'),
    donationBadge('GENEROUS_HEART'),
    donationBadge('STEADY_SOURCE'),
    {
      id: 'CHAIN_OF_GOOD',
      achieved: input.hasReferredSignup,
      achievedAt: null,
      progress: null,
    },
  ]
}
