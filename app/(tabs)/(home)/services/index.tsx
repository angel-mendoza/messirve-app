import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'
import { MessirveLogo } from '@/components/logo'
import type { Category } from '@/types/database'
import { Brand } from '@/constants/theme'

const CATEGORY_COLORS = [
  '#72B8E6',
  '#C9A96D',
  '#82C4A0',
  '#E891A0',
  '#9B8EC4',
  '#E8A66A',
  '#6AB8C8'
]

export default function ServiceCategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .order('name')
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
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <Pressable onPress={() => router.back()} hitSlop={8} className="mr-3">
          <Ionicons name="arrow-back" size={24} color={Brand.celeste} />
        </Pressable>
        <View className="flex-1 items-center">
          <MessirveLogo size="sm" />
        </View>
        <View className="w-8" />
      </View>

      {/* Title */}
      <View className="px-6 pb-6 pt-2">
        <Text className="font-bold text-[28px] text-[#1a1a1a] text-center">Servicios</Text>
        <Text className="font-light text-sm text-[#666] text-center mt-1">Seleccioná una categoría</Text>
      </View>

      {/* Categories grid */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => router.push(`/services/category/${item.slug}` as any)}
            className="flex-1 rounded-3xl items-center py-6 px-4 bg-white"
            style={({ pressed }) => ({
              opacity: pressed ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            })}
          >
            {/* Icon circle */}
            <View
              className="rounded-full items-center justify-center mb-3 w-[72px] h-[72px]"
              style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] + '22' }}
            >
              <Text className="text-[32px]">{item.emoji ?? '🏷️'}</Text>
            </View>
            <Text
              className="font-bold text-xs text-[#333] text-center leading-[17px]"
              numberOfLines={3}
            >
              {item.name}
            </Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  )
}
