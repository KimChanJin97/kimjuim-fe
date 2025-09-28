interface CloseIconProps {
  className?: string
  width?: number
  height?: number
  color?: string
}

export const CloseIcon: React.FC<CloseIconProps> = ({
  className,
  width = 16,
  height = 16,
  color = 'currentColor',
}) => (
  <svg
    className={className}
    width={width}
    height={height}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 4L4 12M4 4l8 8"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
)