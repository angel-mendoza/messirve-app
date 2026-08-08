import { StarRating } from '@/components/star-rating'
import { Brand } from '@/constants/theme'
import { useAuth } from '@/lib/auth-context'
import { getCategoryColor } from '@/lib/category-colors'
import { supabase } from '@/lib/supabase'
import type { Category, Profile, Service, ServiceComment } from '@/types/database'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useCallback, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const { width } = Dimensions.get('window')

type CommentWithProfile = ServiceComment & { profile: Profile | null }

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useAuth()

  const [service, setService] = useState<Service | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const [totalRatings, setTotalRatings] = useState(0)
  const [totalLikes, setTotalLikes] = useState(0)
  const [userLiked, setUserLiked] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [comments, setComments] = useState<CommentWithProfile[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [imageContainerWidth, setImageContainerWidth] = useState(width)
  const scrollViewRef = useRef<ScrollView>(null)

  const loadAll = useCallback(async () => {
    if (!id || !user) return
    setLoading(true)

    const [
      { data: serviceData },
      { data: categoriesData },
      { data: ratingsData },
      { data: likesData },
      { data: userLikeData },
      { data: userRatingData },
      { data: commentsData }
    ] = await Promise.all([
      supabase.from('services').select('*, categories(name, slug, emoji)').eq('id', id).single(),
      supabase.from('categories').select('*').order('order'),
      supabase.from('service_ratings').select('stars').eq('service_id', id),
      supabase.from('service_likes').select('id').eq('service_id', id),
      supabase.from('service_likes').select('id').eq('service_id', id).eq('user_id', user.id).maybeSingle(),
      supabase.from('service_ratings').select('stars').eq('service_id', id).eq('user_id', user.id).maybeSingle(),
      supabase.from('service_comments').select('*').eq('service_id', id).order('created_at', { ascending: false })
    ])

    if (serviceData) setService(serviceData)
    if (categoriesData) setCategories(categoriesData)

    if (ratingsData && ratingsData.length > 0) {
      const avg = ratingsData.reduce((a, r) => a + r.stars, 0) / ratingsData.length
      setAvgRating(avg)
      setTotalRatings(ratingsData.length)
    }

    setTotalLikes(likesData?.length ?? 0)
    setUserLiked(!!userLikeData)
    setUserRating(userRatingData?.stars ?? 0)

    if (commentsData && commentsData.length > 0) {
      const userIds = [...new Set(commentsData.map((c) => c.user_id))]
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds)

      const profileMap = new Map(profilesData?.map((p) => [p.id, p]) ?? [])
      setComments(commentsData.map((c) => ({ ...c, profile: profileMap.get(c.user_id) ?? null })))
    } else {
      setComments([])
    }

    setLoading(false)
  }, [id, user])

  useFocusEffect(
    useCallback(() => {
      loadAll()
    }, [loadAll])
  )

  const handleLike = async () => {
    if (!user || !id) return
    const wasLiked = userLiked
    setUserLiked(!wasLiked)
    setTotalLikes((prev) => (wasLiked ? prev - 1 : prev + 1))

    const { error } = wasLiked
      ? await supabase.from('service_likes').delete().eq('user_id', user.id).eq('service_id', id)
      : await supabase.from('service_likes').insert({ user_id: user.id, service_id: id })

    if (error) {
      setUserLiked(wasLiked)
      setTotalLikes((prev) => (wasLiked ? prev + 1 : prev - 1))
      Alert.alert('Error', 'No se pudo guardar tu me gusta')
    }
  }

  const handleRate = async (stars: number) => {
    if (!user || !id) return
    const prev = userRating
    setUserRating(stars)

    const { error } = await supabase
      .from('service_ratings')
      .upsert({ user_id: user.id, service_id: id, stars, updated_at: new Date().toISOString() })

    if (error) {
      setUserRating(prev)
      Alert.alert('Error', 'No se pudo guardar tu calificación')
      return
    }

    const { data } = await supabase.from('service_ratings').select('stars').eq('service_id', id)
    if (data && data.length > 0) {
      setAvgRating(data.reduce((a, r) => a + r.stars, 0) / data.length)
      setTotalRatings(data.length)
    }
  }

  const handleSubmitComment = async () => {
    if (!user || !id || !newComment.trim()) return
    setSubmittingComment(true)
    const content = newComment.trim()
    setNewComment('')

    const { data, error } = await supabase
      .from('service_comments')
      .insert({ user_id: user.id, service_id: id, content })
      .select('*')
      .single()

    setSubmittingComment(false)
    if (error || !data) {
      Alert.alert('Error', 'No se pudo publicar el comentario')
      setNewComment(content)
      return
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', user.id)
      .single()

    setComments((prev) => [{ ...data, profile: profileData ?? null }, ...prev])
  }

  const handleDeleteComment = async (commentId: string) => {
    Alert.alert('Eliminar comentario', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('service_comments').delete().eq('id', commentId)
          setComments((prev) => prev.filter((c) => c.id !== commentId))
        }
      }
    ])
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator size="large" color={Brand.celeste} />
      </SafeAreaView>
    )
  }

  if (!service) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream">
        <Text className="font-instrumentSans text-[14px]" style={{ color: '#8A8478' }}>
          Servicio no encontrado
        </Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="font-instrumentSansSemibold text-[14px]" style={{ color: '#4E7FBF' }}>
            Volver
          </Text>
        </Pressable>
      </SafeAreaView>
    )
  }

  const photos = service.photos ?? []
  const imageHeight = Math.min(imageContainerWidth * 0.75, 250)
  const categoryIndex = categories.findIndex((c) => c.slug === (service.categories as any)?.slug)
  const categoryColor = getCategoryColor((service.categories as any)?.slug ?? '', categoryIndex >= 0 ? categoryIndex : 0)

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        {/* Header: back (fila normal, no overlay sobre el carrusel de fotos) */}
        <View className="flex-row items-center px-4 pt-2">
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            hitSlop={8}
            className="rounded-full p-2"
          >
            <Ionicons name="arrow-back" size={22} color={Brand.celeste} />
          </Pressable>
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Photo + info row */}
          <View className="flex-col md:flex-row mt-2">
            {/* Image column */}
            <View
              className="w-full md:w-1/3"
              style={{ height: imageHeight, backgroundColor: Brand.celeste + '33' }}
              onLayout={(e) => setImageContainerWidth(e.nativeEvent.layout.width)}
            >
              {photos.length > 0 ? (
                <>
                  <FlatList
                    data={photos}
                    keyExtractor={(_, i) => String(i)}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(e) => {
                      setPhotoIndex(Math.round(e.nativeEvent.contentOffset.x / imageContainerWidth))
                    }}
                    renderItem={({ item }) => (
                      <Image
                        source={{ uri: item }}
                        style={{ width: imageContainerWidth, height: imageHeight }}
                        contentFit="cover"
                      />
                    )}
                  />
                  {photos.length > 1 && (
                    <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1">
                      {photos.map((_, i) => (
                        <View
                          key={i}
                          className="rounded-full"
                          style={{
                            width: i === photoIndex ? 20 : 6,
                            height: 6,
                            backgroundColor: i === photoIndex ? '#fff' : 'rgba(255,255,255,0.5)'
                          }}
                        />
                      ))}
                    </View>
                  )}
                </>
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Ionicons name="storefront-outline" size={64} color={Brand.celeste} />
                </View>
              )}
            </View>

            {/* Info column */}
            <View className="w-full md:w-2/3 px-5 pt-4 md:pt-0">
              {/* Category badge */}
              {service.categories && (
                <View className="flex-row mb-2">
                  <View
                    className="flex-row items-center gap-1 rounded-full px-3 py-1"
                    style={{ backgroundColor: categoryColor.hex + '22' }}
                  >
                    <Text className="text-xs">{(service.categories as any).emoji ?? '🏷️'}</Text>
                    <Text className="font-anton text-[11px] uppercase" style={{ color: categoryColor.hex, letterSpacing: 0.3 }}>
                      {(service.categories as any).name}
                    </Text>
                  </View>
                </View>
              )}

              {/* Name + Likes */}
              <View className="flex-row items-start justify-between mb-1">
                <Text
                  className="font-instrumentSansSemibold text-2xl flex-1 leading-[30px]"
                  style={{ color: '#1B2A3D' }}
                >
                  {service.name}
                </Text>
                <Pressable onPress={handleLike} hitSlop={8} className="flex-row items-center gap-1 ml-3 mt-1">
                  <Ionicons name={userLiked ? 'heart' : 'heart-outline'} size={16} color={Brand.dorado} />
                  <Text className="font-instrumentSans text-[13px]" style={{ color: '#8A8478' }}>
                    {totalLikes}
                  </Text>
                </Pressable>
              </View>

              {/* Rating display */}
              <View className="flex-row items-center gap-2 flex-wrap">
                <StarRating value={avgRating} size={18} readonly />
                <Text className="font-instrumentSans text-[13px]" style={{ color: '#8A8478' }}>
                  {totalRatings > 0 ? `${avgRating.toFixed(1)} (${totalRatings} calificaciones)` : 'Sin calificaciones'}
                </Text>
              </View>
            </View>
          </View>

          {/* Main content */}
          <View className="px-5 pt-5">
            {/* Info rows */}
            <View
              className="rounded-2xl p-4 mb-5 gap-3 bg-white"
              style={{ borderWidth: 1.5, borderColor: '#ECE6DA', borderCurve: 'continuous' }}
            >
              {service.address && (
                <View className="flex-row items-start gap-3">
                  <Ionicons name="location" size={18} color={Brand.celeste} style={{ marginTop: 1 }} />
                  <Text className="font-instrumentSans text-sm flex-1" style={{ color: '#5A574F' }}>
                    {service.address}, {service.city}
                  </Text>
                </View>
              )}
              {service.price_info && (
                <View className="flex-row items-center gap-3">
                  <Ionicons name="pricetag" size={18} color={Brand.celeste} />
                  <Text className="font-instrumentSans text-sm" style={{ color: '#5A574F' }}>
                    {service.price_info}
                  </Text>
                </View>
              )}
              {service.phone && (
                <Pressable
                  className="flex-row items-center gap-3"
                  onPress={() => Linking.openURL(`tel:${service.phone}`)}
                >
                  <Ionicons name="logo-whatsapp" size={18} color={Brand.celeste} />
                  <Text className="font-instrumentSans text-sm" style={{ color: '#4E7FBF' }}>
                    {service.phone}
                  </Text>
                </Pressable>
              )}
              {service.instagram && (
                <Pressable
                  className="flex-row items-center gap-3"
                  onPress={() => Linking.openURL(`https://instagram.com/${service.instagram!.replace('@', '')}`)}
                >
                  <Ionicons name="logo-instagram" size={18} color={Brand.celeste} />
                  <Text className="font-instrumentSans text-sm" style={{ color: '#4E7FBF' }}>
                    {service.instagram}
                  </Text>
                </Pressable>
              )}
              {service.website && (
                <Pressable
                  className="flex-row items-center gap-3"
                  onPress={() => Linking.openURL(service.website!)}
                >
                  <Ionicons name="globe" size={18} color={Brand.celeste} />
                  <Text className="font-instrumentSans text-sm" style={{ color: '#4E7FBF' }} numberOfLines={1}>
                    {service.website}
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Description */}
            {service.description && (
              <View className="mb-6">
                <Text className="font-anton text-[16px] uppercase mb-2" style={{ color: '#2C4A73' }}>
                  Acerca de
                </Text>
                <Text className="font-instrumentSans text-body leading-[22px]" style={{ color: '#5A574F' }}>
                  {service.description}
                </Text>
              </View>
            )}

            {/* Rate this service */}
            <View
              className="rounded-2xl p-4 mb-6 items-center border"
              style={{
                backgroundColor: Brand.dorado + '15',
                borderColor: Brand.dorado + '33',
                borderCurve: 'continuous'
              }}
            >
              <Text className="font-instrumentSansSemibold text-[15px] mb-[10px]" style={{ color: '#1B2A3D' }}>
                {userRating > 0 ? 'Tu calificación' : '¿Cómo calificás este servicio?'}
              </Text>
              <StarRating value={userRating} onChange={handleRate} size={32} />
              {userRating > 0 && (
                <Text className="font-instrumentSans text-[13px] mt-2" style={{ color: '#8A8478' }}>
                  Tocá las estrellas para cambiar tu calificación
                </Text>
              )}
            </View>

            {/* Comments section */}
            <View className="mb-4">
              <Text className="font-anton text-[16px] uppercase mb-3" style={{ color: '#2C4A73' }}>
                {`Comentarios (${comments.length})`}
              </Text>

              {/* Add comment input */}
              <View
                className="rounded-2xl flex-row items-end gap-2 p-3 mb-5 bg-white"
                style={{ borderWidth: 1.5, borderColor: '#ECE6DA', borderCurve: 'continuous' }}
              >
                <TextInput
                  value={newComment}
                  onChangeText={setNewComment}
                  placeholder="Escribí un comentario..."
                  placeholderTextColor="#A9A297"
                  multiline
                  maxLength={500}
                  className="flex-1 font-instrumentSans text-sm max-h-[100px] pt-0"
                  style={{ color: '#1B2A3D' }}
                />
                <Pressable
                  onPress={handleSubmitComment}
                  disabled={!newComment.trim() || submittingComment}
                  className="rounded-full p-2"
                  style={{ backgroundColor: newComment.trim() ? Brand.dorado : Brand.gris + '44' }}
                >
                  {submittingComment ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="send" size={18} color="#fff" />
                  )}
                </Pressable>
              </View>

              {/* Comment list */}
              {comments.length === 0 ? (
                <View className="items-center py-6">
                  <Text className="font-instrumentSans text-sm" style={{ color: '#A9A297' }}>
                    Sé el primero en comentar
                  </Text>
                </View>
              ) : (
                <View className="gap-3">
                  {comments.map((comment) => {
                    const name = (comment.profile?.full_name ?? 'Usuario').normalize('NFC')
                    const initial = name[0].toUpperCase()
                    const isOwn = comment.user_id === user?.id
                    const avatarUrl = comment.profile?.avatar_url
                    return (
                      <View key={comment.id} className="flex-row gap-3">
                        <View
                          className="rounded-full items-center justify-center shrink-0 w-9 h-9 overflow-hidden"
                          style={{ backgroundColor: Brand.celeste + '33' }}
                        >
                          {avatarUrl ? (
                            <Image
                              source={{ uri: avatarUrl }}
                              style={{ width: 36, height: 36 }}
                              contentFit="cover"
                            />
                          ) : (
                            <Text className="font-instrumentSansSemibold text-sm" style={{ color: '#1B2A3D' }}>
                              {initial}
                            </Text>
                          )}
                        </View>
                        <View
                          className="flex-1 rounded-2xl rounded-tl-sm p-3 bg-white"
                          style={{ borderWidth: 1.5, borderColor: '#ECE6DA', borderCurve: 'continuous' }}
                        >
                          <View className="flex-row items-center justify-between mb-1">
                            <Text className="font-instrumentSansSemibold text-[13px]" style={{ color: '#1B2A3D' }}>
                              {name}
                            </Text>
                            <View className="flex-row items-center gap-2">
                              <Text className="font-instrumentSans text-[11px]" style={{ color: '#A9A297' }}>
                                {formatDate(comment.created_at)}
                              </Text>
                              {isOwn && (
                                <Pressable onPress={() => handleDeleteComment(comment.id)} hitSlop={8}>
                                  <Ionicons name="trash-outline" size={14} color={Brand.gris} />
                                </Pressable>
                              )}
                            </View>
                          </View>
                          <Text className="font-instrumentSans text-sm leading-5" style={{ color: '#5A574F' }}>
                            {comment.content}
                          </Text>
                        </View>
                      </View>
                    )
                  })}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
