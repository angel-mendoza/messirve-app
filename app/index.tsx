import { Redirect } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { useAuth } from '@/lib/auth-context'

export default function Index() {
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

  return <Redirect href={'/(auth)/login' as any} />
}
