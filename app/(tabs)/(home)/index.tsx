import { MessirveLogo } from '@/components/logoAlt'
import { Brand } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Pressable, ScrollView, Text, View } from 'react-native'

type MenuCard = {
  id: string
  title: string
  subtitle: string
  icon: string
  color: string
  onPress: () => void
  available: boolean
}

export default function HomeScreen() {
  const cards: MenuCard[] = [
    // {
    //   id: 'info',
    //   title: 'Información',
    //   subtitle: 'para el inmigrante',
    //   icon: 'information-circle',
    //   color: Brand.celeste,
    //   onPress: () => {},
    //   available: false
    // },
    {
      id: 'services',
      title: 'Servicios',
      subtitle: 'Encuentra todo lo que necesitas',
      icon: 'grid',
      color: Brand.dorado,
      onPress: () => router.push('/services' as any),
      available: true
    },
    {
      id: 'events',
      title: 'Eventos',
      subtitle: 'Lo que pasa en Barcelona',
      icon: 'calendar',
      color: '#6B7A99',
      onPress: () => {},
      available: false
    }
  ]

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#E6F4FE' }}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Header with logo */}
      <View className="items-center pt-8 pb-6 mb-10 mt-2">
        <MessirveLogo size="lx" />
      </View>



      {/* Cards */}
      <View className="px-5 gap-4">
        {cards.map((card) => (
          <Pressable
            key={card.id}
            onPress={card.onPress}
            disabled={!card.available}
            className="rounded-3xl overflow-hidden"
            style={({ pressed }) => ({
              opacity: pressed ? 0.9 : card.available ? 1 : 0.85,
              transform: [{ scale: pressed ? 0.98 : 1 }],
              borderCurve: 'continuous',
              boxShadow: pressed ? '0 4px 12px rgba(0, 0, 0, 0.08)' : '0 4px 12px rgba(0, 0, 0, 0.12)'
            })}
          >
            <View className="p-6 min-h-[110px]" style={{ backgroundColor: card.color }}>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-bold text-[22px] text-white leading-7">{card.title}</Text>
                  <Text className="font-light text-sm text-white/85 mt-0.5">{card.subtitle}</Text>
                  {!card.available && (
                    <View className="mt-3 self-start rounded-full px-3 py-1 bg-black/20">
                      <Text className="font-sans text-[11px] text-white/80">Próximamente</Text>
                    </View>
                  )}
                </View>
                <View className="rounded-full items-center justify-center ml-4 w-14 h-14 bg-white/25">
                  <Ionicons name={card.icon as any} size={28} color="#fff" />
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  )
}
