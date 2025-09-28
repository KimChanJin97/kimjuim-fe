import React from 'react';

interface TriangleIconProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const TriangleLeftIcon: React.FC<TriangleIconProps> = ({
  className,
  style,
  onClick
}) => (
  <svg
    width="14"
    height="16"
    viewBox="0 0 14 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
    onClick={onClick}
  >
    <path
      d="M13.5 1.5L13.5 14.5L1.5 8L13.5 1.5Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

export const TriangleRightIcon: React.FC<TriangleIconProps> = ({
  className,
  style,
  onClick
}) => (
  <svg
    width="14"
    height="16"
    viewBox="0 0 14 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
    onClick={onClick}
  >
    <path
      d="M0.5 1.5L0.5 14.5L12.5 8L0.5 1.5Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);