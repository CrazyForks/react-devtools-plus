import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: string
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(({
  checked,
  onChange,
  label,
  className = '',
  disabled,
  ...props
}, ref) => {
  return (
    <label className={`relative inline-flex cursor-pointer items-center ${className}`}>
      <input
        ref={ref}
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={e => onChange?.(e.target.checked)}
        disabled={disabled}
        {...props}
      />
      <div className={` peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:border after:border-gray-300 dark:border-gray-600 after:rounded-full after:bg-white dark:bg-gray-700 peer-checked:bg-primary-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:peer-focus:ring-primary-800 ${disabled ? 'cursor-not-allowed opacity-50' : ''}  `}>
      </div>
      {label && (
        <span className={`ml-3 text-sm font-medium ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-300'}`}>
          {label}
        </span>
      )}
    </label>
  )
})

Switch.displayName = 'Switch'
