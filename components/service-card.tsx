import { Brand } from '@/constants/theme'
import type { ServiceWithStats } from '@/types/database'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { Pressable, Text, View } from 'react-native'
import { StarRating } from './star-rating'

type Props = {
  service: ServiceWithStats
  onPress: () => void
  onLike: () => void
}

const PLACEHOLDER_COLORS: Record<string, [string, string]> = {
  hogar: ['#72B8E6', '#4A9FD4'],
  gastronomia: ['#E8956A', '#D4733E'],
  'salud-bienestar': ['#7EC8A4', '#4FAF7E'],
  'arte-entretenimiento': ['#B07EC8', '#8A4FAF'],
  'indumentaria-belleza': ['#E87EB0', '#D44F8A'],
  'hospedaje-turistas': ['#C9A96D', '#A8834A'],
  'asesoria-gestoria': ['#6A9FE8', '#4A7FCC']
}

export function ServiceCard({ service, onPress, onLike }: Props) {
  const photo = service.photos?.[0]
  const categorySlug = (service.categories as any)?.slug ?? ''
  const categoryName = (service.categories as any)?.name ?? ''
  const categoryEmoji = (service.categories as any)?.emoji ?? '🏷️'
  const placeholderColors = PLACEHOLDER_COLORS[categorySlug] ?? ['#72B8E6', '#4A9FD4']

  return (
    <Pressable
      onPress={onPress}
      className="rounded-[20px] bg-white mb-12 overflow-hidden"
      style={({ pressed }) => ({
        borderCurve: 'continuous',
        boxShadow: pressed ? '0 8px 20px rgba(26, 58, 92, 0.08)' : '0 8px 20px rgba(26, 58, 92, 0.14)',
        transform: [{ scale: pressed ? 0.975 : 1 }]
      })}
    >
      {/* ── Image hero ── */}
      <View className="h-[210px]">
        {photo ? (
          <Image
            source={{ uri: photo }}
            style={{ width: '100%', height: 210, borderTopRightRadius: 20, borderTopLeftRadius: 20 }}
            contentFit="cover"
          />
        ) : (
          <View
            className="w-full h-[210px] items-center justify-center rounded-t-[20px]"
            style={{
              borderCurve: 'continuous',
              experimental_backgroundImage: `linear-gradient(135deg, ${placeholderColors[0]}, ${placeholderColors[1]})`
            }}
          >
            <Text className="text-[56px] opacity-60">{categoryEmoji}</Text>
          </View>
        )}

        {/* Bottom gradient overlay with name + rating */}
        <View
          className="absolute bottom-0 left-0 right-0 h-[110px] justify-end px-[14px] pb-3"
          style={{ experimental_backgroundImage: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.72))' }}
        >
          <Text className="font-bold text-[19px] text-white leading-[25px] mb-[5px]" numberOfLines={1}>
            {service.name}
          </Text>
          <View className="flex-row items-center gap-1.5">
            <StarRating value={service.avg_rating} size={13} readonly />
            <Text className="font-sans text-xs text-white/90">
              {service.total_ratings > 0
                ? `${service.avg_rating.toFixed(1)} · ${service.total_ratings} reseña${service.total_ratings !== 1 ? 's' : ''}`
                : 'Sin reseñas aún'}
            </Text>
          </View>
        </View>

        {/* Category badge — top left */}
        {categoryName ? (
          <View
            className="absolute top-3 left-3 flex-row items-center gap-1 bg-white/90 rounded-[20px] px-[10px] py-1"
            style={{ borderCurve: 'continuous' }}
          >
            <Text className="text-[11px]">{categoryEmoji}</Text>
            <Text className="font-bold text-[10px] text-[#333] tracking-[0.3px]">{categoryName}</Text>
          </View>
        ) : null}

        {/* Like button — top right */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation()
            onLike()
          }}
          hitSlop={10}
          className="absolute top-[10px] right-[10px] bg-white/90 rounded-[22px] w-[38px] h-[38px] items-center justify-center"
          style={{ borderCurve: 'continuous', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.12)' }}
        >
          <Ionicons
            name={service.user_liked ? 'heart' : 'heart-outline'}
            size={19}
            color={service.user_liked ? '#e53e3e' : '#777'}
          />
        </Pressable>
      </View>

      {/* ── Info area ── */}
      <View className="px-[14px] pt-3 pb-[14px] bg-white">
        {/* Address + price badge */}
        <View className="flex-row items-center gap-1.5">
          {service.address ? (
            <View className="flex-row items-center flex-1 gap-1">
              <Ionicons name="location" size={13} color={Brand.celeste} />
              <Text className="font-sans text-[13px] text-[#888] flex-1" numberOfLines={1}>
                {service.address}, {service.city}
              </Text>
            </View>
          ) : null}

          {service.price_info ? (
            <View
              className="rounded-lg px-2 py-[3px] shrink-0"
              style={{ backgroundColor: Brand.dorado + '1A', borderCurve: 'continuous' }}
            >
              <Text className="font-bold text-[11px] text-dorado">{service.price_info}</Text>
            </View>
          ) : null}
        </View>

        {/* Description */}
        {service.description ? (
          <Text className="font-light text-[13px] text-[#888] leading-[19px] mt-2" numberOfLines={2}>
            {service.description}
          </Text>
        ) : null}

        {/* Footer: likes count + CTA */}
        <View
          className="flex-row items-center justify-between mt-3 pt-[10px] border-t"
          style={{ borderTopColor: '#F2F2F2' }}
        >
          <View className="flex-row items-center gap-[5px]">
            <Ionicons name="heart" size={13} color="#e53e3e" />
            <Text className="font-sans text-xs text-[#aaa]">
              {service.total_likes > 0 ? `${service.total_likes} favorito${service.total_likes !== 1 ? 's' : ''}` : 'Sé el primero'}
            </Text>
            {service.phone ? (
              <>
                <Text className="text-[#ddd] mx-0.5">·</Text>
                <Ionicons name="logo-whatsapp" size={13} color="#aaa" />
                <Text className="font-sans text-xs text-[#aaa]">{service.phone}</Text>
              </>
            ) : null}
          </View>

          <View className="flex-row items-center gap-[3px]">
            <Text className="font-bold text-[13px] text-celeste">Ver más</Text>
            <Ionicons name="chevron-forward" size={14} color={Brand.celeste} />
          </View>
        </View>
      </View>
    </Pressable>
  )
}
