import { ServiceCard } from '@/components/service-card'
import { Brand } from '@/constants/theme'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import type { ServiceWithStats } from '@/types/database'
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function FavoritesScreen() {
  const { user } = useAuth()
  const [services, setServices] = useState<ServiceWithStats[]>([])
  const [loading, setLoading] = useState(true)

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
    }, [loadFavorites])
  )

  const handleUnlike = async (serviceId: string) => {
    if (!user) return
    await supabase.from('service_likes').delete().eq('user_id', user.id).eq('service_id', serviceId)
    setServices((prev) => prev.filter((s) => s.id !== serviceId))
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={Brand.celeste} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-5 pt-6 pb-4">
        <Text className="text-[26px] text-[#1a1a1a]">Mis favoritos</Text>
        <Text className="font-light text-sm text-[#888] mt-0.5">Servicios que te gustaron</Text>
      </View>

      {services.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="font-bold text-5xl mb-4">💛</Text>
          <Text  className="text-lg text-[#333] text-center">
            Aún no tenés favoritos
          </Text>
          <Text className="font-bold text-sm text-[#888] text-center mt-2">
            Explorá los servicios y agregá los que más te gusten
          </Text>
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              onPress={() => router.push(`/services/${item.id}` as any)}
              onLike={() => handleUnlike(item.id)}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}
