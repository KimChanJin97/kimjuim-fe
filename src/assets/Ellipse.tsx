interface EllipseProps {
  width?: number;
  height?: number;
  strokeWidth?: number;
  strokeColor?: string;
  fillColor?: string;
  textColor?: string;
  text?: string;
  fontSize?: number;
  fontWeight?: number;
  className?: string;
}

export const Ellipse = ({
  width = 120,
  height = 60,
  strokeWidth = 7,
  strokeColor = '#000000',
  fillColor = '#FFFFFF',
  textColor = '#000000',
  text = '김주임',
  fontSize = 24,
  fontWeight = 900,
  className = "",
}: EllipseProps) => {
  return (
    <div
      className={className}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: fillColor,
        border: `${strokeWidth}px solid ${strokeColor}`,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          color: textColor,
          fontSize: `${fontSize}px`,
          fontWeight: fontWeight,
          fontFamily: 'sans-serif',
          userSelect: 'none',
        }}
      >
        {text}
      </span>
    </div>
  );
};