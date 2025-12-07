# React DevTools Plus Documentation

This is the documentation website for [React DevTools Plus](https://github.com/wzc520pyfm/react-devtools-plus), built with React, Vite, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 10.0.0

### Development

```bash
# Navigate to the docs directory
cd docs

# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

The documentation site will be available at `http://localhost:3000`.

### Build

```bash
# Build for production
pnpm build

# Preview the production build
pnpm preview
```

## 📁 Project Structure

```
docs/
├── public/
│   └── screenshots/           # Feature screenshots
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/               # Base UI components (Button, CodeBlock, etc.)
│   │   ├── Hero.tsx          # Landing page hero section
│   │   ├── FeatureGrid.tsx   # Features showcase
│   │   ├── Integration.tsx   # Integration guide section
│   │   └── ...
│   ├── hooks/                # Custom React hooks
│   │   └── useScrollAnimation.ts
│   ├── layouts/              # Page layouts
│   │   └── DocsLayout.tsx    # Documentation sidebar layout
│   ├── lib/                  # Utilities
│   │   └── i18n.ts          # Internationalization (EN/ZH)
│   ├── pages/               # Page components
│   │   ├── docs/            # Documentation pages
│   │   │   ├── Introduction.tsx
│   │   │   ├── Installation.tsx
│   │   │   ├── QuickStart.tsx
│   │   │   └── ...
│   │   ├── Features.tsx
│   │   ├── Integration.tsx
│   │   └── Community.tsx
│   ├── styles/
│   │   └── globals.css      # Global styles & animations
│   ├── App.tsx              # Main app with routing
│   └── main.tsx             # Entry point
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

## 🛠️ Tech Stack

| Technology                               | Purpose                 |
| ---------------------------------------- | ----------------------- |
| [React 19](https://react.dev/)           | UI framework            |
| [Vite](https://vitejs.dev/)              | Build tool & dev server |
| [React Router](https://reactrouter.com/) | Client-side routing     |
| [Tailwind CSS](https://tailwindcss.com/) | Styling                 |
| [Shiki](https://shiki.matsu.io/)         | Syntax highlighting     |
| [Lucide React](https://lucide.dev/)      | Icons                   |
| [Iconify](https://iconify.design/)       | Brand icons             |
| [i18next](https://www.i18next.com/)      | Internationalization    |

## 🌐 Internationalization

The documentation supports English and Chinese. Translations are managed in `src/lib/i18n.ts`.

### Adding Translations

1. Open `src/lib/i18n.ts`
2. Add your translation keys to both `en` and `zh` resource objects
3. Use the `useTranslation` hook in your components:

```tsx
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()
  return <h1>{t('my.translation.key')}</h1>
}
```

## 🎨 Styling Guidelines

### Tailwind CSS

We use Tailwind CSS with custom brand colors defined in `tailwind.config.ts`:

```ts
colors: {
  brand: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    // ...
    500: '#0ea5e9',  // Primary brand color
    // ...
  }
}
```

### Animations

Scroll-triggered animations are implemented using:

- Custom `useScrollAnimation` hook with Intersection Observer
- CSS animations defined in `globals.css`

### Code Highlighting

All code blocks use [Shiki](https://shiki.matsu.io/) with the **Material Theme Ocean** theme.

```tsx
import { CodeBlock } from './components/ui/CodeBlock'

<CodeBlock
  code={`const hello = 'world'`}
  language="typescript"
  title="example.ts"
/>
```

## 📝 Adding Documentation Pages

1. Create a new page component in `src/pages/docs/`:

```tsx
// src/pages/docs/MyNewPage.tsx
import React from 'react'
import { useTranslation } from 'react-i18next'

export const MyNewPage: React.FC = () => {
  const { t } = useTranslation()

  return (
    <article className="prose prose-invert max-w-none">
      <h1>{t('docs.myNewPage.title')}</h1>
      {/* Content */}
    </article>
  )
}
```

2. Add the route in `src/App.tsx`:

```tsx
<Route path="my-new-page" element={<MyNewPage />} />
```

3. Add navigation link in `src/layouts/DocsLayout.tsx`

4. Add translations in `src/lib/i18n.ts`

## 📸 Screenshots

Screenshots for documentation are stored in `public/screenshots/`. When capturing new screenshots:

1. Use consistent dimensions (recommended: 1200x800 for full-page, 800x600 for panels)
2. Use PNG format for UI screenshots
3. Name files descriptively: `feature-name.png`

## 🔗 Related Links

- [Main Repository](https://github.com/wzc520pyfm/react-devtools-plus)
- [npm Package](https://www.npmjs.com/package/react-devtools-plus)

## 📄 License

MIT © [wzc520pyfm](https://github.com/wzc520pyfm)
