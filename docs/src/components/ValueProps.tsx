import { Rocket, ShieldCheck, Sparkles, Terminal } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { GlowCard, GlowCardGrid } from './ui/GlowCard'

export const ValueProps: React.FC = () => {
  const { t } = useTranslation()
  const valueProps = (t('valueProps.items', { returnObjects: true }) as Array<{
    title: string
    description: string
  }>).map((item, idx) => ({
    ...item,
    icon: [ShieldCheck, Rocket, Terminal, Sparkles][idx],
  }))

  return (
    <section className="relative overflow-hidden from-[#050712] via-slate-950 to-slate-950 bg-gradient-to-b py-12 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.08),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.07),transparent_40%)]" />
      <div className="container relative mx-auto px-4 sm:px-6">
        <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-14">
          <div className="inline-flex items-center gap-2 border border-white/10 rounded-full bg-white/5 px-3 py-1.5 text-[10px] text-slate-300 tracking-[0.2em] uppercase sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.25em]">
            {t('valueProps.badge')}
          </div>
          <h2 className="mt-4 text-2xl text-white font-bold md:text-4xl sm:text-3xl">
            {t('valueProps.title')}
          </h2>
          <p className="mt-2 text-sm text-slate-400 sm:mt-3 sm:text-base">
            {t('valueProps.subtitle')}
          </p>
        </div>

        <GlowCardGrid className="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-6">
          {mousePosition => (
            <>
              {valueProps.map(item => (
                <GlowCard key={item.title} mousePosition={mousePosition}>
                  <div className="mb-3 flex items-center gap-3 sm:mb-4">
                    <div className="border border-white/10 rounded-xl bg-white/5 p-2.5 sm:rounded-2xl sm:p-3">
                      <item.icon className="text-brand-300 h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <h3 className="text-lg text-white font-semibold sm:text-xl">{item.title}</h3>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed sm:text-base">{item.description}</p>
                </GlowCard>
              ))}
            </>
          )}
        </GlowCardGrid>
      </div>
    </section>
  )
}
