/**
 * Centróides aproximados dos 30 municípios do Mapa do Leite, por `slug` de
 * `service_municipalities` (mesmos slugs gravados na migration
 * `20260912120000_add_service_municipalities`). Valores de referência pública
 * (sede/centro do município), conferidos em 20 de setembro de 2026 — não são
 * geocodificação exata de endereço.
 *
 * Uso exclusivo: o mapa ilustrativo de `/verificar-cobertura` (visão geral da
 * área atendida). Nunca usar para calcular elegibilidade — isso continua
 * dependendo do ViaCEP em `POST /api/coverage` — nem para qualquer decisão
 * operacional. Uma cidade nova cadastrada no painel sem entrada aqui
 * simplesmente não aparece no mapa; a lista textual abaixo dele continua
 * completa mesmo assim.
 */
export const LACTARE_MUNICIPALITY_COORDINATES: Record<
  string,
  { lat: number; lng: number }
> = {
  'sao-paulo': { lat: -23.5505, lng: -46.6333 },
  aruja: { lat: -23.396, lng: -46.3211 },
  barueri: { lat: -23.5106, lng: -46.8761 },
  caieiras: { lat: -23.3644, lng: -46.7408 },
  cajamar: { lat: -23.3547, lng: -46.8778 },
  carapicuiba: { lat: -23.5225, lng: -46.8356 },
  cotia: { lat: -23.6039, lng: -46.9189 },
  diadema: { lat: -23.6858, lng: -46.6206 },
  'embu-das-artes': { lat: -23.6489, lng: -46.8517 },
  'embu-guacu': { lat: -23.8281, lng: -46.8117 },
  'ferraz-de-vasconcelos': { lat: -23.5397, lng: -46.3675 },
  'francisco-morato': { lat: -23.2822, lng: -46.7433 },
  guarulhos: { lat: -23.4538, lng: -46.5333 },
  'itapecerica-da-serra': { lat: -23.7169, lng: -46.8492 },
  itapevi: { lat: -23.5489, lng: -46.9342 },
  itaquaquecetuba: { lat: -23.4864, lng: -46.3486 },
  jandira: { lat: -23.5275, lng: -46.9042 },
  maua: { lat: -23.6678, lng: -46.4614 },
  osasco: { lat: -23.5329, lng: -46.7917 },
  'pirapora-do-bom-jesus': { lat: -23.3897, lng: -46.9986 },
  poa: { lat: -23.5289, lng: -46.3439 },
  'ribeirao-pires': { lat: -23.7147, lng: -46.413 },
  'rio-grande-da-serra': { lat: -23.7439, lng: -46.4083 },
  'santana-de-parnaiba': { lat: -23.4439, lng: -46.9186 },
  'santo-andre': { lat: -23.6639, lng: -46.5383 },
  'sao-bernardo-do-campo': { lat: -23.6914, lng: -46.5646 },
  'sao-caetano-do-sul': { lat: -23.6229, lng: -46.5546 },
  suzano: { lat: -23.5425, lng: -46.3111 },
  'taboao-da-serra': { lat: -23.6089, lng: -46.7828 },
  'vargem-grande-paulista': { lat: -23.5972, lng: -46.9633 },
}
