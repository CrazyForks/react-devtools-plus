'use client'

import { useState } from 'react'

interface CounterProps {
  initialValue?: number
}

export default function Counter({ initialValue = 0 }: CounterProps) {
  const [count, setCount] = useState(initialValue)

  return (
    <div className="counter">
      <button type="button" onClick={() => setCount(c => c - 1)}>-</button>
      <span>{count}</span>
      <button type="button" onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  )
}
