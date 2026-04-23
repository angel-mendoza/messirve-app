import { StarRating } from '@/components/star-rating'
import { Brand } from '@/constants/theme'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type RatedService = {
  id: string
  name: string
  city: string | null
  stars: number
  categories: { name: string; emoji: string | null; slug: string } | null
}

const STAR_LABELS: Record<number, string> = {
  1: 'Malo',
  2: 'Regular',
  3: 'Bueno',
  4: 'Muy bueno',
  5: 'Excelente',
}

export default function RatingsScreen() {
  const { user } = useAuth()
  const [items, setItems] = useState<RatedService[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('service_ratings')
      .select('stars, services(id, name, city, categories(name, emoji, slug))')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (data) {
      setItems(
        data.map((r: any) => ({
          id: r.services.id,
          name: r.services.name,
          city: r.services.city,
          stars: r.stars,
          categories: r.services.categories,
        }))
      )
    }
    setLoading(false)
  }, [user])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load])
  )

  const avgRating = useMemo(() => {
    if (items.length === 0) return 0
    return items.reduce((sum, i) => sum + i.stars, 0) / items.length
  }, [items])

  return (
    <SafeAreaView className="flex-1 bg-[#E8EDF3]">
      {/* Header */}
      <View
        className="flex-row items-center px-5 pt-4 pb-4 bg-white border-b"
        style={{ borderBottomColor: '#EBEBEB' }}
      >
        <Pressable onPress={() => router.back()} hitSlop={10} className="mr-3">
          <Ionicons name="arrow-back" size={24} color={Brand.celeste} />
        </Pressable>
        <View className="flex-1">
          <Text className="font-bold text-[22px] text-[#1a1a1a]">Mis calificaciones</Text>
          <Text className="font-light text-[13px] text-[#888]">Servicios que calificaste</Text>
        </View>
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
          ListHeaderComponent={<SummaryBar total={items.length} avg={avgRating} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, display: 'flex', flexDirection: 'column', gap: 10 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <RatingCard item={item} />}
        />
      )}
    </SafeAreaView>
  )
}

function SummaryBar({ total, avg }: { total: number; avg: number }) {
  return (
    <View
      className="flex-row bg-white rounded-2xl mt-5 mb-4 py-[18px] px-6 border"
      style={{
        borderColor: '#D8DEE8',
        boxShadow: '0 4px 12px rgba(26, 41, 64, 0.13)'
      }}
    >
      <StatItem value={total.toString()} label="Calificados" />
      <View className="w-px bg-[#EBEBEB] mx-5" />
      <StatItem value={avg.toFixed(1)} label="Promedio" icon="star" />
    </View>
  )
}

function StatItem({ value, label, icon }: { value: string; label: string; icon?: string }) {
  return (
    <View className="flex-1 items-center">
      <View className="flex-row items-center gap-1">
        {icon && <Ionicons name="star" size={14} color={Brand.dorado} />}
        <Text className="font-bold text-[22px] text-[#1a1a1a]">{value}</Text>
      </View>
      <Text className="font-light text-xs text-[#888] mt-[1px]">{label}</Text>
    </View>
  )
}

function RatingCard({ item }: { item: RatedService }) {
  return (
    <Pressable
      onPress={() => router.push(`/services/${item.id}` as any)}
      className="rounded-[18px] mb-[14px] overflow-hidden border"
      style={({ pressed }) => ({
        backgroundColor: pressed ? '#F4F7FA' : '#fff',
        borderColor: '#D8DEE8',
        boxShadow: '0 4px 12px rgba(26, 41, 64, 0.13)'
      })}
    >
      {/* Top section */}
      <View className="flex-row items-center p-4 pb-[14px] bg-[#FAFAFA]">
        {/* Emoji avatar */}
        <View
          className="rounded-full items-center justify-center shrink-0 mr-[14px] w-[58px] h-[58px] border-2"
          style={{
            backgroundColor: Brand.celeste + '20',
            borderColor: Brand.celeste + '30'
          }}
        >
          <Text className="text-[26px]">{item.categories?.emoji ?? '🏷️'}</Text>
        </View>

        {/* Name + chips */}
        <View className="flex-1 gap-1.5">
          <Text className="font-bold text-base text-[#1a1a1a]" numberOfLines={1}>
            {item.name}
          </Text>
          <Text>aqui</Text>

          {/* Category + city chips */}
          <View className="flex-row flex-wrap gap-1.5">
            {item.categories?.name ? (
              <View
                className="rounded-[20px] px-2 py-[3px] border"
                style={{
                  backgroundColor: Brand.celeste + '18',
                  borderColor: Brand.celeste + '30'
                }}
              >
                <Text className="font-sans text-[11px] text-celeste">{item.categories.name}</Text>
              </View>
            ) : null}
            {item.city ? (
              <View
                className="flex-row items-center rounded-[20px] px-2 py-[3px] gap-[3px] bg-[#F4F4F4] border"
                style={{ borderColor: '#E8E8E8' }}
              >
                <Ionicons name="location-outline" size={11} color="#999" />
                <Text className="font-sans text-[11px] text-[#777]">{item.city}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Score badge */}
        <View
          className="rounded-[14px] px-3 py-2 ml-3 items-center shrink-0 border"
          style={{
            backgroundColor: Brand.dorado + '1A',
            borderColor: Brand.dorado + '30'
          }}
        >
          <Text className="font-bold text-xl text-dorado leading-[22px]">{item.stars}</Text>
          <Text className="font-light text-[9px] text-dorado">/ 5</Text>
        </View>
      </View>

      {/* Divider */}
      <View className="h-px bg-[#F0F0F0]" />

      {/* Bottom section: stars + label + chevron */}
      <View className="flex-row items-center px-4 py-[11px] gap-2 bg-[#FAFAFA]">
        <StarRating value={item.stars} size={17} readonly />
        <View
          className="flex-1 rounded-[20px] px-[10px] py-[3px] self-center"
          style={{ backgroundColor: Brand.dorado + '14' }}
        >
          <Text className="font-sans text-xs text-dorado">{STAR_LABELS[item.stars] ?? ''}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Brand.gris} />
      </View>
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
      <Text className="font-bold text-lg text-[#333] text-center mb-2">
        Aún no calificaste ningún servicio
      </Text>
      <Text className="font-light text-sm text-[#888] text-center leading-5">
        Explorá los servicios disponibles y dejá tu opinión
      </Text>
      <Pressable
        onPress={() => router.push('/' as any)}
        className="mt-7 rounded-xl px-7 py-3"
        style={({ pressed }) => ({ backgroundColor: pressed ? Brand.celeste + 'CC' : Brand.celeste })}
      >
        <Text className="font-bold text-body text-white">Explorar servicios</Text>
      </Pressable>
    </View>
  )
}
