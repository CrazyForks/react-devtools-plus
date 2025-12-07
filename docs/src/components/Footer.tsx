import { Github } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const Footer: React.FC = () => {
  const { t } = useTranslation()
  return (
    <footer className="border-t border-white/10 bg-slate-950 pb-6 pt-10 sm:pb-8 sm:pt-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-8 flex flex-col items-center justify-between gap-6 text-center sm:mb-12 md:flex-row sm:gap-8 md:text-left">
          <div>
            <h4 className="mb-2 text-xl text-white font-bold sm:text-2xl">{t('footer.title')}</h4>
            <p className="max-w-sm text-sm text-slate-400 sm:text-base">
              {t('footer.desc')}
            </p>
          </div>
          <div className="flex gap-5 sm:gap-6">
            <a href="https://github.com/wzc520pyfm/react-devtools-plus" className="text-slate-400 transition-colors hover:text-white"><Github className="h-5 w-5 sm:h-6 sm:w-6" /></a>
            {/* <a href="#" className="text-slate-400 transition-colors hover:text-white"><Twitter className="h-5 w-5 sm:h-6 sm:w-6" /></a>
            <a href="#" className="text-slate-400 transition-colors hover:text-white"><Linkedin className="h-5 w-5 sm:h-6 sm:w-6" /></a> */}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 border-t border-white/5 pt-6 text-xs text-slate-500 md:flex-row sm:gap-0 sm:pt-8 sm:text-sm">
          <p className="text-center md:text-left">
            &copy;
            {new Date().getFullYear()}
            {' '}
            {t('footer.copyright')}
            . All rights reserved.
          </p>
          {/* <div className="flex gap-4 sm:gap-6">
            <a href="#" className="hover:text-slate-300">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-slate-300">{t('footer.terms')}</a>
          </div> */}
        </div>
      </div>
    </footer>
  )
}
