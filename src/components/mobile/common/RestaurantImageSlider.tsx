import './RestaurantImageSlider.css'
import { useState } from 'react'
import { TriangleLeftIcon, TriangleRightIcon } from '../../../assets/TrianlgeIcon'
import ImageSkeleton from './ImageSkeleton'

interface RestaurantImageSliderProps {
  images: string[]
  restaurantName: string
  mode?: 'multiple' | 'single'
  imageWidth?: number
  imageHeight?: number
  imagesPerView?: number
  borderRadius?: string
}

const RestaurantImageSlider: React.FC<RestaurantImageSliderProps> = ({
  images,
  restaurantName,
  mode = 'multiple',
  imageWidth = 100,
  imageHeight = 100,
  imagesPerView = 4,
  borderRadius = '5px'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return null
  }

  const IMAGE_GAP = 10
  const ITEM_WIDTH = imageWidth + IMAGE_GAP

  // multiple 모드 (여러 이미지 가로 스크롤)
  if (mode === 'multiple') {
    const canScrollLeft = currentIndex > 0
    const canScrollRight = currentIndex + imagesPerView < images.length

    const handleScroll = (direction: 'left' | 'right') => {
      if (direction === 'left') {
        setCurrentIndex(Math.max(0, currentIndex - imagesPerView))
      } else {
        setCurrentIndex(Math.min(images.length - imagesPerView, currentIndex + imagesPerView))
      }
    }

    const getTransform = () => {
      const translateX = -(currentIndex * ITEM_WIDTH)
      return `translateX(${translateX}px)`
    }

    return (
      <div className="ris-multiple-container">
        <div className="ris-multiple-wrap">
          <div
            className="ris-multiple-images"
            style={{
              transform: getTransform(),
              transition: 'transform 0.3s ease-in-out'
            }}
          >
            {images.map((image, idx) => (
              <div key={image} className="ris-multiple-image">
                <ImageSkeleton
                  src={image}
                  alt={`${restaurantName}-${idx}`}
                  width={imageWidth}
                  height={imageHeight}
                  borderRadius={borderRadius}
                />
              </div>
            ))}
          </div>
        </div>

        {canScrollLeft && (
          <button
            className="ris-multiple-nav-btn left"
            onClick={(e) => {
              e.stopPropagation()
              handleScroll('left')
            }}
          >
            <TriangleLeftIcon />
          </button>
        )}

        {canScrollRight && (
          <button
            className="ris-multiple-nav-btn right"
            onClick={(e) => {
              e.stopPropagation()
              handleScroll('right')
            }}
          >
            <TriangleRightIcon />
          </button>
        )}
      </div>
    )
  }

  // Slider 모드 (한 장씩 보기)
  const canScrollLeft = currentIndex > 0
  const canScrollRight = currentIndex < images.length - 1

  const handleSlide = (direction: 'left' | 'right') => {
    if (direction === 'left' && canScrollLeft) {
      setCurrentIndex(currentIndex - 1)
    } else if (direction === 'right' && canScrollRight) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  return (
    <div className="ris-single-container">
      <ImageSkeleton
        src={images[currentIndex]}
        alt={restaurantName}
        width={imageWidth}
        height={imageHeight}
        borderRadius={borderRadius}
      />

      {canScrollLeft && (
        <button
          className="ris-single-nav-btn left"
          onClick={(e) => {
            e.stopPropagation()
            handleSlide('left')
          }}
        >
          <TriangleLeftIcon />
        </button>
      )}

      {canScrollRight && (
        <button
          className="ris-single-nav-btn right"
          onClick={(e) => {
            e.stopPropagation()
            handleSlide('right')
          }}
        >
          <TriangleRightIcon />
        </button>
      )}
    </div>
  )
}

export default RestaurantImageSlider