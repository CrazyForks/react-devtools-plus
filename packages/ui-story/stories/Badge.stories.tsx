import type { Meta, StoryObj } from '@storybook/react'
import { Badge, Button, ThemeProvider } from '@react-devtools-plus/ui'

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'error', 'info'],
    },
    display: {
      control: 'select',
      options: ['dot', 'count'],
    },
    overflowCount: {
      control: 'number',
    },
  },
  decorators: [
    Story => (
      <ThemeProvider config={{ primaryColor: 'react', mode: 'auto' }}>
        <Story />
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    count: 5,
    children: <Button>Messages</Button>,
  },
}

export const Primary: Story = {
  args: {
    count: 5,
    color: 'primary',
    children: <Button>Primary</Button>,
  },
}

export const Success: Story = {
  args: {
    count: 5,
    color: 'success',
    children: <Button>Success</Button>,
  },
}

export const Warning: Story = {
  args: {
    count: 5,
    color: 'warning',
    children: <Button>Warning</Button>,
  },
}

export const Error: Story = {
  args: {
    count: 5,
    color: 'error',
    children: <Button>Error</Button>,
  },
}

export const Info: Story = {
  args: {
    count: 5,
    color: 'info',
    children: <Button>Info</Button>,
  },
}

export const Dot: Story = {
  args: {
    display: 'dot',
    children: <Button>Notifications</Button>,
  },
}

export const LargeCount: Story = {
  args: {
    count: 99,
    children: <Button>Large Count</Button>,
  },
}

export const OverflowCount: Story = {
  args: {
    count: 1000,
    overflowCount: 99,
    children: <Button>Overflow</Button>,
  },
}

export const Standalone: Story = {
  args: {
    count: 5,
    color: 'error',
  },
}

export const StandaloneDot: Story = {
  args: {
    display: 'dot',
    color: 'success',
  },
}
