import { MessirveLogo } from '@/components/logo'
import { Brand } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function VerifyErrorScreen() {
  const { message } = useLocalSearchParams<{ message?: string }>()

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-8">
        <MessirveLogo size="md" />

        <View
          className="mt-8 mb-6 w-20 h-20 rounded-full items-center justify-center"
          style={{ backgroundColor: '#FFEBEE' }}
        >
          <Ionicons name="close-circle" size={52} color="#F44336" />
        </View>

        <Text className="font-bold text-[28px] text-[#1a1a1a] text-center mb-4">
          Error de verificación
        </Text>

        <Text
          className="font-sans text-base text-[#555] text-center mb-10"
          style={{ lineHeight: 24 }}
        >
          {message || 'No pudimos verificar tu correo.\nEl enlace puede haber expirado o ya fue utilizado.'}
        </Text>

        <Pressable
          onPress={() => router.replace('/(auth)/login' as any)}
          className="rounded-full items-center justify-center w-full h-14"
          style={{ backgroundColor: Brand.celeste }}
        >
          <Text className="font-bold text-lg text-white">Volver al inicio de sesión</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
