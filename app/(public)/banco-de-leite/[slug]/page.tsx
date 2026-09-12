import { redirect } from 'next/navigation'

/** As páginas públicas de unidades foram retiradas do escopo Lactare-only. */
export default function LegacyUnitRedirect() {
  redirect('/verificar-cobertura')
}
