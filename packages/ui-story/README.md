# @react-devtools/ui-story

Storybook for React DevTools UI components.

## 🚀 Quick Start

```bash
# Development
pnpm dev

# Build
pnpm build

# Preview built storybook
pnpm preview
```

## 📚 What's Included

This package contains Storybook documentation for all `@react-devtools/ui` components:

- **Button** - Various button styles and states
- **Card** - Card component with different configurations
- **Input** - Input field with validation states
- **Badge** - Badge and notification indicators
- **Theme** - Interactive theme customization

## 🎨 Features

- **Interactive Controls** - Adjust component props in real-time
- **Dark Mode Support** - Test components in light and dark themes
- **Theme Colors** - Preview all theme color variations
- **Responsive Design** - Test components at different screen sizes
- **Accessibility** - Built-in a11y testing

## 📖 Documentation

Visit http://localhost:6006 after running `pnpm dev` to explore:

- Component API documentation
- Interactive examples
- Theme customization
- Best practices

## 🔧 Development

### Adding New Stories

Create a new `.stories.tsx` file in the `stories/` directory:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { YourComponent, ThemeProvider } from '@react-devtools/ui'

const meta = {
  title: 'Components/YourComponent',
  component: YourComponent,
  decorators: [
    (Story) => (
      <ThemeProvider config={{ primaryColor: 'react', mode: 'auto' }}>
        <Story />
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof YourComponent>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    // Your props
  },
}
```

### Testing Themes

All components should be wrapped with `ThemeProvider` to ensure consistent theming:

```tsx
decorators: [
  (Story) => (
    <ThemeProvider config={{ primaryColor: 'react', mode: 'auto' }}>
      <Story />
    </ThemeProvider>
  ),
],
```

## 🌐 Browser Support

Storybook runs on all modern browsers. For production deployment, build with:

```bash
pnpm build
```

Then serve the `storybook-static` directory.

## 📦 Related Packages

- [`@react-devtools/ui`](../react-devtools-ui) - The UI component library
- [`@react-devtools/core`](../react-devtools-core) - Core DevTools functionality

---

**Happy Documenting!** 📚✨
