/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from '@storybook/react'
import { Switch } from '@react-devtools-plus/ui'
import { useState } from 'react'

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    label: {
      control: 'text',
    },
  },
}

export default meta
type Story = StoryObj<typeof Switch>

export const Default: Story = {
  args: {
    label: 'Enable feature',
  },
  render: (args) => {
    const [checked, setChecked] = useState(args.checked || false)
    return <Switch {...args} checked={checked} onChange={setChecked} />
  },
}

export const Checked: Story = {
  args: {
    checked: true,
    label: 'Enabled',
  },
  render: (args) => {
    const [checked, setChecked] = useState(args.checked || true)
    // eslint-disable-next-line ts/ban-ts-comment
    // @ts-expect-error
    return <Switch {...args} checked={checked} onChange={setChecked} />
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Disabled switch',
  },
}

export const DisabledChecked: Story = {
  args: {
    checked: true,
    disabled: true,
    label: 'Disabled checked switch',
  },
}
