import { useEffect, useRef, useState } from 'react'

interface UseScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const { threshold = 0.2, rootMargin = '0px', triggerOnce = true } = options
  const ref = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element)
      return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce) {
            observer.unobserve(element)
          }
        }
        else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [threshold, rootMargin, triggerOnce])

  return { ref, isVisible }
}

// Helper function to get staggered animation delay
export function getStaggerDelay(index: number, baseDelay = 0.1): string {
  return `${index * baseDelay}s`
}

// Animation class names for different effects
export const animationClasses = {
  // Fade up animation
  fadeUp: {
    initial: 'opacity-0 translate-y-8',
    animate: 'opacity-100 translate-y-0',
  },
  // Fade in animation
  fadeIn: {
    initial: 'opacity-0',
    animate: 'opacity-100',
  },
  // Scale up animation
  scaleUp: {
    initial: 'opacity-0 scale-95',
    animate: 'opacity-100 scale-100',
  },
  // Slide from left
  slideLeft: {
    initial: 'opacity-0 -translate-x-12',
    animate: 'opacity-100 translate-x-0',
  },
  // Slide from right
  slideRight: {
    initial: 'opacity-0 translate-x-12',
    animate: 'opacity-100 translate-x-0',
  },
}
