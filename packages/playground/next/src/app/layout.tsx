import type { Metadata } from 'next'
import DevToolsProvider from '@/components/DevToolsProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'React DevTools Plus - Next.js Playground',
  description: 'Testing React DevTools Plus integration with Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <DevToolsProvider>{children}</DevToolsProvider>
      </body>
    </html>
  )
}
