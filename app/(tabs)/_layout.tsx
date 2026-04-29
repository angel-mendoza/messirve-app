import { Redirect, Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { ActivityIndicator, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '@/lib/auth-context'
import { HapticTab } from '@/components/haptic-tab'
import { Brand } from '@/constants/theme'

export default function TabLayout() {
  const { session, loading } = useAuth()
  const insets = useSafeAreaInsets()

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={Brand.celeste} />
      </View>
    )
  }

  if (!session) {
    return <Redirect href={'/(auth)/login' as any} />
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Brand.celeste,
        tabBarInactiveTintColor: Brand.gris,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          paddingTop: 4,
          paddingBottom: insets.bottom,
          height: 62 + insets.bottom
        },
        tabBarLabelStyle: {
          fontFamily: 'OpenSans_400Regular',
          fontSize: 11,
          marginBottom: 4
        }
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color, size }) => <Ionicons name="heart" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />
        }}
      />
      <Tabs.Screen name="services" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="ratings" options={{ href: null, headerShown: false }} />
    </Tabs>
  )
}
