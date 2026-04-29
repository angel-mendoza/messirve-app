import { ServiceCard } from '@/components/service-card'
import { Brand } from '@/constants/theme'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import type { ServiceWithStats } from '@/types/database'
import { Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ServicesByCategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const { user } = useAuth()
  const [services, setServices] = useState<ServiceWithStats[]>([])
  const [filtered, setFiltered] = useState<ServiceWithStats[]>([])
  const [categoryName, setCategoryName] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchServices = async () => {
    if (!user || !slug) return
    setLoading(true)

    const { data: catData } = await supabase
      .from('categories')
      .select('id, name')
      .eq('slug', slug)
      .single()

    if (!catData) {
      setLoading(false)
      return
    }
    setCategoryName(catData.name)

    const { data: servicesData } = await supabase
      .from('services')
      .select('*, categories(name, slug, emoji)')
      .eq('category_id', catData.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (!servicesData || servicesData.length === 0) {
      setServices([])
      setFiltered([])
      setLoading(false)
      return
    }

    const ids = servicesData.map((s) => s.id)

    const [{ data: ratingsData }, { data: likesAll }, { data: userLikes }, { data: userRatings }] =
      await Promise.all([
        supabase.from('service_ratings').select('service_id, stars').in('service_id', ids),
        supabase.from('service_likes').select('service_id').in('service_id', ids),
        supabase.from('service_likes').select('service_id').in('service_id', ids).eq('user_id', user.id),
        supabase.from('service_ratings').select('service_id, stars').in('service_id', ids).eq('user_id', user.id)
      ])

    const withStats: ServiceWithStats[] = servicesData.map((s) => {
      const sRatings = ratingsData?.filter((r) => r.service_id === s.id) ?? []
      const avg = sRatings.length > 0 ? sRatings.reduce((a, r) => a + r.stars, 0) / sRatings.length : 0
      return {
        ...s,
        avg_rating: avg,
        total_ratings: sRatings.length,
        total_likes: likesAll?.filter((l) => l.service_id === s.id).length ?? 0,
        user_liked: !!userLikes?.find((l) => l.service_id === s.id),
        user_rating: userRatings?.find((r) => r.service_id === s.id)?.stars ?? null
      }
    })

    setServices(withStats)
    setFiltered(withStats)
    setLoading(false)
  }

  useFocusEffect(
    useCallback(() => {
      fetchServices()
    }, [user, slug])
  )

  const handleSearch = (text: string) => {
    setSearch(text)
    if (!text.trim()) {
      setFiltered(services)
      return
    }
    const lower = text.toLowerCase()
    setFiltered(services.filter((s) => s.name.toLowerCase().includes(lower) || s.description?.toLowerCase().includes(lower)))
  }

  const handleLike = async (serviceId: string) => {
    if (!user) return
    const service = services.find((s) => s.id === serviceId)
    if (!service) return

    const update = (prev: ServiceWithStats[]) =>
      prev.map((s) =>
        s.id === serviceId
          ? { ...s, user_liked: !s.user_liked, total_likes: s.user_liked ? s.total_likes - 1 : s.total_likes + 1 }
          : s
      )
    setServices(update)
    setFiltered(update)

    if (service.user_liked) {
      await supabase.from('service_likes').delete().eq('user_id', user.id).eq('service_id', serviceId)
    } else {
      await supabase.from('service_likes').insert({ user_id: user.id, service_id: serviceId })
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-4 pb-4 bg-celeste">
        <View className="flex-row items-center mb-3">
          <Pressable onPress={() => router.back()} hitSlop={8} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text className="font-bold text-xl text-white flex-1">{categoryName || 'Servicios'}</Text>
        </View>

        {/* Search bar */}
        <View className="flex-row items-center rounded-2xl px-4 bg-white h-11">
          <Ionicons name="search" size={18} color={Brand.gris} style={{ marginRight: 8 }} />
          <TextInput
            value={search}
            onChangeText={handleSearch}
            placeholder="Buscar servicios..."
            placeholderTextColor="#aaa"
            className="flex-1 font-sans text-sm text-[#1a1a1a]"
          />
          {search.length > 0 && (
            <Pressable onPress={() => handleSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={Brand.gris} />
            </Pressable>
          )}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Brand.celeste} />
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-[40px] mb-3">🔍</Text>
          <Text className="font-bold text-lg text-[#333] text-center">
            {search ? 'Sin resultados' : 'Sin servicios disponibles'}
          </Text>
          <Text className="font-light text-sm text-[#888] text-center mt-2">
            {search ? 'Intentá con otra búsqueda' : 'Próximamente se agregarán servicios en esta categoría'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              onPress={() => router.push(`/services/${item.id}` as any)}
              onLike={() => handleLike(item.id)}
            />
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 32, display: 'flex', flexDirection: 'column', gap: 10 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}
