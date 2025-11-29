import type { FC, InputHTMLAttributes } from 'react'
import styles from './Switch.module.css'

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: string
}

export const Switch: FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  className = '',
  disabled,
  ...props
}) => {
  const containerClass = [
    styles.switch,
    disabled && styles.disabled,
    className,
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
      <div className={styles.track} />
      {label && (
        <span className={styles.label}>
          {label}
        </span>
      )}
    </label>
  )
}

Switch.displayName = 'Switch'
