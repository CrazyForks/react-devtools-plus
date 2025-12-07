import { Github, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { getStaggerDelay, useScrollAnimation } from '../hooks/useScrollAnimation'
import { Button } from './ui/Button'

export const OpenSource: React.FC = () => {
  const { t } = useTranslation()
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.15 })

  const pillars = (t('openSource.pillars', { returnObjects: true }) as Array<{
    title: string
    description: string
  }>).map((item, idx) => ({
    ...item,
    icon: [ShieldCheck, HeartHandshake, Sparkles][idx],
  }))

  return (
    <section ref={ref as React.RefObject<HTMLElement>} id="community" className="relative overflow-hidden bg-slate-950 py-12 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(14,165,233,0.08),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(236,72,153,0.08),transparent_35%)]" />
      <div className="container relative mx-auto px-4 sm:px-6">
        {/* Header section - slide from left */}
        <div
          className={`max-w-3xl transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
          }`}
        >
          <p className="inline-flex items-center gap-2 border border-white/10 rounded-full bg-white/5 px-2.5 py-1 text-[10px] text-slate-300 sm:px-3 sm:text-xs">
            <Github className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {t('openSource.badge')}
          </p>
          <h2 className="mt-4 text-2xl text-white font-bold md:text-4xl sm:text-3xl">
            {t('openSource.title')}
          </h2>
          <p className="mt-2 text-sm text-slate-400 sm:mt-3 sm:text-lg">
            {t('openSource.subtitle')}
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:flex-wrap sm:gap-4">
            <Button
              withBeam
              className="w-full sm:w-auto"
              onClick={() => window.open('https://github.com/wzc520pyfm/react-devtools-plus', '_blank')}
            >
              {t('openSource.primary')}
            </Button>
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => window.open('https://github.com/wzc520pyfm/react-devtools-plus/issues', '_blank')}
            >
              {t('openSource.secondary')}
            </Button>
          </div>
        </div>

        {/* Pillar cards - staggered scale-up animation */}
        <div className="grid mt-8 gap-4 md:grid-cols-3 sm:mt-12 sm:gap-6">
          {pillars.map((pillar, idx) => (
            <div
              key={pillar.title}
              className={`group relative overflow-hidden border border-white/10 rounded-2xl bg-white/[0.02] p-5 backdrop-blur-sm transition-all duration-600 ease-out sm:rounded-3xl sm:p-6 ${
                isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'
              }`}
              style={{ transitionDelay: isVisible ? getStaggerDelay(idx + 2, 0.12) : '0s' }}
            >
              <div className="absolute inset-0 from-white/0 via-white/5 to-white/0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="mb-3 w-fit border border-white/10 rounded-xl bg-white/5 p-2.5 sm:mb-4 sm:rounded-2xl sm:p-3">
                <pillar.icon className="text-brand-300 h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <h3 className="text-lg text-white font-semibold sm:text-xl">{pillar.title}</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed sm:text-base">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
