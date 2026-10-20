import { Ionicons } from '@expo/vector-icons'
import { Linking, Pressable, Text, View } from 'react-native'
import { Brand } from '@/constants/theme'
import { buildWhatsAppUrl } from '@/lib/whatsapp-link'

type Props = {
  phone: string
}

export function ServicePhoneLink({ phone }: Props) {
  const url = buildWhatsAppUrl(phone)

  if (!url) {
    return (
      <View className="flex-row items-center gap-3">
        <Ionicons name="call" size={18} color={Brand.celeste} />
        <Text className="font-instrumentSans text-sm" style={{ color: '#5A574F' }}>
          {phone}
        </Text>
      </View>
    )
  }

  return (
    <Pressable className="flex-row items-center gap-3" onPress={() => Linking.openURL(url)}>
      <Ionicons name="logo-whatsapp" size={18} color={Brand.celeste} />
      <Text className="font-instrumentSans text-sm" style={{ color: '#4E7FBF', textDecorationLine: 'underline' }}>
        {phone}
      </Text>
    </Pressable>
  )
}
