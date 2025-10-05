import { useState } from 'react'
import './ImageSkeleton.css'

interface ImageSkeletonProps {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  className?: string
  borderRadius?: string
}

const ImageSkeleton: React.FC<ImageSkeletonProps> = ({
  src,
  alt,
  width = '100%',
  height = '100%',
  className = '',
  borderRadius = '5px'
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoaded(true)
  }

  return (
    <div
      className="image-skeleton-wrapper"
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius
      }}
    >
      {/* 스켈레톤 UI */}
      {!isLoaded && (
        <div className="skeleton-placeholder" />
      )}

      {/* 실제 이미지 */}
      {!hasError && (
        <img
          src={src}
          alt={alt}
          className={`skeleton-image ${isLoaded ? 'loaded' : ''} ${className}`}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            borderRadius
          }}
        />
      )}

      {/* 에러 시 대체 UI */}
      {hasError && (
        <div className="image-error">
          <span>이미지 로드 실패</span>
        </div>
      )}
    </div>
  )
}

export default ImageSkeleton