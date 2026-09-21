import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  POSTAL_DO_BEM_FILE_NAME,
  POSTAL_DO_BEM_IMAGE_PATH,
  POSTAL_DO_BEM_SHARE_TEXT,
} from '../../lib/sharing/postal-do-bem'

describe('Postal do Bem', () => {
  it('usa mensagem universal sem dado pessoal nem impacto quantificado', () => {
    expect(POSTAL_DO_BEM_SHARE_TEXT).toContain('corrente de cuidado')
    expect(POSTAL_DO_BEM_SHARE_TEXT).toContain('Lactare')
    expect(POSTAL_DO_BEM_SHARE_TEXT).not.toMatch(/\d/u)
    expect(POSTAL_DO_BEM_SHARE_TEXT).not.toMatch(/salv|cura|paciente/iu)
  })

  it('aponta para um PNG 1080 por 1350 válido', () => {
    expect(POSTAL_DO_BEM_IMAGE_PATH).toBe('/images/postal-do-bem.png')
    expect(POSTAL_DO_BEM_FILE_NAME).toBe('postal-do-bem-nutrilink.png')

    const png = readFileSync(
      resolve(process.cwd(), 'public/images/postal-do-bem.png'),
    )
    expect(png.subarray(1, 4).toString('ascii')).toBe('PNG')
    expect(png.readUInt32BE(16)).toBe(1080)
    expect(png.readUInt32BE(20)).toBe(1350)
  })
})
