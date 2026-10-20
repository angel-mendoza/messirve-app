import type { Service } from '@/types/database'

type MapsLocation = Pick<Service, 'address' | 'city' | 'latitude' | 'longitude'>

export function hasCoordinates(service: MapsLocation): boolean {
  return service.latitude != null && service.longitude != null
}

// Con coordenadas el link es preciso; sin ellas Google geocodifica "dirección, ciudad".
export function buildMapsUrl(service: MapsLocation): string | null {
  let query: string | null = null

  if (hasCoordinates(service)) {
    query = `${service.latitude},${service.longitude}`
  } else if (service.address) {
    query = [service.address, service.city].filter(Boolean).join(', ')
  }

  if (!query) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
