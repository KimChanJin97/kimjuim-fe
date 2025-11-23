import { useEffect, useRef } from 'react';

interface EllipseCanvasProps {
  width?: number;
  height?: number;
  strokeWidth?: number;
  className?: string;
}

export const EllipseCanvas = ({
  width = 80,
  height = 40,
  strokeWidth = 4,
  className = "",
}: EllipseCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 고해상도 디스플레이 지원
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // 안티앨리어싱 설정
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const cx = width / 2;
    const cy = height / 2;
    const rx = (width - strokeWidth) / 2;
    const ry = (height - strokeWidth) / 2;

    // 타원 그리기
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fill();
    ctx.strokeStyle = 'rgb(0, 0, 0)';
    ctx.lineWidth = strokeWidth;
    ctx.stroke();

    // 텍스트 그리기
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.font = '900 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('김주임', cx, cy + 1);
  }, [width, height, strokeWidth]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        colorScheme: 'light',
        forcedColorAdjust: 'none',
      }}
    />
  );
};