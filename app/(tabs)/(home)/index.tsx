import { MessirveLogo } from '@/components/logoAlt'
import { Brand } from '@/constants/theme'
import { supabase } from '@/lib/supabase'
import type { Category } from '@/types/database'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const CATEGORY_COLORS = [
  '#72B8E6',
  '#C9A96D',
  '#82C4A0',
  '#E891A0',
  '#9B8EC4',
  '#E8A66A',
  '#6AB8C8'
]

export default function HomeScreen() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .order('order')
      .then(({ data }) => {
        if (data) setCategories(data)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#E6F4FE]">
        <ActivityIndicator size="large" color={Brand.celeste} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-[#E6F4FE]">
      {/* Header with logo */}
      <View className="items-center pb-4 mt-2">
        <MessirveLogo size="md" />
      </View>

      {/* Title */}
      <View className="px-6 pt-2 pb-6">
        <Text className="text-[24px] text-[#1a1a1a] text-center">
          Servicios y emprendimientos de compatriotas en{' '}
          <Text className="text-celeste">Barcelona</Text>
        </Text>
      </View>

      {/* Categories list */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => router.push(`/services/category/${item.slug}` as any)}
            className="flex-row items-center bg-white rounded-2xl px-4 py-[14px]"
            style={({ pressed }) => ({
              opacity: pressed ? 0.85 : 1,
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)'
            })}
          >
            <View
              className="rounded-full items-center justify-center w-11 h-11 mr-4"
              style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] + '33' }}
            >
              <Text className="text-[20px]">{item.emoji ?? '🏷️'}</Text>
            </View>
            <Text className="flex-1 font-bold text-[12px] text-[#1a1a1a]" style={{ letterSpacing: 0.4 }}>
              {item.name.toUpperCase()}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={Brand.gris} />
          </Pressable>
        )}
      />
    </SafeAreaView>
  )
}
