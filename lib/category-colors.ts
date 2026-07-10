export const CATEGORY_COLORS = [
  { hex: '#CFB176', class: 'dorado' },
  { hex: '#72A2E0', class: 'celeste' },
  { hex: '#1B2A3D', class: 'celesteDeep' }
] as const

const CATEGORY_COLOR_OVERRIDES: Record<string, number> = {
  'arte-entretenimiento': 1,
  'indumentaria-belleza': 2,
  'hospedaje-turistas': 1
}

export function getCategoryColor(slug: string, index: number) {
  return CATEGORY_COLORS[CATEGORY_COLOR_OVERRIDES[slug] ?? index % 3]
}

const CATEGORY_ICON_SOURCES: Record<string, ReturnType<typeof require>> = {
  hogar: require('@/assets/images/icons/hogar.svg'),
  gastronomia: require('@/assets/images/icons/gastronomia.svg'),
  'salud-bienestar': require('@/assets/images/icons/salud-y-bienestar.svg'),
  'arte-entretenimiento': require('@/assets/images/icons/arte-y-entretenimiento.svg'),
  'indumentaria-belleza': require('@/assets/images/icons/indumentaria-y-belleza.svg'),
  'hospedaje-turistas': require('@/assets/images/icons/hospedaje-para-turistas.svg'),
  'grupos-whatsapp': require('@/assets/images/icons/grupos-de-whatsapp.svg'),
  'asesoria-gestoria': require('@/assets/images/icons/gestoria-para-inmigrantes.svg')
}

export function getCategoryIconSource(slug: string) {
  return CATEGORY_ICON_SOURCES[slug] ?? require('@/assets/images/icons/otros.svg')
}
