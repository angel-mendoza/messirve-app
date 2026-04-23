import { Pressable, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Brand } from '@/constants/theme'

type Props = {
  value: number
  onChange?: (stars: number) => void
  size?: number
  readonly?: boolean
}

export function StarRating({ value, onChange, size = 24, readonly = false }: Props) {
  return (
    <View className="flex-row gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(value)
        const icon = filled ? 'star' : 'star-outline'
        if (readonly) {
          return <Ionicons key={star} name={icon} size={size} color={Brand.dorado} />
        }
        return (
          <Pressable key={star} onPress={() => onChange?.(star)} hitSlop={6}>
            <Ionicons name={icon} size={size} color={Brand.dorado} />
          </Pressable>
        )
      })}
    </View>
  )
}
