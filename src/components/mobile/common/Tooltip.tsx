import { CSSProperties } from 'react'

interface TooltipProps {
  visible: boolean
  x: number
  y: number
  text: string
}

const Tooltip: React.FC<TooltipProps> = ({ visible, x, y, text }) => {
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
    zIndex: 7000,
    opacity: visible ? 1 : 0,
    visibility: visible ? 'visible' : 'hidden',
    transition: 'opacity 0.2s ease, visibility 0.2s ease',
  }

  return <div style={style}>{text}</div>
}

export default Tooltip