import { Platform } from 'react-native'

export const Brand = {
  celeste: '#72A2E0',
  dorado: '#CFB176',
  celesteDeep: '#1B2A3D',
  cream: '#FAF7F0',
  gris: '#E4DFD3'
} as const

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: Brand.celeste,
    icon: Brand.gris,
    tabIconDefault: Brand.gris,
    tabIconSelected: Brand.celeste
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: Brand.celeste,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: Brand.celeste
  }
}

export const Fonts = Platform.select({
  ios: {
    regular: 'OpenSans_400Regular',
    light: 'OpenSans_300Light',
    bold: 'OpenSans_700Bold'
  },
  default: {
    regular: 'OpenSans_400Regular',
    light: 'OpenSans_300Light',
    bold: 'OpenSans_700Bold'
  },
  web: {
    regular: "'Open Sans', sans-serif",
    light: "'Open Sans', sans-serif",
    bold: "'Open Sans', sans-serif"
  }
})
