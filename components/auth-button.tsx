import { Brand } from '@/constants/theme'
import { Pressable, Text } from 'react-native'

type Props = {
  onPress: () => void
  disabled?: boolean
  children: string
}

export function AuthButton({ onPress, disabled, children }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="items-center justify-center rounded-full bg-white h-14"
      style={{ borderWidth: 1.5, borderColor: Brand.celesteDeep, opacity: disabled ? 0.5 : 1 }}
    >
      <Text
        className="font-anton text-[15px] uppercase"
        style={{ color: Brand.celesteDeep, letterSpacing: 0.5 }}
      >
        {children}
      </Text>
    </Pressable>
  )
}
