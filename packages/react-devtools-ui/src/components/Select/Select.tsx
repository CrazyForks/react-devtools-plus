import type { SelectHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import styles from './Select.module.css'

export interface SelectOption {
  label: string
  value: string | number
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options?: SelectOption[]
  onChange?: (value: string) => void
  value?: string | number
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  options = [],
  onChange,
  className = '',
  children,
  ...props
}, ref) => {
  return (
    <div className={`${styles.wrapper}  ${className}`}>
      <select
        className={styles.select}
        onChange={e => onChange?.(e.target.value)}
        ref={ref}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
      <svg className={styles.arrow} viewBox="0 0 20 20" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 8l4 4 4-4" />
      </svg>
    </div>
  )
})

Select.displayName = 'Select'
