import { MessirveLogo } from '@/components/logoAlt'
import { Brand } from '@/constants/theme'
import { supabase } from '@/lib/supabase'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
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
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView
          contentContainerStyle={{  paddingHorizontal: 28, paddingTop: 32, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <Pressable onPress={() => router.back()} hitSlop={8} className="self-start mb-6">
            <Ionicons name="arrow-back" size={24} color={Brand.celeste} />
          </Pressable>
          {/* Logo */}
          <View className="items-center mb-16">
            <MessirveLogo size="lg" />
          </View>

          {sent ? (
            <View className="flex-1 items-center justify-center px-4">
              <Ionicons name="mail-outline" size={64} color={Brand.celeste} style={{ marginBottom: 20 }} />
              <Text className="font-bold text-[22px] text-[#1a1a1a] text-center mb-3">
                ¡Revisá tu correo!
              </Text>
              <Text className="font-sans text-sm text-[#666] text-center leading-6">
                Te enviamos un enlace para restablecer tu contraseña a{' '}
                <Text className="font-bold text-celeste">{email}</Text>.
              </Text>
              <Pressable
                onPress={() => router.back()}
                disabled={loading}
                className="rounded-full items-center justify-center mb-6 bg-dorado h-14 w-full mt-6"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                <Text className="font-bold text-lg text-white">
                  Volver al inicio de sesión
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View className="mb-10">
                <Text className="font-bold text-[28px] text-[#1a1a1a] text-center leading-[38px]">
                  Recuperar contraseña
                </Text>
                <Text className="font-sans text-sm text-[#666] text-center mt-2 leading-5">
                  Ingresá tu email y te enviamos un enlace para restablecer tu contraseña.
                </Text>
              </View>

              <View className="mb-8">
                <Text className="font-sans text-[14px] leading-none text-[#444] mb-1.5">Email</Text>
                <View
                  className="flex-row items-center rounded-2xl px-4 h-14 bg-[#EEF6FD] border"
                  style={{ borderColor: Brand.celeste + '66' }}
                >
                  <Ionicons name="mail" size={20} color={Brand.celeste} style={{ marginRight: 10 }} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="tu@email.com"
                    placeholderTextColor="#aaa"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{ flex: 1, fontFamily: 'OpenSans_400Regular', fontSize: 15, lineHeight: 22, color: '#1a1a1a' }}
                  />
                </View>
              </View>

              <Pressable
                onPress={handleSend}
                disabled={loading}
                className="rounded-full items-center justify-center bg-dorado h-14"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                <Text className="font-bold text-lg text-white">
                  {loading ? 'Enviando...' : 'Enviar enlace'}
                </Text>
              </Pressable>

              <View className="flex-row justify-center mt-6">
                <Text className="font-sans text-sm text-[#666]">¿Recordaste tu contraseña?{' '}</Text>
                <Pressable onPress={() => router.back()} hitSlop={8}>
                  <Text className="font-bold text-sm text-celeste">Volver al login</Text>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
