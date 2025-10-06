import './RestaurantList.css'
import { Category, Restaurant } from './RestaurantVWorldMap'
import { TriangleLeftIcon, TriangleRightIcon } from '../../../assets/TrianlgeIcon'
import { useState, useEffect, useMemo, useRef } from 'react'
import MenuIcon from '@/assets/menu.png'
import BizHourIcon from '@/assets/biz-hour.png'
import AddressIcon from '@/assets/address.png'
import PriceIcon from '@/assets/price.png'
import RefreshIcon from '@/assets/refresh-btn.png'
import CryingFaceIcon from '@/assets/crying-face.png'
import { CloseIcon } from '@/assets/CloseIcon'
import ImageSkeleton from '../common/ImageSkeleton'
import RestaurantImageSlider from '../common/RestaurantImageSlider'
import ArrowLeftIcon from '@/assets/lt-arrow.png'

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
  onClickTournament: () => void
  onClickShare: () => void
  onToggleList: () => void
  isListOpen: boolean
}

// 이미지 스크롤 상수
const IMAGE_WIDTH = 100
const IMAGE_GAP = 10
const ITEM_WIDTH = IMAGE_WIDTH + IMAGE_GAP // 110px
const IMAGES_PER_VIEW = 4 // 한 번에 보이는 이미지 개수

const RestaurantList: React.FC<RestaurantListProps> = ({
  categories,
  restaurants,
  distance,
  isLoading,
  clickedRestaurantId,
  onClickCategory,
  onClickDistance,
  onClickRestaurant,
  onClickRefresh,
  onRemoveRestaurant,
  onClickTournament,
  onClickShare,
  onToggleList,
  isListOpen
}) => {
  const [animationClass, setAnimationClass] = useState<string>('')
  const [displayDistance, setDisplayDistance] = useState(distance)
  const [pendingDistance, setPendingDistance] = useState<number | null>(null)
  const restaurantRefs = useRef<Map<string, HTMLDivElement>>(new Map())
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

  const hasInfo = (info: string) => {
    return info !== NO_INFO && info !== '' && info !== null && info !== undefined
  }

  return (
    <>
      <div className={`restaurant-list-container ${isListOpen ? 'open' : 'closed'}`}>

        <button
          className="list-toggle-btn"
          onClick={() => onToggleList()}
          aria-label={isListOpen ? "리스트 닫기" : "리스트 열기"}
        >
          <span className={`toggle-arrow ${isListOpen ? 'open' : ''}`}>
            <img src={ArrowLeftIcon} alt="arrow-left" width={12} height={12} />
          </span>
        </button>


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
            <strong className="distance-text">이내 {survivedRestaurants.length} 곳이에요</strong>
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


                  {/* 리스트 바디 - 음식점 헤더 */}
                  <div className="rlr-header">
                    <div className="rlr-info">
                      <div className="rlr-index">{index + 1}.</div>
                      <div className="rlr-name">{restaurant.name}</div>
                      <div className="rlr-category">{restaurant.category}</div>
                    </div>

                    <div className="rlr-close-btn-wrap">
                      <button
                        className="rlr-close-btn"
                        onClick={(e) => {
                          e.stopPropagation()
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
                  </div>

                  {/* 리스트 바디 - 음식점 바디 */}
                  <ul className="rlr-body">
                    <li>
                      <div className="rlr-image-slider">
                        {restaurant.images.length > 0 && (
                          <RestaurantImageSlider
                            images={restaurant.images}
                            restaurantName={restaurant.name}
                            mode="multiple"
                            imageWidth={100}
                            imageHeight={100}
                            imagesPerView={4}
                            borderRadius="5px"
                          />
                        )}
                      </div>

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
              <button className="share btn" onClick={onClickShare}>
                <span>공유하기</span>
              </button>
            </>
          )}
          {survivedRestaurants.length <= 1 && (
            <>
              <button className="rl-worldcup btn disabled">
                <span>점심 월드컵 불가</span>
                <img className="crying-face-icon" src={CryingFaceIcon} alt="crying-face" />
              </button>
              <button className="share btn disabled">
                <span>공유 불가</span>
                <img className="crying-face-icon" src={CryingFaceIcon} alt="crying-face" />
              </button>
            </>
          )}
          {survivedRestaurants.length > 1 && survivedRestaurants.length <= 128 && (
            <>
              <button
                className="rl-worldcup btn"
                onClick={onClickTournament}
              >
                <span>{survivedRestaurants.length}강 시작</span>
              </button>
              <button className="share btn" onClick={onClickShare}>
                <span>공유하기</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default RestaurantList