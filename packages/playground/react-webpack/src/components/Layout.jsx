import { useTheme } from '@react-devtools-plus/ui'
import { Link, Outlet, useLocation } from 'react-router-dom'

export default function Layout() {
  const location = useLocation()
  const { theme, toggleMode } = useTheme()

  return (
    <>
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          backgroundColor: 'var(--color-bg-base, #fff)',
          borderBottom: '1px solid var(--color-border-base, #e5e7eb)',
          padding: '12px 24px',
          display: 'flex',
          gap: '24px',
          alignItems: 'center',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          transition: 'background-color 0.3s, border-color 0.3s',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '18px', marginRight: 'auto', color: 'var(--color-text-primary)' }}>
          React DevTools
        </span>
        <Link
          to="/"
          style={{
            textDecoration: 'none',
            color: location.pathname === '/' ? 'var(--color-primary-500, #3b82f6)' : 'var(--color-text-secondary)',
            fontWeight: location.pathname === '/' ? 600 : 400,
            transition: 'color 0.2s',
          }}
        >
          Home
        </Link>
        <Link
          to="/theme"
          style={{
            textDecoration: 'none',
            color: location.pathname === '/theme' ? 'var(--color-primary-500, #3b82f6)' : 'var(--color-text-secondary)',
            fontWeight: location.pathname === '/theme' ? 600 : 400,
            transition: 'color 0.2s',
          }}
        >
          Theme
        </Link>
        <button
          type="button"
          onClick={toggleMode}
          title={`Switch to ${theme.mode === 'dark' ? 'light' : 'dark'} mode`}
          style={{
            background: 'transparent',
            border: '1px solid var(--color-border-base)',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-primary)',
            borderRadius: '8px',
            width: '36px',
            height: '36px',
            transition: 'all 0.2s',
          }}
        >
          {theme.mode === 'dark'
            ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              )
            : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
        </button>
      </nav>
      <div style={{ padding: '24px' }}>
        <Outlet />
      </div>
    </>
  )
}
