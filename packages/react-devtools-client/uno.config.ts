import { defineConfig, presetAttributify, presetIcons, presetUno, presetWebFonts } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
    }),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        mono: 'DM Mono',
      },
    }),
  ],
  theme: {
    colors: {
      primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#61dafb', // React Blue-ish
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
        DEFAULT: '#61dafb',
      },
    },
  },
  shortcuts: [
    {
      'bg-base': 'bg-white dark:bg-[#121212]',
      'text-base': 'text-black dark:text-[#dfe0e2]',
      'border-base': 'border-gray-200 dark:border-gray-800',
      'panel-grids': 'panel-grids-light dark:panel-grids-dark',
    },
    // Dynamic card shortcut to match Vue DevTools style
    // Usage: theme-card-primary
    [/^theme-card-(\w+)$/, $ => `p2 flex gap2 border border-base bg-base items-center rounded min-w-40 min-h-25 justify-center transition-all saturate-0 op70 shadow hover:(op100 bg-${$[1]}-500/10 text-${$[1]}-600 saturate-100) dark:hover:(bg-${$[1]}-500/20 text-${$[1]}-400)`],
    ['theme-card-green', 'p2 flex gap2 border border-base bg-base items-center rounded min-w-40 min-h-25 justify-center transition-all saturate-0 op50 shadow hover:(op100 bg-green-500/10 text-green-600 saturate-100) dark:hover:(bg-green-500/20 text-green-400)'],
    ['theme-card-orange', 'p2 flex gap2 border border-base bg-base items-center rounded min-w-40 min-h-25 justify-center transition-all saturate-0 op50 shadow hover:(op100 bg-orange-500/10 text-orange-600 saturate-100) dark:hover:(bg-orange-500/20 text-orange-400)'],
  ],
  rules: [
    ['panel-grids-light', {
      'background-image': 'url("data:image/svg+xml,%0A%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' transform=\'scale(3)\'%3E%3Crect x=\'0\' y=\'0\' width=\'100%25\' height=\'100%25\' fill=\'white\'/%3E%3Cpath d=\'M 10,-2.55e-7 V 20 Z M -1.1677362e-8,10 H 20 Z\' stroke-width=\'0.2\' stroke=\'hsla(0, 0%25, 98%25, 1)\' fill=\'none\'/%3E%3C/svg%3E")',
      'background-size': '40px 40px',
    }],
    ['panel-grids-dark', {
      'background-image': `url("data:image/svg+xml,%0A%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' transform='scale(3)'%3E%3Crect x='0' y='0' width='100%25' height='100%25' fill='${encodeURIComponent('#121212')}'/%3E%3Cpath d='M 10,-2.55e-7 V 20 Z M -1.1677362e-8,10 H 20 Z' stroke-width='0.2' stroke='${encodeURIComponent('#121212')}' fill='none'/%3E%3C/svg%3E");`,
      'background-size': '40px 40px',
    }],
  ],
})
