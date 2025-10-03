import './RestaurantList.css'
import { Category, Restaurant } from './RestaurantVWorldMap'
import { TriangleLeftIcon, TriangleRightIcon } from '../assets/TrianlgeIcon'
import { useState, useEffect, useMemo, useRef } from 'react'
import MenuIcon from '@/assets/menu.png'
import BizHourIcon from '@/assets/biz-hour.png'
import AddressIcon from '@/assets/address.png'
import PriceIcon from '@/assets/price.png'
import RefreshIcon from '@/assets/refresh-btn.png'
import CryingFaceIcon from '@/assets/crying-face.png'
import { CloseIcon } from '@/assets/CloseIcon'
import ImageSkeleton from './ImageSkeleton'
import Tooltip from './Tooltip'
import { useTooltip } from '../hooks/useTooltip'


const NO_INFO = '정보없음'

interface RestaurantListProps {
  categories: Category[]
  restaurants: Restaurant[]
  distance: number
  isLoading: boolean
  clickedRestaurantId: string
  onClickCategory: (categoryName: string) => void
  onClickDistance: (newDistance: number) => void
  onClickRestaurant: (rid: string) => void
  onClickRefresh: () => void
  onRemoveRestaurant: (restaurantId: number) => void
}

// 이미지 스크롤 상수
const IMAGE_WIDTH = 100
const IMAGE_GAP = 10
const ITEM_WIDTH = IMAGE_WIDTH + IMAGE_GAP // 110px
const IMAGES_PER_VIEW = 4 // 한 번에 보이는 이미지 개수

const RestaurantList: React.FC<RestaurantListProps> = ({
  categories, restaurants, distance, isLoading, clickedRestaurantId, onClickCategory, onClickDistance, onClickRestaurant, onClickRefresh, onRemoveRestaurant
}) => {
  const [animationClass, setAnimationClass] = useState<string>('')
  const [displayDistance, setDisplayDistance] = useState(distance)
  const [pendingDistance, setPendingDistance] = useState<number | null>(null)
  const { tooltip, showTooltip, hideTooltip } = useTooltip()
  const restaurantRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  // 이미지 스크롤 인덱스
  const [imageStartIndices, setImageStartIndices] = useState<Map<string, number>>(new Map())

  const survivedRestaurants = useMemo(() => {
    return restaurants.filter(restaurant => restaurant.survived)
  }, [restaurants])

  useEffect(() => {
    setDisplayDistance(distance)
  }, [distance])

  useEffect(() => {
    if (clickedRestaurantId) {
      const restaurant = restaurantRefs.current.get(clickedRestaurantId)
      if (restaurant) {
        restaurant.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [clickedRestaurantId])

  const handleDistanceChange = (newDistance: number) => {
    const validDistances = [100, 200, 300, 400, 500]

    if (!validDistances.includes(newDistance)) {
      // 잘못된 범위일 때 진동 효과
      setAnimationClass('shake')
      return
    }

    // 정상적인 변경일 때 좌우 슬라이드 애니메이션
    setPendingDistance(newDistance)

    if (newDistance > distance) {
      setAnimationClass('sliding-right') // 증가 시 오른쪽으로 슬라이드
    } else {
      setAnimationClass('sliding-left')  // 감소 시 왼쪽으로 슬라이드
    }
  }

  const handleAnimationEnd = () => {
    if (pendingDistance !== null) {
      onClickDistance(pendingDistance)
      setPendingDistance(null)
    }
    setAnimationClass('')
  }

  useEffect(() => {
    if (clickedRestaurantId) {
      const restaurant = restaurantRefs.current.get(clickedRestaurantId)
      if (restaurant) {
        restaurant.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [clickedRestaurantId])

  // 레스토랑이 변경되면 이미지 인덱스 초기화
  useEffect(() => {
    const newMap = new Map<string, number>()
    survivedRestaurants.forEach(restaurant => {
      if (restaurant.images.length > 0) {
        newMap.set(restaurant.rid, 0)
      }
    })
    setImageStartIndices(newMap)
  }, [survivedRestaurants])

  // 이미지 스크롤 핸들러 (인덱스 기반)
  const handleImageScroll = (rid: string, direction: 'left' | 'right') => {
    const restaurant = survivedRestaurants.find(r => r.rid === rid)
    if (!restaurant) return

    const currentIndex = imageStartIndices.get(rid) || 0
    const totalImages = restaurant.images.length

    let nextIndex: number

    if (direction === 'left') {
      // 왼쪽: 4개 이전으로
      nextIndex = Math.max(0, currentIndex - IMAGES_PER_VIEW)
    } else {
      // 오른쪽: 4개 다음으로
      nextIndex = Math.min(
        totalImages - IMAGES_PER_VIEW,
        currentIndex + IMAGES_PER_VIEW
      )
    }

    setImageStartIndices(prev => {
      const newMap = new Map(prev)
      newMap.set(rid, nextIndex)
      return newMap
    })
  }

  // 버튼 표시 여부 계산
  const canScrollLeft = (rid: string): boolean => {
    const currentIndex = imageStartIndices.get(rid) || 0
    return currentIndex > 0
  }

  const canScrollRight = (rid: string, totalImages: number): boolean => {
    const currentIndex = imageStartIndices.get(rid) || 0
    return currentIndex + IMAGES_PER_VIEW < totalImages
  }

  // 이미지 컨테이너의 transform 값 계산
  const getImageTransform = (rid: string): string => {
    const currentIndex = imageStartIndices.get(rid) || 0
    const translateX = -(currentIndex * ITEM_WIDTH)
    return `translateX(${translateX}px)`
  }



  const hasInfo = (info: string) => {
    return info !== NO_INFO && info !== '' && info !== null && info !== undefined
  }

  return (
    <>
      <div className="restaurant-list-container">
        <div className="rl-header">

          {/* 리스트 헤더 - 거리 */}

          <div className="rl-distance">
            <button
              className="triangle-left"
              onClick={() => handleDistanceChange(distance - 100)}
            >
              <TriangleLeftIcon />
            </button>
            <strong
              className={`distance-number ${animationClass}`}
              onAnimationEnd={handleAnimationEnd}
            >
              {displayDistance}m
            </strong>
            <button
              className="triangle-right"
              onClick={() => handleDistanceChange(distance + 100)}
            >
              <TriangleRightIcon />
            </button>
            <strong className="distance-text">이내 음식점 {survivedRestaurants.length} 곳이에요.</strong>
          </div>

          {/* 리스트 헤더 - 카테고리 */}

          <div className="rl-categories">
            {categories.map((category) => (
              <button
                className={`rl-category ${category.survived ? 'active' : 'deactive'}`}
                key={category.name}
                onClick={() => onClickCategory(category.name)}
              >
                {category.name}
              </button>

            ))}
            <button
              className="refresh-btn"
              onClick={onClickRefresh}
              onMouseMove={(e) => showTooltip(e, '카테고리 새로고침')}
              onMouseLeave={hideTooltip}
            >
              <img src={RefreshIcon} alt="refresh" />
            </button>
          </div>
        </div>

        {/* 리스트 바디 - 음식점 */}

        <div className="rl-body scrollbar-custom">
          <div className="rl-restaurants">

            {/* 로딩 끝난 후에도 음식점이 없을 때 */}
            {!isLoading && survivedRestaurants.length === 0 && (
              <div className="no-restaurant-wrap">
                <img className="crying-face-icon" src={CryingFaceIcon} alt="crying-face" />
                <div className="no-restaurant-text">죄송해요. 음식점이 없어요</div>
                <div className="no-restaurant-text">( 현재는 서울/경기 지역만 서비스 중이에요 )</div>
              </div>
            )}

            {/* 음식점이 있을 때 */}
            {survivedRestaurants.length > 0 &&
              survivedRestaurants.map((restaurant, index) => (
                <div
                  className={`rlr ${clickedRestaurantId === restaurant.rid ? 'clicked' : ''}`}
                  ref={(el) => { if (el) restaurantRefs.current.set(restaurant.rid, el) }}
                  key={restaurant.id}
                  onClick={() => onClickRestaurant(restaurant.rid)}
                >
                  {/* 리스트 바디 - 음식점 닫기 */}
                  <div
                    className="close-btn-wrap"
                    onMouseMove={(e) => showTooltip(e, '음식점 제거')}
                    onMouseLeave={hideTooltip}
                  >
                    <button
                      className="close-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveRestaurant(restaurant.id)
                      }}
                    >
                      <CloseIcon
                        className="close-icon"
                        width={22}
                        height={22}
                      />
                    </button>
                  </div>

                  {/* 리스트 바디 - 음식점 헤더 */}
                  <div className="rlr-header">
                    <div className="rlr-index">{index + 1}.</div>
                    <div className="rlr-name">{restaurant.name}</div>
                    <div className="rlr-category">{restaurant.category}</div>
                  </div>

                  {/* 리스트 바디 - 음식점 바디 */}
                  <ul className="rlr-body">
                    <li>
                      {restaurant.images.length > 0 && (
                        <div className="rlr-images-container">
                          <div className="rlr-images-wrap">
                            <div
                              className="rlr-images"
                              style={{
                                transform: getImageTransform(restaurant.rid),
                                transition: 'transform 0.3s ease-in-out'
                              }}
                            >
                              {restaurant.images.map((image, idx) => (
                                <div key={image} className="rlr-image-wrap">
                                  <ImageSkeleton
                                    src={image}
                                    alt={`${restaurant.name}-${idx}`}
                                    width={100}
                                    height={100}
                                    borderRadius="5px"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 왼쪽 화살표 버튼 */}
                          {canScrollLeft(restaurant.rid) && (
                            <button
                              className="image-nav-btn left"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleImageScroll(restaurant.rid, 'left')
                              }}
                            >
                              <TriangleLeftIcon />
                            </button>
                          )}

                          {/* 오른쪽 화살표 버튼 */}
                          {canScrollRight(restaurant.rid, restaurant.images.length) && (
                            <button
                              className="image-nav-btn right"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleImageScroll(restaurant.rid, 'right')
                              }}
                            >
                              <TriangleRightIcon />
                            </button>
                          )}
                        </div>
                      )}

                      {/* 메뉴 */}
                      {hasInfo(restaurant.menus) && (
                        <div className="rlr-row">
                          <img src={MenuIcon} alt="menu" />
                          <div className="rlr-menus">{restaurant.menus}</div>
                        </div>
                      )}

                      {/* 영업시간 */}
                      {hasInfo(restaurant.bizHour) && (
                        <div className="rlr-row">
                          <img src={BizHourIcon} alt="bizHour" />
                          <div className="rlr-bizHour">{restaurant.bizHour}</div>
                        </div>
                      )}

                      {/* 주소 */}
                      <div className="rlr-row">
                        <img src={AddressIcon} alt="address" />
                        <div className="rlr-address">{restaurant.address}</div>
                      </div>

                      {/* 가격 */}
                      {hasInfo(restaurant.recommendedPrice) && (
                        <div className="rlr-row">
                          <img src={PriceIcon} alt="price" height="16px" />
                          <div className="rlr-price">{restaurant.recommendedPrice}</div>
                        </div>
                      )}

                    </li>
                  </ul>

                </div>
              ))
            }
          </div>
        </div>

        <div className="btn-wrap">
          {survivedRestaurants.length > 128 && (
            <>
              <button className="rl-worldcup btn disabled">
                <span>음식점이 너무 많아요</span>
                <img className="crying-face-icon" src={CryingFaceIcon} alt="crying-face" />
              </button>
              <button className="share btn">
                <span>공유하기</span>
              </button>
            </>
          )}
          {survivedRestaurants.length < 1 && (
            <>
              <button className="rl-worldcup btn disabled">
                <span>음식점이 없어요</span>
                <img className="crying-face-icon" src={CryingFaceIcon} alt="crying-face" />
              </button>
              <button className="share btn">
                <span>공유하기</span>
              </button>
            </>
          )}
          {survivedRestaurants.length >= 1 && survivedRestaurants.length <= 128 && (
            <>
              <button className="rl-worldcup btn">
                <span>점심 월드컵 {survivedRestaurants.length}강 시작</span>
              </button>
              <button className="share btn">
                <span>공유하기</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 툴팁 */}
      <Tooltip
        visible={tooltip.visible}
        x={tooltip.x}
        y={tooltip.y}
        text={tooltip.text}
      />
    </>
  )
}

export default RestaurantList