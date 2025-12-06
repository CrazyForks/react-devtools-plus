import type { Meta, StoryObj } from '@storybook/react'
import { Button, ThemeProvider } from '@react-devtools-plus/ui'

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'error', 'ghost', 'text'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
    block: {
      control: 'boolean',
    },
  },
  decorators: [
    Story => (
      <ThemeProvider config={{ primaryColor: 'react', mode: 'auto' }}>
        <Story />
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
    size: 'md',
  },
}

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
}

export const Success: Story = {
  args: {
    children: 'Success Button',
    variant: 'success',
  },
}

export const Warning: Story = {
  args: {
    children: 'Warning Button',
    variant: 'warning',
  },
}

export const Error: Story = {
  args: {
    children: 'Error Button',
    variant: 'error',
  },
}

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
}

export const Text: Story = {
  args: {
    children: 'Text Button',
    variant: 'text',
  },
}

export const Small: Story = {
  args: {
    children: 'Small Button',
    variant: 'primary',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    children: 'Large Button',
    variant: 'primary',
    size: 'lg',
  },
}

export const Loading: Story = {
  args: {
    children: 'Loading Button',
    variant: 'primary',
    loading: true,
  },
}

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    variant: 'primary',
    disabled: true,
  },
}

export const Block: Story = {
  args: {
    children: 'Block Button',
    variant: 'primary',
    block: true,
  },
  parameters: {
    layout: 'padded',
  },
}

export const WithIcon: Story = {
  args: {
    children: 'With Icon',
    variant: 'primary',
    icon: '🚀',
  },
}
