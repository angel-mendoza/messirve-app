import { AuthButton } from '@/components/auth-button'
import { Brand } from '@/constants/theme'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import type { ClientRequestStatus } from '@/types/database'
import { Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type OwnService = { id: string; name: string; is_active: boolean }
type ClientRequest = { id: string; status: ClientRequestStatus; message: string | null }

export default function SubscriptionScreen() {
  const { user } = useAuth()
  const [role, setRole] = useState<'admin' | 'client' | 'user' | null>(null)
  const [clientRequest, setClientRequest] = useState<ClientRequest | null>(null)
  const [ownService, setOwnService] = useState<OwnService | null>(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const { data: profileData } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const userRole = profileData?.role ?? 'user'
    setRole(userRole)

    const { data: requestData } = await supabase
      .from('client_requests')
      .select('id, status, message')
      .eq('user_id', user.id)
      .maybeSingle()
    setClientRequest(requestData ?? null)

    if (userRole === 'client') {
      const { data: serviceData } = await supabase
        .from('services')
        .select('id, name, is_active')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()
      setOwnService(serviceData ?? null)
    } else {
      setOwnService(null)
    }

    setLoading(false)
  }, [user])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load])
  )

  const handleRequest = async () => {
    if (!user) return
    setSubmitting(true)
    const trimmedMessage = message.trim() || null

    if (clientRequest && clientRequest.status !== 'rejected') {
      setSubmitting(false)
      Alert.alert('Error', 'Ya tenés una solicitud registrada')
      return
    }

    const { error } = clientRequest
      ? await supabase
          .from('client_requests')
          .update({
            status: 'pending',
            message: trimmedMessage,
            reviewed_at: null,
            reviewed_by: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', clientRequest.id)
      : await supabase.from('client_requests').insert({ user_id: user.id, message: trimmedMessage, status: 'pending' })

    setSubmitting(false)
    if (error) {
      Alert.alert('Error', 'No se pudo enviar la solicitud. Intentá de nuevo.')
      return
    }

    setMessage('')
    setRetrying(false)
    load()
  }

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <View className="px-4 pt-4 pb-4 flex-row items-center gap-2.5">
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={20} color="#8A8478" />
        </Pressable>
        <Text className="font-anton text-[22px] uppercase" style={{ color: '#2C4A73' }}>
          Mi suscripción
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Brand.celeste} />
        </View>
      ) : (
        <View className="flex-1 items-center justify-center px-6 pb-16">
          {role === 'client' ? (
            ownService ? (
              <View
                className="w-full rounded-2xl bg-white p-5"
                style={{ borderWidth: 1.5, borderColor: '#ECE6DA' }}
              >
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="font-anton text-[15px] uppercase" style={{ color: '#2C4A73' }}>
                      Mi servicio
                    </Text>
                    <Text className="font-instrumentSans text-[15px] mt-1" style={{ color: '#5A574F' }}>
                      {ownService.name}
                    </Text>
                  </View>
                  <View
                    className="rounded-full px-3 py-1.5"
                    style={{
                      backgroundColor: ownService.is_active ? '#E7F1E9' : Brand.dorado + '26'
                    }}
                  >
                    <Text
                      className="font-instrumentSansSemibold text-[12.5px]"
                      style={{ color: ownService.is_active ? '#2E7D46' : '#8A6B2E' }}
                    >
                      {ownService.is_active ? 'Publicado' : 'Pendiente de revisión'}
                    </Text>
                  </View>
                </View>
                <Text className="font-instrumentSans text-[12.5px] mt-4" style={{ color: '#A9A297' }}>
                  Gestioná tu servicio desde la web de Messirve.
                </Text>
              </View>
            ) : (
              <SubscriptionCard>
                <Text className="font-instrumentSans text-[14px] leading-[21.7px] text-center" style={{ color: '#5A574F' }}>
                  Todavía no tenés un servicio publicado. Sumate como emprendedor para aparecer en búsquedas y
                  gestionar tu suscripción acá.
                </Text>
                <Text className="font-instrumentSans text-[12.5px] mt-4 text-center" style={{ color: '#A9A297' }}>
                  Gestioná tu servicio desde la web de Messirve.
                </Text>
              </SubscriptionCard>
            )
          ) : clientRequest?.status === 'pending' ? (
            <SubscriptionCard>
              <StatusPill tone="pending" label="Tu solicitud está pendiente de revisión" />
            </SubscriptionCard>
          ) : clientRequest?.status === 'rejected' && !retrying ? (
            <SubscriptionCard>
              <StatusPill tone="rejected" label="Tu solicitud fue rechazada" />
              <View className="mt-4 w-full">
                <AuthButton onPress={() => setRetrying(true)}>Volver a solicitar</AuthButton>
              </View>
            </SubscriptionCard>
          ) : (
            <SubscriptionCard>
              <Text className="font-instrumentSans text-[14px] leading-[21.7px] text-center" style={{ color: '#5A574F' }}>
                Todavía no tenés un servicio publicado. Sumate como emprendedor para aparecer en búsquedas y
                gestionar tu suscripción acá.
              </Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Contanos sobre tu negocio (opcional)"
                placeholderTextColor="#A9A297"
                multiline
                numberOfLines={3}
                className="w-full mt-5 font-instrumentSans text-[14px]"
                style={{
                  borderWidth: 1.5,
                  borderColor: '#E4DFD3',
                  borderRadius: 12,
                  padding: 12,
                  minHeight: 80,
                  color: '#1B2A3D',
                  textAlignVertical: 'top'
                }}
              />
              <View className="mt-4 w-full">
                <AuthButton onPress={handleRequest} disabled={submitting} accentColor={Brand.dorado}>
                  {submitting ? 'ENVIANDO...' : 'SUMATE COMO EMPRENDEDOR'}
                </AuthButton>
              </View>
            </SubscriptionCard>
          )}
        </View>
      )}
    </SafeAreaView>
  )
}

function SubscriptionCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      className="w-full rounded-2xl bg-white items-center px-7 py-9"
      style={{ borderWidth: 1.5, borderColor: '#ECE6DA' }}
    >
      <View
        className="rounded-full items-center justify-center"
        style={{ width: 56, height: 56, borderWidth: 2, borderColor: Brand.dorado }}
      >
        <Ionicons name="star" size={24} color={Brand.dorado} />
      </View>
      <View className="w-full mt-[22px] items-center">{children}</View>
    </View>
  )
}

function StatusPill({ tone, label }: { tone: 'pending' | 'rejected'; label: string }) {
  const bg = tone === 'pending' ? Brand.dorado + '26' : '#FFF0F0'
  const color = tone === 'pending' ? '#8A6B2E' : '#e53e3e'
  return (
    <View className="rounded-lg px-3 py-2" style={{ backgroundColor: bg }}>
      <Text className="font-instrumentSansSemibold text-[13px]" style={{ color }}>
        {label}
      </Text>
    </View>
  )
}
