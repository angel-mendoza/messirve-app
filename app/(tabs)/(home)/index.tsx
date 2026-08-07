import { Brand } from '@/constants/theme'
import { getCategoryColor, getCategoryIconSource } from '@/lib/category-colors'
import { supabase } from '@/lib/supabase'
import type { Category } from '@/types/database'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function HomeScreen() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  const handleSearch = () => {
    const q = query.trim()
    if (q) router.push(`/services/search?q=${encodeURIComponent(q)}` as any)
  }

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
      <SafeAreaView className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator size="large" color={Brand.celeste} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 5, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="mb-4">
            <Image
              source={require('@/assets/images/mobile-hero.png')}
              className="w-full"
              style={{ height: undefined, aspectRatio: 1.4 }}
              contentFit="cover"
            />
            <View
              className="mx-4 flex-row items-center gap-3 rounded-full bg-white px-6 py-4"
              style={{
                marginTop: -18,
                zIndex: 2,
                shadowColor: Brand.celesteDeep,
                shadowOpacity: 0.16,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 8 },
                elevation: 4
              }}
            >
              <Ionicons name="search-outline" size={18} color="#8A8478" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                placeholder="¿Qué estás buscando?"
                placeholderTextColor="#A9A297"
                className="flex-1 font-instrumentSans text-[14px]"
                style={{ color: '#2C4A73' }}
              />
            </View>
          </View>
        }
        ListFooterComponent={
          <View className="mt-6 mb-2 flex-row items-center justify-center gap-2">
            <Text className="font-anton text-[16px] italic text-celeste uppercase">Messirve</Text>
            <Ionicons name="star" size={14} color={Brand.dorado} />
            <Text className="font-anton text-[16px] italic text-dorado uppercase">Te sirve</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const color = getCategoryColor(item.slug, index)
          const iconSource = getCategoryIconSource(item.slug)
          return (
            <Pressable
              onPress={() => router.push(`/services/category/${item.slug}` as any)}
              className="flex-row items-center bg-white px-[13px] py-[6px] mx-4"
              style={({ pressed }) => ({
                opacity: pressed ? 0.85 : 1,
                borderRadius: 15,
                borderWidth: 1.5,
                borderColor: color.hex,
                boxShadow: '0 1px 6px rgba(27, 42, 61, 0.04)'
              })}
            >
              <View
                className="items-center justify-center rounded-full bg-white mr-4"
                style={{ width: 27, height: 27, borderWidth: 1.5, borderColor: color.hex }}
              >
                <Image source={iconSource} style={{ width: 14, height: 14 }} contentFit="contain" />
              </View>
              <Text
                className="flex-1 font-anton text-[15px] uppercase"
                style={{ color: '#2C4A73', letterSpacing: 0.4 }}
              >
                {item.name}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={color.hex} />
            </Pressable>
          )
        }}
      />
    </SafeAreaView>
  )
}
