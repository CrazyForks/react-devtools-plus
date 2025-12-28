import { ArrowRight, CheckCircle, ExternalLink, Zap } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

interface PlaygroundItem {
  name: string
  description: string
  url: string
  tags: string[]
}

export const Introduction: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="mb-4 text-4xl text-white font-bold">{t('docs.introduction.title')}</h1>

      <p className="text-lg text-slate-300 leading-relaxed">
        {t('docs.introduction.description')}
      </p>

      {/* DevTools Overview Screenshot */}
      <div className="not-prose my-8 overflow-hidden border-white/10 rounded-2xl border-none">
        <img
          src="/screenshots/overview.png"
          alt="React DevTools Plus Overview"
          className="w-full rounded-2xl"
        />
      </div>

      <div className="not-prose my-8 border border-white/10 rounded-2xl bg-white/5 p-6">
        <h2 className="mb-4 text-xl text-white font-semibold">{t('docs.introduction.whatIs.title')}</h2>
        <p className="text-slate-300 leading-relaxed">
          {t('docs.introduction.whatIs.description')}
        </p>
      </div>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.introduction.whyUse.title')}</h2>
      <p className="text-slate-300 leading-relaxed">
        {t('docs.introduction.whyUse.description')}
      </p>

      <ul className="my-6 space-y-3">
        {(t('docs.introduction.whyUse.benefits', { returnObjects: true }) as string[]).map((benefit, idx) => (
          <li key={idx} className="flex items-start gap-3 text-slate-300">
            <CheckCircle className="text-brand-400 mt-0.5 h-5 w-5 flex-shrink-0" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.introduction.coreFeatures.title')}</h2>
      <div className="not-prose grid gap-4 sm:grid-cols-2">
        {(t('docs.introduction.coreFeatures.items', { returnObjects: true }) as Array<{ title: string, description: string }>).map((feature, idx) => (
          <div key={idx} className="border border-white/10 rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
            <h3 className="mb-2 text-lg text-white font-semibold">{feature.title}</h3>
            <p className="text-sm text-slate-400">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Online Playground Section */}
      <h2 className="mb-4 mt-10 text-2xl text-white font-bold">{t('docs.introduction.playground.title')}</h2>
      <p className="mb-6 text-slate-300 leading-relaxed">
        {t('docs.introduction.playground.description')}
      </p>

      <div className="not-prose overflow-hidden border border-white/10 rounded-xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="px-4 py-3 text-white font-semibold">{t('docs.introduction.playground.table.integration')}</th>
              <th className="hidden px-4 py-3 text-white font-semibold sm:table-cell">{t('docs.introduction.playground.table.description')}</th>
              <th className="px-4 py-3 text-white font-semibold">{t('docs.introduction.playground.table.tags')}</th>
              <th className="px-4 py-3 text-right text-white font-semibold">{t('docs.introduction.playground.table.action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {(t('docs.introduction.playground.items', { returnObjects: true }) as PlaygroundItem[]).map((item, idx) => (
              <tr key={idx} className="transition-colors hover:bg-white/5">
                <td className="px-4 py-3">
                  <span className="text-white font-medium">{item.name}</span>
                </td>
                <td className="hidden px-4 py-3 text-slate-400 sm:table-cell">{item.description}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, tagIdx) => (
                      <span
                        key={tagIdx}
                        className="bg-brand-500/20 text-brand-300 inline-block rounded-full px-2 py-0.5 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-brand-500 hover:bg-brand-600 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-white font-medium transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t('docs.introduction.playground.tryIt')}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="not-prose mt-10 flex flex-wrap gap-4">
        <Link
          to="/docs/installation"
          className="bg-brand-500 hover:bg-brand-600 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm text-white font-medium transition-colors"
        >
          <Zap className="h-4 w-4" />
          {t('docs.introduction.getStarted')}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/features"
          className="inline-flex items-center gap-2 border border-white/10 rounded-full bg-white/5 px-6 py-3 text-sm text-white font-medium transition-colors hover:bg-white/10"
        >
          {t('docs.introduction.exploreFeatures')}
        </Link>
      </div>
    </div>
  )
}
