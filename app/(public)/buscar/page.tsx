import { redirect } from 'next/navigation'

/** Compatibilidade com links antigos da busca nacional, já descontinuada. */
export default function LegacySearchRedirect() {
  redirect('/verificar-cobertura')
}
