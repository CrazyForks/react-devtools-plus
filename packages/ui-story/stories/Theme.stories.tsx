import type { Meta, StoryObj } from '@storybook/react'
import { Button, Card, PRESET_COLORS, ThemeProvider, useTheme } from '@react-devtools-plus/ui'

function ThemeDemo() {
  const { theme, setTheme, mode, setMode } = useTheme()

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      <Card title="Theme Controls" bordered style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <label style={{ marginRight: '8px' }}>Mode:</label>
            <Button
              variant={mode === 'light' ? 'primary' : 'default'}
              onClick={() => setMode('light')}
              size="sm"
              style={{ marginRight: '4px' }}
            >
              Light
            </Button>
            <Button
              variant={mode === 'dark' ? 'primary' : 'default'}
              onClick={() => setMode('dark')}
              size="sm"
              style={{ marginRight: '4px' }}
            >
              Dark
            </Button>
            <Button
              variant={mode === 'auto' ? 'primary' : 'default'}
              onClick={() => setMode('auto')}
              size="sm"
            >
              Auto
            </Button>
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>Primary Color:</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {PRESET_COLORS.map(color => (
              <Button
                key={color.value}
                variant={theme.primaryColor === color.value ? 'primary' : 'default'}
                onClick={() => setTheme({ primaryColor: color.value })}
                size="sm"
              >
                {color.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        <Card title="Color Palette" bordered>
          <div style={{ display: 'grid', gap: '8px' }}>
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map(shade => (
              <div
                key={shade}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    background: `var(--primary-${shade})`,
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                  }}
                />
                <span style={{ fontSize: '14px', color: 'var(--text-color)' }}>
                  {shade}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Semantic Colors" bordered>
          <div style={{ display: 'grid', gap: '8px' }}>
            {['success', 'warning', 'error', 'info'].map(semantic => (
              <div
                key={semantic}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    background: `var(--color-${semantic})`,
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                  }}
                />
                <span style={{ fontSize: '14px', color: 'var(--text-color)', textTransform: 'capitalize' }}>
                  {semantic}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

const meta = {
  title: 'Theme/ThemeProvider',
  component: ThemeDemo,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeProvider config={{ primaryColor: 'react', mode: 'auto' }}>
        <Story />
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof ThemeDemo>

export default meta
type Story = StoryObj<typeof meta>

export const Interactive: Story = {}

export const LightMode: Story = {
  decorators: [
    Story => (
      <ThemeProvider config={{ primaryColor: 'react', mode: 'light' }}>
        <Story />
      </ThemeProvider>
    ),
  ],
}

export const DarkMode: Story = {
  decorators: [
    Story => (
      <ThemeProvider config={{ primaryColor: 'react', mode: 'dark' }}>
        <Story />
      </ThemeProvider>
    ),
  ],
}

export const BlueTheme: Story = {
  decorators: [
    Story => (
      <ThemeProvider config={{ primaryColor: 'blue', mode: 'auto' }}>
        <Story />
      </ThemeProvider>
    ),
  ],
}

export const GreenTheme: Story = {
  decorators: [
    Story => (
      <ThemeProvider config={{ primaryColor: 'green', mode: 'auto' }}>
        <Story />
      </ThemeProvider>
    ),
  ],
}
