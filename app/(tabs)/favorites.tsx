import { Brand } from '@/constants/theme'
import { useAuth } from '@/lib/auth-context'
import { getCategoryColor } from '@/lib/category-colors'
import { supabase } from '@/lib/supabase'
import type { Category, ServiceWithStats } from '@/types/database'
import { Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function FavoritesScreen() {
  const { user } = useAuth()
  const [services, setServices] = useState<ServiceWithStats[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const loadCategories = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('order')
    if (data) setCategories(data)
  }, [])

  const loadFavorites = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data: likes } = await supabase
        .from('service_likes')
        .select('service_id')
        .eq('user_id', user.id)

      if (!likes || likes.length === 0) {
        setServices([])
        setLoading(false)
        return
      }

      const serviceIds = likes.map((l) => l.service_id)

      const { data: servicesData } = await supabase
        .from('services')
        .select('*, categories(name, slug, emoji)')
        .in('id', serviceIds)
        .eq('is_active', true)

      if (!servicesData) {
        setServices([])
        setLoading(false)
        return
      }

      const { data: ratingsData } = await supabase
        .from('service_ratings')
        .select('service_id, stars')
        .in('service_id', serviceIds)

      const { data: userRatings } = await supabase
        .from('service_ratings')
        .select('service_id, stars')
        .in('service_id', serviceIds)
        .eq('user_id', user.id)

      const withStats: ServiceWithStats[] = servicesData.map((s) => {
        const sRatings = ratingsData?.filter((r) => r.service_id === s.id) ?? []
        const avg = sRatings.length > 0 ? sRatings.reduce((acc, r) => acc + r.stars, 0) / sRatings.length : 0
        const userRating = userRatings?.find((r) => r.service_id === s.id)?.stars ?? null
        return {
          ...s,
          avg_rating: avg,
          total_ratings: sRatings.length,
          total_likes: likes.filter((l) => l.service_id === s.id).length,
          user_liked: true,
          user_rating: userRating
        }
      })

      setServices(withStats)
    } finally {
      setLoading(false)
    }
  }, [user])

  useFocusEffect(
    useCallback(() => {
      loadFavorites()
      loadCategories()
    }, [loadFavorites, loadCategories])
  )

  const handleUnlike = async (serviceId: string) => {
    if (!user) return
    await supabase.from('service_likes').delete().eq('user_id', user.id).eq('service_id', serviceId)
    setServices((prev) => prev.filter((s) => s.id !== serviceId))
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator size="large" color={Brand.celeste} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="px-5 pt-6 pb-4">
        <Text className="font-anton text-[24px] uppercase" style={{ color: '#2C4A73' }}>
          Favoritos
        </Text>
        <Text className="font-instrumentSans text-[13px] mt-2" style={{ color: '#8A8478' }}>
          {`${services.length} ${services.length === 1 ? 'servicio guardado' : 'servicios guardados'} por vos.`}
        </Text>
      </View>

      {services.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">💛</Text>
          <Text className="font-instrumentSansSemibold text-lg text-center" style={{ color: '#2C4A73' }}>
            Aún no tenés favoritos
          </Text>
          <Text className="font-instrumentSans text-sm text-center mt-2" style={{ color: '#8A8478' }}>
            Explorá los servicios y agregá los que más te gusten
          </Text>
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
            const categorySlug = (item as any).categories?.slug ?? ''
            const categoryIndex = categories.findIndex((c) => c.slug === categorySlug)
            const color = getCategoryColor(categorySlug, categoryIndex >= 0 ? categoryIndex : index)
            const initial = item.name.trim().charAt(0).toUpperCase()
            return (
              <Pressable
                onPress={() => router.push(`/services/${item.id}` as any)}
                className="flex-row items-center bg-white px-4 py-[14px]"
                style={{ borderRadius: 18, borderWidth: 1.5, borderColor: '#ECE6DA', gap: 12 }}
              >
                <View
                  className="items-center justify-center rounded-full bg-white"
                  style={{ width: 40, height: 40, borderWidth: 1.5, borderColor: color.hex }}
                >
                  <Text className="font-anton text-[15px]" style={{ color: color.hex }}>
                    {initial}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="font-instrumentSansSemibold text-[14.5px]" style={{ color: '#1B2A3D' }}>
                    {item.name}
                  </Text>
                  <Text className="font-instrumentSans text-[12px] mt-0.5" style={{ color: '#8A8478' }}>
                    {(item as any).categories?.name ?? ''} · {item.city}
                  </Text>
                </View>
                <Pressable onPress={() => handleUnlike(item.id)} hitSlop={8}>
                  <Ionicons name="heart" size={18} color={Brand.dorado} />
                </Pressable>
              </Pressable>
            )
          }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}
