import { Image } from 'expo-image'
import { View } from 'react-native'

type Props = {
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 80,
  md: 120,
  lg: 180
}

export function MessirveLogo({ size = 'md' }: Props) {
  const px = sizes[size]
  return (
    <View style={{ width: px, height: px * 0.7, alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={require('@/assets/images/icon.png')}
        style={{ width: px, height: px * 0.7 }}
        contentFit="contain"
      />
    </View>
  )
}
