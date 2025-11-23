interface CheckIconProps {
  className?: string
  width?: number
  height?: number
  color?: string
  strokeWidth?: number
}

export const CheckIcon: React.FC<CheckIconProps> = ({
  className,
  width = 24,
  height = 24,
  color = 'currentColor',
  strokeWidth = 3.5,
}) => (
  <svg
    className={className}
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 12L10 17L19 8"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)