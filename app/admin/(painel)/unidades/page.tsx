import { redirect } from 'next/navigation'

/** A gestão de unidades foi substituída pela gestão da área por município. */
export default function LegacyAdminUnitsRedirect() {
  redirect('/admin/municipios')
}
