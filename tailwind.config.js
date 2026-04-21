/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        celeste: '#72B8E6',
        dorado: '#C9A96D',
        gris: '#C5C2BE'
      },
      fontFamily: {
        sans: ['OpenSans_400Regular'],
        light: ['OpenSans_300Light'],
        bold: ['OpenSans_700Bold']
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
