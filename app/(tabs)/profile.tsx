import { Brand } from '@/constants/theme'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ProfileScreen() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [editName, setEditName] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile(data)
          setEditName(data.full_name?.normalize('NFC') ?? '')
        }
      })
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, full_name: editName.trim() })
    setSaving(false)
    if (error) {
      Alert.alert('Error', 'No se pudo guardar el nombre')
    } else {
      setProfile((prev) => (prev ? { ...prev, full_name: editName.trim() } : prev))
      setEditing(false)
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
      base64: true,
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

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: user!.id, avatar_url: publicUrl })

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
    : user?.email?.[0].toUpperCase() ?? '?'

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="font-bold px-5 pt-6 pb-4">
        <Text className="text-[26px] text-[#1a1a1a]">Mi perfil</Text>
      </View>

      {/* Avatar */}
      <View className="items-center py-8">
        <Pressable onPress={handleAvatarChange} disabled={uploading} className="mb-3">
          <View className="rounded-full w-[88px] h-[88px] items-center justify-center overflow-hidden bg-celeste">
            {profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={{ width: 88, height: 88 }}
                contentFit="cover"
              />
            ) : (
              <Text className="font-bold text-[32px] text-white">{initials}</Text>
            )}
          </View>
          <View className="absolute bottom-0 right-0 bg-white rounded-full p-1 border border-gray-100" style={{ shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}>
            {uploading ? (
              <ActivityIndicator size={14} color={Brand.celeste} />
            ) : (
              <Ionicons name="camera" size={14} color={Brand.celeste} />
            )}
          </View>
        </Pressable>

        {editing ? (
          <View className="flex-row items-center gap-2 px-8">
            <TextInput
              value={editName}
              onChangeText={setEditName}
              className="flex-1 font-sans text-base text-[#1a1a1a] border-b-2 border-b-celeste pb-1 text-center"
              autoFocus
            />
            <Pressable onPress={handleSave} disabled={saving}>
              <Ionicons name="checkmark-circle" size={28} color={Brand.celeste} />
            </Pressable>
            <Pressable onPress={() => setEditing(false)}>
              <Ionicons name="close-circle" size={28} color={Brand.gris} />
            </Pressable>
          </View>
        ) : (
          <View className="flex-row items-center gap-2">
            <Text className="font-bold text-xl text-[#1a1a1a]">{displayName ?? 'Sin nombre'}</Text>
            <Pressable onPress={() => setEditing(true)} hitSlop={8}>
              <Ionicons name="pencil" size={16} color={Brand.gris} />
            </Pressable>
          </View>
        )}

        <Text className="font-light text-sm text-[#888] mt-1">{user?.email}</Text>
      </View>

      {/* Menu items */}
      <View className="px-5 gap-2">
        <View className="rounded-2xl overflow-hidden bg-[#F8F9FA]">
          <Pressable
            onPress={() => router.push('/favorites' as any)}
            className="flex-row items-center px-4 py-4"
            style={({ pressed }) => ({
              borderBottomWidth: 1,
              borderBottomColor: '#EFEFEF',
              backgroundColor: pressed ? '#F5F5F5' : 'transparent'
            })}
          >
            <Ionicons name="heart-outline" size={22} color={Brand.celeste} style={{ marginRight: 14 }} />
            <Text className="font-sans text-base text-[#333] flex-1">Mis favoritos</Text>
            <Ionicons name="chevron-forward" size={18} color={Brand.gris} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/ratings' as any)}
            className="flex-row items-center px-4 py-4"
            style={({ pressed }) => ({ backgroundColor: pressed ? '#F5F5F5' : 'transparent' })}
          >
            <Ionicons name="star-outline" size={22} color={Brand.celeste} style={{ marginRight: 14 }} />
            <Text className="font-sans text-base text-[#333] flex-1">Mis calificaciones</Text>
            <Ionicons name="chevron-forward" size={18} color={Brand.gris} />
          </Pressable>
        </View>

        <Pressable
          onPress={handleSignOut}
          className="flex-row items-center px-4 py-4 rounded-2xl mt-4 bg-[#FFF0F0]"
        >
          <Ionicons name="log-out-outline" size={22} color="#e53e3e" style={{ marginRight: 14 }} />
          <Text className="font-bold text-base text-[#e53e3e]">Cerrar sesión</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
