import { Ionicons } from '@expo/vector-icons'
import { Linking, Pressable, Text } from 'react-native'
import { Brand } from '@/constants/theme'
import { buildMapsUrl } from '@/lib/maps-link'
import type { Service } from '@/types/database'

type Props = {
  service: Pick<Service, 'address' | 'city' | 'latitude' | 'longitude'>
}

export function ServiceAddressLink({ service }: Props) {
  const url = buildMapsUrl(service)
  if (!url) return null

  if (!service.address) {
    return (
      <Pressable
        className="flex-row items-center gap-2 self-start rounded-full px-4 py-2"
        style={{ backgroundColor: Brand.celeste }}
        onPress={() => Linking.openURL(url)}
      >
        <Ionicons name="navigate" size={16} color="#FFFFFF" />
        <Text className="font-instrumentSansSemibold text-sm text-white">Cómo llegar</Text>
      </Pressable>
    )
  }

  return (
    <Pressable className="flex-row items-start gap-3" onPress={() => Linking.openURL(url)}>
      <Ionicons name="location" size={18} color={Brand.celeste} style={{ marginTop: 1 }} />
      <Text
        className="font-instrumentSans text-sm flex-1"
        style={{ color: '#4E7FBF', textDecorationLine: 'underline' }}
      >
        {service.address}, {service.city}
      </Text>
    </Pressable>
  )
}
