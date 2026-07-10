/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        celeste: '#72A2E0',
        dorado: '#CFB176',
        celesteDeep: '#1B2A3D',
        cream: '#FAF7F0',
        gris: '#E4DFD3'
      },
      fontFamily: {
        sans: ['OpenSans_400Regular'],
        light: ['OpenSans_300Light'],
        bold: ['OpenSans_700Bold'],
        anton: ['Anton_400Regular'],
        instrumentSans: ['InstrumentSans_400Regular'],
        instrumentSansMedium: ['InstrumentSans_500Medium'],
        instrumentSansSemibold: ['InstrumentSans_600SemiBold']
      },
      fontSize: {
        titulo: [42, { lineHeight: 52 }],
        subtitulo1: [23, { lineHeight: 30 }],
        subtitulo2: [30, { lineHeight: 38 }],
        body: [15, { lineHeight: 22 }]
      }
    }
  },
  plugins: []
}
