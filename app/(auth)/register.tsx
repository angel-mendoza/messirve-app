import { MessirveLogo } from '@/components/logoAlt'
import { Brand } from '@/constants/theme'
import { useAuth } from '@/lib/auth-context'
import { Ionicons } from '@expo/vector-icons'
import { Link, router } from 'expo-router'
import { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function RegisterScreen() {
  const { signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completá todos los campos')
      return
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres')
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
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28, paddingTop: 24, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <Pressable onPress={() => router.back()} className="mb-4" hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={Brand.celeste} />
          </Pressable>

          {/* Logo */}
          <View className="items-center mb-6">
            <MessirveLogo size="lg" />
          </View>

          <Text className="font-bold text-[28px] text-[#1a1a1a] text-center mb-6">Crear cuenta</Text>

          {/* Full name */}
          <View className="mb-3">
            <Text className="font-sans text-[14px] leading-none text-[#444] mb-1.5">Nombre completo</Text>
            <View
              className="flex-row items-center rounded-2xl px-4 h-14 bg-[#EEF6FD] border"
              style={{ borderColor: Brand.celeste + '66' }}
            >
              <Ionicons name="person-outline" size={20} color={Brand.celeste} style={{ marginRight: 10 }} />
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Tu nombre"
                placeholderTextColor="#aaa"
                autoCapitalize="words"
                style={{ flex: 1, fontFamily: 'OpenSans_400Regular', fontSize: 15, lineHeight: 22, color: '#1a1a1a' }}
              />
            </View>
          </View>

          {/* Email */}
          <View className="mb-3">
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
                autoComplete="off"
                textContentType="none"
                importantForAutofill="no"
                style={{ flex: 1, fontFamily: 'OpenSans_400Regular', fontSize: 15, lineHeight: 22, color: '#1a1a1a' }}
              />
            </View>
          </View>

          {/* Password */}
          <View className="mb-6">
            <Text className="font-sans text-[14px] leading-none text-[#444] mb-1.5">Contraseña</Text>
            <View
              className="flex-row items-center rounded-2xl px-4 h-14 bg-[#EEF6FD] border"
              style={{ borderColor: Brand.celeste + '66' }}
            >
              <Ionicons name="lock-closed" size={20} color={Brand.celeste} style={{ marginRight: 10 }} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#aaa"
                secureTextEntry={!showPassword}
                style={{ flex: 1, fontFamily: 'OpenSans_400Regular', fontSize: 15, lineHeight: 22, color: '#1a1a1a' }}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={Brand.gris} />
              </Pressable>
            </View>
          </View>

          {/* Register button */}
          <Pressable
            onPress={handleRegister}
            disabled={loading}
            className="rounded-full items-center justify-center mb-6 bg-dorado h-14"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            <Text className="font-bold text-lg text-white">
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Text>
          </Pressable>

          {/* Login link */}
          <View className="flex-row justify-center">
            <Text className="font-sans text-sm text-[#666]">¿Ya tienes cuenta?{' '}</Text>
            <Link href={'/(auth)/login' as any} asChild>
              <Pressable>
                <Text className="font-bold text-sm text-celeste">Ingresar</Text>
              </Pressable>
            </Link>
          </View>
          <View className="flex-row justify-center">
            <Text className="font-bold text-[28px] text-dorado text-center leading-[44px] mt-5">Messirve te sirve!</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
