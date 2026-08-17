import { randomBytes } from 'node:crypto'

/**
 * Gera senha forte alfanumérica de `length` caracteres. Usa bytes aleatórios em
 * base64 e remove `+`, `/`, `=` (regerando até completar o tamanho), garantindo
 * exatamente `length` caracteres sem símbolos que atrapalham copy/paste.
 */
export function generateStrongPassword(length = 20): string {
  let result = ''
  while (result.length < length) {
    result += randomBytes(length).toString('base64').replace(/[+/=]/g, '')
  }
  return result.slice(0, length)
}
