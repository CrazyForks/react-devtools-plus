import { GitBranch, MessageSquare, Sparkles, Star } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/Button'

const icons = [Star, MessageSquare, GitBranch, Sparkles]

export const Testimonials: React.FC = () => {
  const { t } = useTranslation()
  const actions = t('testimonials.actions', { returnObjects: true }) as Array<{
    title: string
    description: string
  }>

  return (
    <section id="testimonials" className="relative bg-slate-950 py-12 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(236,72,153,0.05),_transparent_50%)]" />
      <div className="container relative mx-auto px-4 sm:px-6">
        <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
          <h2 className="text-2xl text-white font-bold md:text-4xl sm:text-3xl">
            {t('testimonials.title')}
          </h2>
          <p className="mt-3 text-sm text-slate-400 sm:mt-4 sm:text-base">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid items-center gap-4 md:grid-cols-[1.1fr_1fr]">
          <div className="border border-white/10 rounded-2xl bg-white/[0.02] p-5 backdrop-blur-sm sm:rounded-3xl sm:p-8">
            <p className="text-brand-200 mb-2 text-xs tracking-[0.2em] uppercase sm:mb-3 sm:text-sm sm:tracking-[0.25em]">early stage</p>
            <h3 className="mb-2 text-lg text-white font-semibold sm:mb-3 sm:text-2xl">
              Help us prioritize what matters for your stack.
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed sm:text-base">
              Share your framework versions, routing setup, Suspense usage, or perf blockers. We'll tailor
              the roadmap around real-world needs—not vanity features.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:flex-wrap sm:gap-3">
              <Button
                withBeam
                className="w-full sm:w-auto"
                onClick={() => window.open('https://github.com/wzc520pyfm/react-devtools-plus', '_blank')}
              >
                {t('testimonials.ctaPrimary')}
              </Button>
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => window.open('https://github.com/wzc520pyfm/react-devtools-plus/issues/new', '_blank')}
              >
                {t('testimonials.ctaSecondary')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {actions.map((action, idx) => {
              const Icon = icons[idx % icons.length]
              return (
                <div
                  key={action.title}
                  className="relative overflow-hidden border border-white/10 rounded-xl bg-white/[0.02] p-4 backdrop-blur-sm sm:rounded-2xl sm:p-5"
                >
                  <div className="absolute inset-0 from-white/0 via-white/5 to-white/0 bg-gradient-to-br opacity-0 transition-opacity duration-500 hover:opacity-100" />
                  <div className="mb-2 flex items-center gap-2.5 sm:mb-3 sm:gap-3">
                    <div className="border border-white/10 rounded-lg bg-white/5 p-2 sm:rounded-xl sm:p-2.5">
                      <Icon className="text-brand-300 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                    <h4 className="text-xs text-white font-semibold sm:text-sm">{action.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed sm:text-sm">{action.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
