import { AuthButton } from '@/components/auth-button'
import { AuthInput } from '@/components/auth-input'
import { MessirveLogo } from '@/components/logoAlt'
import { Brand } from '@/constants/theme'
import { useAuth } from '@/lib/auth-context'
import { Ionicons } from '@expo/vector-icons'
import { Link, router } from 'expo-router'
import { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function RegisterScreen() {
  const { signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completá todos los campos')
      return
    }
    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (!termsAccepted) {
      Alert.alert('Error', 'Tenés que aceptar los términos y la política de privacidad')
      return
    }
    setLoading(true)
    const { error } = await signUp(email.trim(), password, fullName.trim())
    setLoading(false)
    if (error) {
      Alert.alert('Error al registrarse', error)
    } else {
      Alert.alert('¡Registro exitoso!', 'Revisá tu email para confirmar tu cuenta.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login' as any) }
      ])
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
          <View className="items-center mb-6">
            <MessirveLogo size="md" />
          </View>

          <Text className="font-anton text-[28px] uppercase mb-2" style={{ color: '#2C4A73', lineHeight: 30 }}>
            Creá tu cuenta
          </Text>
          <Text className="font-instrumentSans text-[14.5px] mb-6" style={{ color: '#8A8478' }}>
            Sumate a la comunidad. Lleva un minuto.
          </Text>

          <AuthInput
            label="Nombre completo"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Valentina Gómez"
            autoCapitalize="words"
          />

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
            placeholder="Mínimo 8 caracteres"
            isPassword
          />

          {/* Terms checkbox */}
          <Pressable onPress={() => setTermsAccepted((v) => !v)} className="flex-row items-start gap-2.5 mt-2 mb-6">
            <View
              className="items-center justify-center rounded-md mt-0.5"
              style={{
                width: 20,
                height: 20,
                borderWidth: 2,
                borderColor: termsAccepted ? Brand.celeste : '#A9A297',
                backgroundColor: termsAccepted ? Brand.celeste : '#fff'
              }}
            >
              {termsAccepted && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text className="flex-1 font-instrumentSans text-[13px]" style={{ color: '#5A574F', lineHeight: 19 }}>
              Acepto los{' '}
              <Text className="font-instrumentSansSemibold" style={{ color: '#4E7FBF' }}>
                términos
              </Text>{' '}
              y la{' '}
              <Text className="font-instrumentSansSemibold" style={{ color: '#4E7FBF' }}>
                política de privacidad
              </Text>
              .
            </Text>
          </Pressable>

          <View className="mb-6">
            <AuthButton onPress={handleRegister} disabled={loading || !termsAccepted}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </AuthButton>
          </View>

          {/* Login link */}
          <View className="flex-row justify-center">
            <Text className="font-instrumentSans text-sm" style={{ color: '#8A8478' }}>
              ¿Ya tenés cuenta?{' '}
            </Text>
            <Link href={'/(auth)/login' as any} asChild>
              <Pressable>
                <Text className="font-instrumentSansSemibold text-sm" style={{ color: '#4E7FBF' }}>
                  Ingresá
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
