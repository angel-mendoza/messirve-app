import { AuthButton } from '@/components/auth-button'
import { AuthInput } from '@/components/auth-input'
import { MessirveLogo } from '@/components/logoAlt'
import { supabase } from '@/lib/supabase'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSend = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Ingresá tu dirección de correo electrónico')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${process.env.EXPO_PUBLIC_FRONTEND_URL}/auth/confirm`,
    })
    setLoading(false)
    if (error) {
      Alert.alert('Error', error.message)
      return
    }
    setSent(true)
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 24, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <Pressable onPress={() => router.back()} hitSlop={8} className="flex-row items-center self-start mb-6">
            <Ionicons name="chevron-back" size={18} color="#8A8478" />
            <Text className="font-instrumentSansSemibold text-[13.5px] ml-1" style={{ color: '#8A8478' }}>
              Volver a ingresar
            </Text>
          </Pressable>

          {/* Logo */}
          <View className="items-center mb-10">
            <MessirveLogo size="md" />
          </View>

          {sent ? (
            <View className="flex-1 items-center justify-center px-2">
              <Ionicons name="mail-outline" size={64} color="#72A2E0" style={{ marginBottom: 20 }} />
              <Text className="font-anton text-[22px] uppercase text-center mb-3" style={{ color: '#2C4A73' }}>
                ¡Revisá tu correo!
              </Text>
              <Text className="font-instrumentSans text-sm text-center" style={{ color: '#8A8478', lineHeight: 22 }}>
                Te enviamos un enlace para restablecer tu contraseña a{' '}
                <Text className="font-instrumentSansSemibold" style={{ color: '#2C4A73' }}>
                  {email}
                </Text>
                .
              </Text>
              <View className="w-full mt-6">
                <AuthButton onPress={() => router.back()}>Volver al inicio de sesión</AuthButton>
              </View>
            </View>
          ) : (
            <>
              <Text className="font-anton text-[25px] uppercase mb-2" style={{ color: '#2C4A73', lineHeight: 27 }}>
                ¿Olvidaste tu contraseña?
              </Text>
              <Text className="font-instrumentSans text-sm mb-6" style={{ color: '#8A8478', lineHeight: 21 }}>
                Ingresá tu email y te mandamos un enlace para crear una nueva.
              </Text>

              <AuthInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="vos@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View className="mt-3 mb-4">
                <AuthButton onPress={handleSend} disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar enlace'}
                </AuthButton>
              </View>

              {/* Spam note */}
              <View
                className="flex-row items-start gap-3 rounded-2xl bg-white p-4 mb-6"
                style={{ borderWidth: 1.5, borderColor: '#BFD4F0' }}
              >
                <Ionicons name="mail-outline" size={20} color="#72A2E0" />
                <Text className="flex-1 font-instrumentSans text-[13px]" style={{ color: '#5A574F' }}>
                  Revisá también la carpeta de spam.
                </Text>
              </View>

              <View className="flex-row justify-center">
                <Text className="font-instrumentSans text-sm" style={{ color: '#8A8478' }}>
                  ¿Recordaste tu contraseña?{' '}
                </Text>
                <Pressable onPress={() => router.back()} hitSlop={8}>
                  <Text className="font-instrumentSansSemibold text-sm" style={{ color: '#4E7FBF' }}>
                    Volver al login
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
