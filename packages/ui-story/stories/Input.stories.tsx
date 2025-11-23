import type { Meta, StoryObj } from '@storybook/react'
import { Input, ThemeProvider } from '@react-devtools/ui'
import { useState } from 'react'

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    status: {
      control: 'select',
      options: ['error', 'warning', 'success', undefined],
    },
    disabled: {
      control: 'boolean',
    },
    allowClear: {
      control: 'boolean',
    },
    block: {
      control: 'boolean',
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
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
    size: 'md',
  },
}

export const WithValue: Story = {
  render: function WithValueRender(args) {
    const [value, setValue] = useState('Hello World')
    return (
      <Input
        {...args}
        value={value}
        onChange={e => setValue(e.target.value)}
      />
    )
  },
  args: {
    placeholder: 'Enter text...',
  },
}

export const WithClear: Story = {
  render: function WithClearRender(args) {
    const [value, setValue] = useState('Clear me')
    return (
      <Input
        {...args}
        value={value}
        onChange={e => setValue(e.target.value)}
        onClear={() => setValue('')}
      />
    )
  },
  args: {
    placeholder: 'Enter text...',
    allowClear: true,
  },
}

export const Success: Story = {
  args: {
    placeholder: 'Success input',
    status: 'success',
    value: 'Valid input',
  },
}

export const Warning: Story = {
  args: {
    placeholder: 'Warning input',
    status: 'warning',
    value: 'Check this',
  },
}

export const Error: Story = {
  args: {
    placeholder: 'Error input',
    status: 'error',
    value: 'Invalid input',
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    value: 'Cannot edit',
    disabled: true,
  },
}

export const Small: Story = {
  args: {
    placeholder: 'Small input',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    placeholder: 'Large input',
    size: 'lg',
  },
}

export const WithPrefix: Story = {
  args: {
    placeholder: 'Search...',
    prefix: '🔍',
  },
}

export const WithSuffix: Story = {
  args: {
    placeholder: 'Enter amount',
    suffix: '$',
  },
}

export const Block: Story = {
  args: {
    placeholder: 'Block input',
    block: true,
  },
  parameters: {
    layout: 'padded',
  },
}
