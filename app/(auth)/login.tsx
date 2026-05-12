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

export default function LoginScreen() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    <SafeAreaView className="flex-1 bg-white ">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View className="items-center mb-8">
            <MessirveLogo size="lg" />
          </View>

        <Text  className="text-[24px] text-[#1a1a1a] text-center mb-6 leading-[38px]">
          Bienvenidos a todos los{' '}
          <Text className="text-celeste">Argentinos y Uruguayos</Text>{' '}
          por el mundo!
        </Text>

          {/* Email field */}
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

          {/* Password field */}
          <View className="mb-3">
            <Text className="font-sans text-[14px] leading-none text-[#444] mb-1.5">Contraseña</Text>
            <View
              className="flex-row items-center rounded-2xl px-4 h-14 bg-[#EEF6FD] border"
              style={{ borderColor: Brand.celeste + '66' }}
            >
              <Ionicons name="lock-closed" size={20} color={Brand.celeste} style={{ marginRight: 10 }} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#aaa"
                secureTextEntry={!showPassword}
                style={{ flex: 1, fontFamily: 'OpenSans_400Regular', fontSize: 15, lineHeight: 22, color: '#1a1a1a' }}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={Brand.gris} />
              </Pressable>
            </View>
          </View>

          {/* Recover password */}
          <View className="flex-row justify-end mb-8">
            <Pressable onPress={() => router.push('/(auth)/forgot-password' as any)} hitSlop={8}>
              <Text className="font-sans text-sm text-celeste">Recuperar contraseña</Text>
            </Pressable>
          </View>

          {/* Login button */}
          <Pressable
            onPress={handleLogin}
            disabled={loading}
            className="rounded-full items-center justify-center mb-6 bg-dorado h-14"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            <Text className="font-bold text-lg text-white">
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Text>
          </Pressable>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px" style={{ backgroundColor: Brand.celeste + '66' }} />
            {/* <Text className="mx-3 text-celeste text-lg">@</Text> */}
            <View className="flex-1 h-px" style={{ backgroundColor: Brand.celeste + '66' }} />
          </View>

          {/* Social buttons (UI only) */}
          {/* <View className="flex-row justify-center gap-4 mb-8">
            {['logo-google', 'logo-facebook', 'logo-apple'].map((icon) => (
              <View key={icon} className="rounded-full items-center justify-center w-[52px] h-[52px] bg-[#f0f0f0]">
                <Ionicons name={icon as any} size={24} color="#555" />
              </View>
            ))}
          </View> */}

          {/* Register link */}
          <View className="flex-row justify-center">
            <Text className="font-sans text-sm text-[#666]">¿No tienes cuenta?{' '}</Text>
            <Link href={'/(auth)/register' as any} asChild>
              <Pressable>
                <Text className="font-bold text-sm text-celeste">Crear cuenta</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
