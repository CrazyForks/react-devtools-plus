import type { FC, InputHTMLAttributes } from 'react'
import styles from './Switch.module.css'

export type SwitchSize = 'sm' | 'md' | 'lg'

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: string
  size?: SwitchSize
}

export const Switch: FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  className = '',
  disabled,
  size = 'md',
  ...props
}) => {
  const containerClass = [
    styles.switch,
    disabled && styles.disabled,
    className,
  ].filter(Boolean).join(' ')

  const trackClass = [
    styles.track,
    styles[`size-${size}`],
  ].filter(Boolean).join(' ')

  return (
    <label className={containerClass}>
      <input
        type="checkbox"
        className={styles.input}
        checked={checked}
        onChange={e => onChange?.(e.target.checked)}
        disabled={disabled}
        {...props}
      />
      <div className={trackClass} />
      {label && (
        <span className={styles.label}>
          {label}
        </span>
      )}
    </label>
  )
}

Switch.displayName = 'Switch'
