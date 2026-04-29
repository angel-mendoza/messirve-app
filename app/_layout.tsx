import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/lib/auth-context';
import { MadimiOne_400Regular } from '@expo-google-fonts/madimi-one/400Regular';
import {
  OpenSans_300Light,
  OpenSans_400Regular,
  OpenSans_700Bold,
  useFonts
} from '@expo-google-fonts/open-sans';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import './global.css';

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [fontsLoaded] = useFonts({ OpenSans_300Light, OpenSans_400Regular, OpenSans_700Bold, MadimiOne_400Regular })

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  useEffect(() => {
    if (!fontsLoaded) return

    const handleAuthRedirect = (url: string) => {
      const hashIndex = url.indexOf('#')
      const queryIndex = url.indexOf('?')

      let paramStr = ''
      if (hashIndex !== -1) {
        paramStr = url.slice(hashIndex + 1)
      } else if (queryIndex !== -1) {
        paramStr = url.slice(queryIndex + 1)
      }

      if (!paramStr) return

      const params = new URLSearchParams(paramStr)
      const error = params.get('error')
      const type = params.get('type')
      const accessToken = params.get('access_token')
      const code = params.get('code')

      if (error) {
        const desc = params.get('error_description') ?? 'Error al verificar el correo'
        router.replace({ pathname: '/(auth)/verify-error', params: { message: desc } } as any)
      } else if (type === 'signup' || accessToken || code) {
        router.replace('/(auth)/email-verified' as any)
      }
    }

    Linking.getInitialURL().then(url => {
      if (url) handleAuthRedirect(url)
    })

    const subscription = Linking.addEventListener('url', ({ url }) => handleAuthRedirect(url))
    return () => subscription.remove()
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  )
}
