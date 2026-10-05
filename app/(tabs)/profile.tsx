import { AuthButton } from '@/components/auth-button'
import { AuthInput } from '@/components/auth-input'
import { Brand } from '@/constants/theme'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type OwnService = { id: string; name: string; is_active: boolean }
type ClientRequest = { status: 'pending' | 'approved' | 'rejected' }

export default function ProfileScreen() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [clientRequest, setClientRequest] = useState<ClientRequest | null>(null)
  const [ownService, setOwnService] = useState<OwnService | null>(null)

  const loadProfile = useCallback(async () => {
    if (!user) return
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (!data) return
    setProfile(data)
    setEditName(data.full_name?.normalize('NFC') ?? '')

    const { data: requestData } = await supabase
      .from('client_requests')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle()
    setClientRequest(requestData ?? null)

    if (data.role === 'client') {
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
  }, [user])

  useFocusEffect(
    useCallback(() => {
      loadProfile()
    }, [loadProfile])
  )

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const { error } = await supabase.from('profiles').upsert({ id: user.id, full_name: editName.trim() })
    setSaving(false)
    if (error) {
      Alert.alert('Error', 'No se pudo guardar el nombre')
    } else {
      setProfile((prev) => (prev ? { ...prev, full_name: editName.trim() } : prev))
    }
  }

  const handleAvatarChange = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tu galería para cambiar la foto.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true
    })

    if (result.canceled || !result.assets[0]) return

    const asset = result.assets[0]
    if (!asset.base64) {
      Alert.alert('Error', 'No se pudo leer la imagen')
      return
    }

    setUploading(true)

    try {
      const ext = asset.mimeType === 'image/png' ? 'png' : 'jpg'
      const path = `${user!.id}/avatar-${Date.now()}.${ext}`
      const contentType = asset.mimeType ?? 'image/jpeg'

      const binary = atob(asset.base64)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, bytes, { contentType, upsert: false })

      if (uploadError) {
        console.error('Upload error:', uploadError.message, uploadError)
        Alert.alert('Error', uploadError.message)
        return
      }

      const {
        data: { publicUrl }
      } = supabase.storage.from('avatars').getPublicUrl(path)

      const { error: profileError } = await supabase.from('profiles').upsert({ id: user!.id, avatar_url: publicUrl })

      if (profileError) {
        Alert.alert('Error', 'No se pudo actualizar el perfil')
        return
      }

      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : prev))
    } finally {
      setUploading(false)
    }
  }

  const handleSignOut = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que querés salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: signOut }
    ])
  }

  const displayName = profile?.full_name?.normalize('NFC') ?? null
  const initials = displayName
    ? displayName
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : (user?.email?.[0].toUpperCase() ?? '?')

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })
    : null

  const subscriptionSubtitle = (() => {
    if (profile?.role === 'admin') return 'Administrador'
    if (profile?.role === 'client') {
      if (!ownService) return 'Cliente · Sin servicio publicado'
      return ownService.is_active ? 'Cliente · Publicado' : 'Cliente · Pendiente de revisión'
    }
    if (clientRequest?.status === 'pending') return 'Solicitud pendiente'
    if (clientRequest?.status === 'rejected') return 'Solicitud rechazada'
    return 'Sin activar'
  })()

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="px-5 pt-7 pb-2 flex-row items-center gap-3.5">
        <Pressable onPress={handleAvatarChange} disabled={uploading}>
          <View
            className="rounded-full w-[58px] h-[58px] items-center justify-center overflow-hidden bg-white"
            style={{ borderWidth: 2, borderColor: Brand.celeste }}
          >
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={{ width: 58, height: 58 }} contentFit="cover" />
            ) : (
              <Text className="font-anton text-[22px]" style={{ color: Brand.celeste }}>
                {initials}
              </Text>
            )}
          </View>
          <View
            className="absolute bottom-0 right-0 bg-white rounded-full p-1 border border-gray-100"
            style={{ shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}
          >
            {uploading ? (
              <ActivityIndicator size={11} color={Brand.celeste} />
            ) : (
              <Ionicons name="camera" size={11} color={Brand.celeste} />
            )}
          </View>
        </Pressable>

        <View>
          <Text className="font-anton text-[19px] uppercase" style={{ color: '#2C4A73' }}>
            {displayName ?? 'Sin nombre'}
          </Text>
          <Text className="font-instrumentSans text-[12.5px] mt-0.5" style={{ color: '#8A8478' }}>
            {memberSince ? `Miembro desde ${memberSince} · Barcelona` : 'Barcelona'}
          </Text>
        </View>
      </View>

      {/* Form */}
      <View className="px-5 pt-5">
        <AuthInput label="Nombre completo" value={editName} onChangeText={setEditName} />
        <AuthInput label="Email" value={user?.email ?? ''} editable={false} />

        <View className="mt-1">
          <AuthButton onPress={handleSave} disabled={saving}>
            {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
          </AuthButton>
        </View>

        {/* Subscription */}
        <Pressable
          onPress={() => router.push('/subscription' as any)}
          className="mt-4 rounded-2xl bg-white px-4 py-[14px] flex-row items-center justify-between"
          style={{ borderWidth: 1.5, borderColor: '#ECE6DA' }}
        >
          <View>
            <Text className="font-instrumentSansSemibold text-[13.5px]" style={{ color: '#1B2A3D' }}>
              Mi suscripción
            </Text>
            <Text className="font-instrumentSans text-[11.5px] mt-0.5" style={{ color: '#8A8478' }}>
              {subscriptionSubtitle}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Brand.dorado} />
        </Pressable>

        {/* Menu items */}
        <View
          className="mt-4 rounded-2xl overflow-hidden bg-white"
          style={{ borderWidth: 1.5, borderColor: '#ECE6DA' }}
        >
          <Pressable
            onPress={() => router.push('/favorites' as any)}
            className="flex-row items-center px-4 py-4"
            style={({ pressed }) => ({
              borderBottomWidth: 1,
              borderBottomColor: '#ECE6DA',
              backgroundColor: pressed ? '#FAF7F0' : 'transparent'
            })}
          >
            <Ionicons name="heart-outline" size={20} color={Brand.celeste} style={{ marginRight: 14 }} />
            <Text className="font-instrumentSans text-[14.5px] flex-1" style={{ color: '#1B2A3D' }}>
              Mis favoritos
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#8A8478" />
          </Pressable>
          <Pressable
            onPress={() => router.push('/ratings' as any)}
            className="flex-row items-center px-4 py-4"
            style={({ pressed }) => ({ backgroundColor: pressed ? '#FAF7F0' : 'transparent' })}
          >
            <Ionicons name="star-outline" size={20} color={Brand.celeste} style={{ marginRight: 14 }} />
            <Text className="font-instrumentSans text-[14.5px] flex-1" style={{ color: '#1B2A3D' }}>
              Mis calificaciones
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#8A8478" />
          </Pressable>
        </View>

        <Pressable
          onPress={handleSignOut}
          className="items-center justify-center rounded-full bg-white h-14 mt-5"
          style={{ borderWidth: 1.5, borderColor: Brand.celesteDeep, opacity: 1 }}
        >
          <Text className="font-anton text-[15px] uppercase" style={{ color: Brand.celesteDeep, letterSpacing: 0.5 }}>
            Cerrar sesión
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
