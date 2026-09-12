import { describe, expect, it } from 'vitest'

import {
  INITIAL_SERVICE_MUNICIPALITIES,
  SERVICE_REGION_VALUES,
} from '../../lib/constants/service-municipalities'

describe('lista inicial de municípios do Lactare', () => {
  it('contém exatamente 30 cidades únicas de São Paulo, Brazil', () => {
    expect(INITIAL_SERVICE_MUNICIPALITIES).toHaveLength(30)
    expect(
      new Set(INITIAL_SERVICE_MUNICIPALITIES.map((item) => item.name)).size,
    ).toBe(30)
    expect(
      INITIAL_SERVICE_MUNICIPALITIES.every(
        (item) => item.state === 'SP' && item.country === 'Brazil',
      ),
    ).toBe(true)
  })

  it('distribui todos os municípios entre as seis sub-regiões', () => {
    const counts = Object.fromEntries(
      SERVICE_REGION_VALUES.map((region) => [
        region,
        INITIAL_SERVICE_MUNICIPALITIES.filter((item) => item.region === region)
          .length,
      ]),
    )

    expect(counts).toEqual({
      CAPITAL: 1,
      WEST: 9,
      SOUTHWEST: 4,
      ABC: 7,
      NORTH: 3,
      EAST_ALTO_TIETE: 6,
    })
  })
})
