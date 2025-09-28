import { useState } from 'react'

export const useTooltip = () => {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: '' })

  const showTooltip = (e: React.MouseEvent, text: string) => {
    setTooltip({
      visible: true,
      x: e.clientX + 10,
      y: e.clientY - 10,
      text
    })
  }

  const hideTooltip = () => {
    setTooltip({ visible: false, x: 0, y: 0, text: '' })
  }

  return { tooltip, showTooltip, hideTooltip }
}