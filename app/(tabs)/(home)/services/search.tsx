import { Brand } from '@/constants/theme'
import { useAuth } from '@/lib/auth-context'
import { getCategoryColor } from '@/lib/category-colors'
import { supabase } from '@/lib/supabase'
import type { Category, ServiceWithStats } from '@/types/database'
import { Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

function sanitizeForFilter(value: string) {
  return value.replace(/[(),]/g, ' ').trim()
}

export default function SearchScreen() {
  const { q } = useLocalSearchParams<{ q: string }>()
  const { user } = useAuth()
  const [services, setServices] = useState<ServiceWithStats[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [firstName, setFirstName] = useState('')
  const [search, setSearch] = useState(q ?? '')
  const [activeQuery, setActiveQuery] = useState(q ?? '')
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .order('order')
      .then(({ data }) => {
        if (data) setCategories(data)
      })
  }, [])

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setFirstName(data?.full_name?.trim().split(' ')[0] ?? '')
      })
  }, [user])

  const fetchServices = async (query: string, categorySlug: string | null) => {
    if (!user) return
    setLoading(true)

    let servicesQuery = supabase
      .from('services')
      .select('*, categories(name, slug, emoji)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (categorySlug) {
      const category = categories.find((c) => c.slug === categorySlug)
      if (category) servicesQuery = servicesQuery.eq('category_id', category.id)
    }

    const safeQuery = sanitizeForFilter(query)
    if (safeQuery) {
      servicesQuery = servicesQuery.or(`name.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`)
    }

    const { data: servicesData } = await servicesQuery

    if (!servicesData || servicesData.length === 0) {
      setServices([])
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
    setLoading(false)
  }

  useFocusEffect(
    useCallback(() => {
      fetchServices(activeQuery, activeCategorySlug)
    }, [user, activeQuery, activeCategorySlug, categories])
  )

  const handleSubmit = () => {
    setActiveQuery(search)
  }

  const handleClear = () => {
    setSearch('')
    setActiveQuery('')
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

    if (service.user_liked) {
      await supabase.from('service_likes').delete().eq('user_id', user.id).eq('service_id', serviceId)
    } else {
      await supabase.from('service_likes').insert({ user_id: user.id, service_id: serviceId })
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      {/* Header */}
      <View className="px-4 pt-2 pb-4">
        <Pressable onPress={() => router.back()} hitSlop={8} className="mb-2 self-start">
          <Ionicons name="chevron-back" size={22} color="#8A8478" />
        </Pressable>
        <Text className="font-anton text-[24px] uppercase" style={{ color: '#2C4A73' }}>
          Hola{firstName ? `, ${firstName}` : ''}
        </Text>

        {/* Search bar */}
        <View
          className="mt-4 flex-row items-center gap-3 rounded-full bg-white px-4 py-3"
          style={{ borderWidth: 1.5, borderColor: '#E4DFD3' }}
        >
          <Ionicons name="search" size={18} color="#8A8478" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
            placeholder="Empanadas, gestor, mudanzas..."
            placeholderTextColor="#A9A297"
            className="flex-1 font-instrumentSans text-[14px]"
            style={{ color: '#2C4A73' }}
          />
          {search.length > 0 && (
            <Pressable onPress={handleClear} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#A9A297" />
            </Pressable>
          )}
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4"
          contentContainerStyle={{ gap: 9 }}
        >
          <Pressable
            onPress={() => setActiveCategorySlug(null)}
            className="rounded-full px-[15px] py-2"
            style={{
              backgroundColor: activeCategorySlug === null ? Brand.celesteDeep : '#fff',
              borderWidth: 1.5,
              borderColor: activeCategorySlug === null ? Brand.celesteDeep : '#E4DFD3'
            }}
          >
            <Text
              className="font-anton text-[12.5px] uppercase"
              style={{ color: activeCategorySlug === null ? '#fff' : '#8A8478', letterSpacing: 0.3 }}
            >
              Todos
            </Text>
          </Pressable>
          {categories.map((c, i) => {
            const color = getCategoryColor(c.slug, i)
            const active = activeCategorySlug === c.slug
            return (
              <Pressable
                key={c.id}
                onPress={() => setActiveCategorySlug(active ? null : c.slug)}
                className="rounded-full px-[15px] py-2"
                style={{
                  backgroundColor: active ? color.hex : '#fff',
                  borderWidth: 1.5,
                  borderColor: color.hex
                }}
              >
                <Text
                  className="font-anton text-[12.5px] uppercase"
                  style={{ color: active ? '#fff' : color.hex, letterSpacing: 0.3 }}
                >
                  {c.name}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Brand.celeste} />
        </View>
      ) : services.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-[40px] mb-3">🔍</Text>
          <Text className="font-bold text-lg text-center" style={{ color: '#2C4A73' }}>
            {activeQuery || activeCategorySlug ? 'Sin resultados' : 'Buscá algo para empezar'}
          </Text>
          <Text className="font-light text-sm text-center mt-2" style={{ color: '#8A8478' }}>
            {activeQuery || activeCategorySlug ? 'Probá con otra palabra o categoría' : 'Escribí lo que necesitás y confirmá'}
          </Text>
        </View>
      ) : (
        <>
          <Text
            className="font-anton text-[16px] px-4 mb-2"
            style={{ color: '#2C4A73' }}
          >
            {`Resultados (${services.length})`}
          </Text>
          <FlatList
            data={services}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => {
              const color = getCategoryColor(item.categories?.slug ?? '', index)
              const initial = item.name.trim().charAt(0).toUpperCase()
              const filledStars = Math.round(item.avg_rating)
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
                    <Text className="font-anton text-[16px]" style={{ color: color.hex }}>
                      {initial}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-instrumentSansSemibold text-[14.5px]" style={{ color: '#1B2A3D' }}>
                      {item.name}
                    </Text>
                    <Text className="font-instrumentSans text-[12px] mt-0.5" style={{ color: '#8A8478' }}>
                      {item.categories?.name ?? ''} · {item.city}
                    </Text>
                    <View className="flex-row items-center gap-1 mt-1">
                      <Text style={{ color: Brand.dorado, fontSize: 12, letterSpacing: 1 }}>
                        {'★'.repeat(filledStars) + '☆'.repeat(5 - filledStars)}
                      </Text>
                      <Text className="font-instrumentSans text-[11.5px]" style={{ color: '#8A8478' }}>
                        {item.avg_rating.toFixed(1)} · {item.total_ratings}
                      </Text>
                    </View>
                  </View>
                  <Pressable onPress={() => handleLike(item.id)} hitSlop={8}>
                    <Ionicons
                      name={item.user_liked ? 'heart' : 'heart-outline'}
                      size={18}
                      color={Brand.dorado}
                    />
                  </Pressable>
                </Pressable>
              )
            }}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 32,
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </SafeAreaView>
  )
}
