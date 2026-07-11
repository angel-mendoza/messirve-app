import { Brand } from '@/constants/theme'
import { useAuth } from '@/lib/auth-context'
import { getCategoryColor } from '@/lib/category-colors'
import { supabase } from '@/lib/supabase'
import type { Category } from '@/types/database'
import { Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type RatedService = {
  id: string
  name: string
  city: string | null
  stars: number
  updatedAt: string
  comment: string | null
  categories: { name: string; emoji: string | null; slug: string } | null
}

export default function RatingsScreen() {
  const { user } = useAuth()
  const [items, setItems] = useState<RatedService[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const { data: categoriesData } = await supabase.from('categories').select('*').order('order')
    if (categoriesData) setCategories(categoriesData)

    const { data } = await supabase
      .from('service_ratings')
      .select('stars, updated_at, services(id, name, city, categories(name, emoji, slug))')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (!data || data.length === 0) {
      setItems([])
      setLoading(false)
      return
    }

    const serviceIds = data.map((r: any) => r.services.id)
    const { data: commentsData } = await supabase
      .from('service_comments')
      .select('service_id, content, created_at')
      .eq('user_id', user.id)
      .in('service_id', serviceIds)
      .order('created_at', { ascending: false })

    const commentByService = new Map<string, string>()
    commentsData?.forEach((c) => {
      if (!commentByService.has(c.service_id)) commentByService.set(c.service_id, c.content)
    })

    setItems(
      data.map((r: any) => ({
        id: r.services.id,
        name: r.services.name,
        city: r.services.city,
        stars: r.stars,
        updatedAt: r.updated_at,
        comment: commentByService.get(r.services.id) ?? null,
        categories: r.services.categories
      }))
    )
    setLoading(false)
  }, [user])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load])
  )

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <View className="px-4 pt-2 pb-4">
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          hitSlop={8}
          className="mb-2 self-start"
        >
          <Ionicons name="chevron-back" size={22} color="#8A8478" />
        </Pressable>
        <Text className="font-anton text-[24px] uppercase" style={{ color: '#2C4A73' }}>
          Mis reseñas
        </Text>
        <Text className="font-instrumentSans text-[13px] mt-2" style={{ color: '#8A8478' }}>
          Lo que dejaste sobre los servicios que probaste.
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Brand.celeste} />
        </View>
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 32,
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const color = getCategoryColor(
              item.categories?.slug ?? '',
              categories.findIndex((c) => c.slug === item.categories?.slug) >= 0
                ? categories.findIndex((c) => c.slug === item.categories?.slug)
                : index
            )
            return <RatingCard item={item} color={color.hex} />
          }}
        />
      )}
    </SafeAreaView>
  )
}

function RatingCard({ item, color }: { item: RatedService; color: string }) {
  const initial = item.name.trim().charAt(0).toUpperCase()
  const date = new Date(item.updatedAt).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  return (
    <Pressable
      onPress={() => router.push(`/services/${item.id}` as any)}
      className="rounded-2xl bg-white p-4"
      style={{ borderWidth: 1.5, borderColor: '#ECE6DA' }}
    >
      <View className="flex-row items-center gap-3">
        <View
          className="items-center justify-center rounded-full bg-white"
          style={{ width: 38, height: 38, borderWidth: 1.5, borderColor: color }}
        >
          <Text className="font-anton text-[14px]" style={{ color }}>
            {initial}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="font-instrumentSansSemibold text-[14.5px]" style={{ color: '#1B2A3D' }}>
            {item.name}
          </Text>
          <Text className="font-instrumentSans text-[11.5px]" style={{ color: '#A9A297' }}>
            {date}
          </Text>
        </View>
        <Text style={{ color: Brand.dorado, fontSize: 15, letterSpacing: 1.5 }}>
          {'★'.repeat(item.stars) + '☆'.repeat(5 - item.stars)}
        </Text>
      </View>

      {item.comment && (
        <Text
          className="font-instrumentSans text-[13.5px] mt-3 leading-[19px]"
          style={{ color: '#43413B', fontStyle: 'italic' }}
        >
          {`"${item.comment}"`}
        </Text>
      )}
    </Pressable>
  )
}

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-10">
      <View
        className="w-[88px] h-[88px] rounded-full items-center justify-center mb-5"
        style={{ backgroundColor: Brand.dorado + '18' }}
      >
        <Text className="text-[40px]">⭐</Text>
      </View>
      <Text className="font-instrumentSansSemibold text-lg text-center mb-2" style={{ color: '#2C4A73' }}>
        Aún no calificaste ningún servicio
      </Text>
      <Text className="font-instrumentSans text-sm text-center leading-5" style={{ color: '#8A8478' }}>
        Explorá los servicios disponibles y dejá tu opinión
      </Text>
      <Pressable
        onPress={() => router.push('/' as any)}
        className="mt-7 rounded-full px-7 py-3"
        style={({ pressed }) => ({ backgroundColor: pressed ? Brand.celeste + 'CC' : Brand.celeste })}
      >
        <Text className="font-anton text-[14px] uppercase text-white" style={{ letterSpacing: 0.5 }}>
          Explorar servicios
        </Text>
      </Pressable>
    </View>
  )
}
