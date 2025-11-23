interface AddIconProps {
  className?: string
  width?: number
  height?: number
  color?: string
  strokeWidth?: number
}

export const AddIcon: React.FC<AddIconProps> = ({
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
      d="M12 5V19M5 12H19"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)