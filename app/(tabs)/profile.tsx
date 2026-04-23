import { useEffect, useState } from 'react'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Brand } from '@/constants/theme'
import type { Profile } from '@/types/database'

export default function ProfileScreen() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [editName, setEditName] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

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
      <View className="px-5 pt-6 pb-4">
        <Text className="font-bold text-[26px] text-[#1a1a1a]">Mi perfil</Text>
      </View>

      {/* Avatar */}
      <View className="items-center py-8">
        <View className="rounded-full items-center justify-center mb-3 w-[88px] h-[88px] bg-celeste">
          <Text className="font-bold text-[32px] text-white">{initials}</Text>
        </View>

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
