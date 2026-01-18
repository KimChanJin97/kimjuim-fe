import { CSSProperties } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  visible: boolean
  x: number
  y: number
  text: string
  zIndex?: number
}

const Tooltip: React.FC<TooltipProps> = ({ visible, x, y, text, zIndex = 7000 }) => {
  if (!visible) return null

  const style: CSSProperties = {
    position: 'fixed',
    left: x,
    top: y,
    backgroundColor: '#000',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    zIndex: zIndex,
    opacity: visible ? 1 : 0,
    visibility: visible ? 'visible' : 'hidden',
    transition: 'opacity 0.2s ease, visibility 0.2s ease',
  }

  return createPortal(<div style={style}>{text}</div>, document.body)
}

export default Tooltip