import { ArrowRight, Check, Copy } from 'lucide-react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/Button'
import { Spotlight } from './ui/Spotlight'
import { CodeTab, TabbedCodeBlock } from './ui/TabbedCodeBlock'

// Configurable code tabs for the Hero section
const HERO_CODE_TABS: CodeTab[] = [
  {
    name: 'vite.config.ts',
    icon: 'vite',
    language: 'ts',
    code: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { reactDevToolsPlus } from 'react-devtools-plus/vite'

export default defineConfig({
  plugins: [
    react(),
    reactDevToolsPlus(),
  ],
})`,
  },
  {
    name: 'webpack.config.js',
    icon: 'webpack',
    language: 'js',
    code: `const ReactDevToolsPlugin =
  require('react-devtools-plus/webpack').webpack

module.exports = {
  plugins: [
    ReactDevToolsPlugin(),
  ],
}`,
  },
  {
    name: 'package.json',
    icon: 'npm',
    language: 'json',
    code: `{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "react-devtools-plus": "^0.0.1"
  }
}`,
  },
]

export const Hero: React.FC = () => {
  const [copied, setCopied] = useState(false)
  const { t } = useTranslation()

  const handleCopy = () => {
    navigator.clipboard.writeText('pnpm add -D react-devtools-plus')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-950 pb-12 pt-20 sm:pb-20 sm:pt-24">
      {/* Background Ambience - Radial Top-Down Light */}
      <div className="absolute inset-0 h-full w-full bg-slate-950">
        <div className="[mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* Spotlight Beam - Top Right shining Bottom Left */}
      <Spotlight className="right-0 -top-40 md:right-0 md:-top-20" fill="#38bdf8" />

      <div className="container relative z-10 mx-auto max-w-full overflow-hidden px-6 lg:px-16 sm:px-8">
        <div className="grid items-center gap-8 overflow-hidden lg:grid-cols-[1fr_1.1fr] lg:gap-16 xl:gap-20">

          {/* Left Column: Content */}
          <div className="flex flex-col items-center text-center lg:items-start lg:pr-4 lg:text-left">
            {/* Badge */}
            <div
              className="animate-slide-up-fade mb-6 inline-flex items-center gap-2 border border-white/5 rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300 backdrop-blur-xl sm:mb-8 sm:text-sm"
              style={{ animationDelay: '0.1s' }}
            >
              <span className="bg-brand-400 h-2 w-2 flex animate-pulse rounded-full"></span>
              <span>{t('hero.badge')}</span>
            </div>

            {/* Heading */}
            <h1
              className="animate-slide-up-fade text-3xl text-white font-extrabold tracking-tight md:text-7xl sm:text-5xl"
              style={{ animationDelay: '0.2s' }}
            >
              {t('hero.titleLead')}
              {' '}
              <br />
              <span className="from-brand-300 via-brand-500 to-brand-700 bg-gradient-to-r bg-clip-text text-transparent">
                {t('hero.titleHighlight')}
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="animate-slide-up-fade mt-4 max-w-2xl text-base text-slate-400 sm:mt-6 md:text-xl sm:text-lg"
              style={{ animationDelay: '0.4s' }}
            >
              {t('hero.subtitle')}
            </p>

            {/* Buttons */}
            <div
              className="animate-slide-up-fade mt-6 w-full flex flex-col items-center gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:gap-4"
              style={{ animationDelay: '0.6s' }}
            >
              <Button withBeam className="w-full sm:w-auto">
                {t('hero.primaryCta')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div
                className="group relative w-full flex cursor-pointer items-center justify-between gap-2 border border-white/10 rounded-full bg-slate-900/50 px-4 py-2.5 text-xs text-slate-400 font-mono transition-all sm:w-auto hover:border-white/20 sm:px-6 sm:py-3 sm:text-sm hover:text-white"
                onClick={handleCopy}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && handleCopy()}
              >
                <span className="truncate">{t('hero.snippet')}</span>
                {copied ? <Check className="h-4 w-4 shrink-0 text-green-400" /> : <Copy className="h-4 w-4 shrink-0" />}

                {/* Subtle glow on hover */}
                <div className="bg-brand-500/10 absolute inset-0 rounded-full opacity-0 blur-lg transition-opacity -z-10 group-hover:opacity-100" />
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Code Block */}
          <div
            className="animate-slide-up-fade relative mx-auto max-w-[600px] min-w-0 w-full overflow-hidden"
            style={{ animationDelay: '0.8s' }}
          >
            {/* Abstract Glow behind the card */}
            <div className="from-brand-500 to-brand-800 absolute rounded-2xl bg-gradient-to-r opacity-20 blur transition duration-1000 -inset-1 group-hover:opacity-40"></div>

            {/* The Main Card with Shiki Code Highlighting */}
            <TabbedCodeBlock
              tabs={HERO_CODE_TABS}
              statusText="Debugging Session: Active"
            />

            {/* Decorative Floating Elements behind/around - hidden on mobile */}
            <div className="bg-brand-500/20 absolute hidden h-24 w-24 rounded-full blur-3xl -right-12 -top-12 sm:block"></div>
            <div className="bg-brand-400/18 absolute hidden h-32 w-32 rounded-full blur-3xl -bottom-12 -left-12 sm:block"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
