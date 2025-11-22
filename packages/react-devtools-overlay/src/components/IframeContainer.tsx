import { useEffect, useRef } from 'react'

interface IframeContainerProps {
  iframeRef: React.RefObject<HTMLIFrameElement | null>
  visible: boolean
}

export function IframeContainer({ iframeRef, visible }: IframeContainerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    const iframe = iframeRef.current

    if (container && iframe && !container.contains(iframe)) {
      container.appendChild(iframe)
    }
  }, [iframeRef, visible])

  return (
    <div
      ref={containerRef}
      className="react-devtools-iframe-container"
      style={{
        display: visible ? 'block' : 'none',
      }}
    />
  )
}
