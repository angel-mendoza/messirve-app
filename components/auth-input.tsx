import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native'

type Props = TextInputProps & {
  label: string
  rightLabel?: React.ReactNode
  isPassword?: boolean
}

export function AuthInput({ label, rightLabel, isPassword, secureTextEntry, ...props }: Props) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <View className="mb-3">
      <View className="flex-row items-center justify-between mb-1.5">
        <Text className="font-instrumentSansSemibold text-[13px]" style={{ color: '#43413B' }}>
          {label}
        </Text>
        {rightLabel}
      </View>
      <View
        className="flex-row items-center rounded-xl bg-white px-3.5 h-14"
        style={{ borderWidth: 1.5, borderColor: '#E4DFD3' }}
      >
        <TextInput
          {...props}
          secureTextEntry={isPassword ? !showPassword : secureTextEntry}
          placeholderTextColor="#A9A297"
          className="flex-1 font-instrumentSans text-[15px]"
          style={{ color: '#1B2A3D' }}
        />
        {isPassword && (
          <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={18} color="#A9A297" />
          </Pressable>
        )}
      </View>
    </View>
  )
}
