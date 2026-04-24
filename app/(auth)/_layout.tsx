import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@/lib/auth-context'
import { ActivityIndicator, View } from 'react-native'

export default function AuthLayout() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#72B8E6" />
      </View>
    )
  }

  if (session) {
    return <Redirect href={'/(tabs)' as any} />
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="email-verified" />
      <Stack.Screen name="verify-error" />
    </Stack>
  )
}
