import type { Meta, StoryObj } from '@storybook/react'
import { Select } from '@react-devtools/ui'
import { useState } from 'react'

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    value: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof Select>

const options = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
]

export const Default: Story = {
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState('option1')
    return (
      <div style={{ width: 200 }}>
        <Select
          {...args}
          options={options}
          value={value}
          onChange={setValue}
        />
      </div>
    )
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    options,
    value: 'option1',
  },
  render: (args) => {
    return (
      <div style={{ width: 200 }}>
        <Select {...args} />
      </div>
    )
  },
}

export const WithManyOptions: Story = {
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState('1')
    const manyOptions = Array.from({ length: 10 }, (_, i) => ({
      label: `Option ${i + 1}`,
      value: String(i + 1),
    }))

    return (
      <div style={{ width: 200 }}>
        <Select
          {...args}
          options={manyOptions}
          value={value}
          onChange={setValue}
        />
      </div>
    )
  },
}
