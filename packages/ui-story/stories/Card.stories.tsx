import type { Meta, StoryObj } from '@storybook/react'
import { Card, ThemeProvider } from '@react-devtools-plus/ui'

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    bordered: {
      control: 'boolean',
    },
    hoverable: {
      control: 'boolean',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
  },
  decorators: [
    Story => (
      <ThemeProvider config={{ primaryColor: 'react', mode: 'auto' }}>
        <div style={{ width: '400px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'This is a default card component with some content inside.',
    bordered: true,
    padding: 'md',
  },
}

export const WithTitle: Story = {
  args: {
    title: 'Card Title',
    children: 'This card has a title.',
    bordered: true,
    padding: 'md',
  },
}

export const Hoverable: Story = {
  args: {
    title: 'Hoverable Card',
    children: 'Hover over this card to see the effect.',
    bordered: true,
    hoverable: true,
    padding: 'md',
  },
}

export const NoBorder: Story = {
  args: {
    title: 'No Border',
    children: 'This card has no border.',
    bordered: false,
    padding: 'md',
  },
}

export const SmallPadding: Story = {
  args: {
    title: 'Small Padding',
    children: 'This card has small padding.',
    bordered: true,
    padding: 'sm',
  },
}

export const LargePadding: Story = {
  args: {
    title: 'Large Padding',
    children: 'This card has large padding.',
    bordered: true,
    padding: 'lg',
  },
}

export const NoPadding: Story = {
  args: {
    title: 'No Padding',
    children: 'This card has no padding.',
    bordered: true,
    padding: 'none',
  },
}
