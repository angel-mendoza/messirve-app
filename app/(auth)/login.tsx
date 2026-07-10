import { AuthButton } from '@/components/auth-button'
import { AuthInput } from '@/components/auth-input'
import { MessirveLogo } from '@/components/logoAlt'
import { useAuth } from '@/lib/auth-context'
import { Link, router } from 'expo-router'
import { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function LoginScreen() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completá todos los campos')
      return
    }
    setLoading(true)
    const { error } = await signIn(email.trim(), password)
    setLoading(false)
    if (error) {
      Alert.alert('Error al ingresar', error)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 24, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View className="items-center mb-8">
            <MessirveLogo size="md" />
          </View>

          <Text className="font-anton text-[28px] uppercase mb-2" style={{ color: '#2C4A73', lineHeight: 30 }}>
            Bienvenido de vuelta
          </Text>
          <Text className="font-instrumentSans text-[14.5px] mb-6" style={{ color: '#8A8478' }}>
            Ingresá para seguir descubriendo lo nuestro.
          </Text>

          <AuthInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="vos@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            textContentType="none"
            importantForAutofill="no"
          />

          <AuthInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            isPassword
            rightLabel={
              <Pressable onPress={() => router.push('/(auth)/forgot-password' as any)} hitSlop={8}>
                <Text className="font-instrumentSansSemibold text-[12.5px]" style={{ color: '#4E7FBF' }}>
                  ¿La olvidaste?
                </Text>
              </Pressable>
            }
          />

          <View className="mt-5 mb-6">
            <AuthButton onPress={handleLogin} disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </AuthButton>
          </View>

          {/* Register link */}
          <View className="flex-row justify-center">
            <Text className="font-instrumentSans text-sm" style={{ color: '#8A8478' }}>
              ¿No tenés cuenta?{' '}
            </Text>
            <Link href={'/(auth)/register' as any} asChild>
              <Pressable>
                <Text className="font-instrumentSansSemibold text-sm" style={{ color: '#4E7FBF' }}>
                  Registrate
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
