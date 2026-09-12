import { redirect } from 'next/navigation'

export default function LegacyNewUnitRedirect() {
  redirect('/admin/municipios/novo')
}
