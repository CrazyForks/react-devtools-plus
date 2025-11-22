import { useState } from 'react'

export function usePanelVisible() {
  const [panelVisible, setPanelVisible] = useState(false)

  const togglePanel = () => {
    setPanelVisible(prev => !prev)
  }

  return {
    panelVisible,
    setPanelVisible,
    togglePanel,
  }
}
