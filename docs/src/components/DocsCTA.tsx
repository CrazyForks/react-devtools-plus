import { ArrowRight, BookOpen } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/Button'

export const DocsCTA: React.FC = () => {
  const { t } = useTranslation()
  return (
    <section id="docs" className="relative overflow-hidden py-12 sm:py-20">
      <div className="from-brand-500/10 via-brand-400/10 pointer-events-none absolute inset-0 to-transparent bg-gradient-to-r" />
      <div className="container relative mx-auto px-4 sm:px-6">
        <div className="overflow-hidden border border-white/10 rounded-2xl bg-white/[0.03] p-5 sm:rounded-3xl md:p-14 sm:p-10">
          <div className="bg-brand-500/20 absolute h-64 w-64 blur-3xl -right-24 -top-24" />
          <div className="bg-brand-400/15 absolute h-64 w-64 blur-3xl -bottom-24 -left-24" />
          <div className="relative z-10 grid items-center gap-6 lg:grid-cols-[1.2fr_1fr] sm:gap-10">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 border border-white/10 rounded-full bg-white/5 px-2.5 py-1 text-[10px] text-slate-300 sm:mb-4 sm:px-3 sm:text-xs">
                <BookOpen className="text-brand-200 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {t('docsCTA.badge')}
              </div>
              <h2 className="text-2xl text-white font-bold md:text-4xl sm:text-3xl">
                {t('docsCTA.title')}
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:mt-4 sm:text-base">
                {t('docsCTA.subtitle')}
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-4">
                <Button withBeam className="w-full sm:w-auto">
                  {t('docsCTA.primary')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="secondary" className="w-full sm:w-auto">
                  {t('docsCTA.secondary')}
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-4 rounded-2xl from-white/5 to-white/0 bg-gradient-to-br blur-2xl sm:rounded-3xl" />
              <div className="relative border border-white/10 rounded-2xl bg-slate-950/80 p-4 shadow-2xl sm:rounded-3xl sm:p-6">
                <div className="mb-2 flex items-center gap-2 text-[10px] text-slate-400 tracking-[0.15em] uppercase sm:mb-3 sm:text-xs sm:tracking-[0.2em]">
                  <span className="bg-brand-400 h-1.5 w-1.5 animate-pulse rounded-full sm:h-2 sm:w-2" />
                  Live playground
                </div>
                <div className="text-xs text-slate-200 font-mono space-y-2 sm:text-sm sm:space-y-3">
                  <div className="flex items-center justify-between border border-white/5 rounded-xl bg-white/5 px-3 py-2 sm:rounded-2xl sm:px-4 sm:py-3">
                    <span className="truncate text-slate-300">{t('docsCTA.snippets.install')}</span>
                    <span className="text-brand-300 ml-2 shrink-0">✔</span>
                  </div>
                  <div className="border border-white/5 rounded-xl bg-white/5 px-3 py-2 sm:rounded-2xl sm:px-4 sm:py-3">
                    <p className="text-brand-200">{t('docsCTA.snippets.configTitle')}</p>
                    <p className="text-slate-300">{t('docsCTA.snippets.configMode')}</p>
                    <p className="text-slate-300">{t('docsCTA.snippets.configCapture')}</p>
                  </div>
                  <div className="border border-white/5 rounded-xl bg-white/5 px-3 py-2 sm:rounded-2xl sm:px-4 sm:py-3">
                    <p className="text-slate-300">{t('docsCTA.snippets.run')}</p>
                    <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">{t('docsCTA.snippets.runDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
