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
import { AddIcon } from '@/assets/AddIcon'
import ImageSkeleton from '../common/ImageSkeleton'
import RestaurantImageSlider from '../common/RestaurantImageSlider'
import ArrowLeftIcon from '@/assets/lt-arrow.png'
import { useInView } from 'react-intersection-observer'

interface RestaurantListProps {
  categories: Category[]
  restaurants: Restaurant[]
  distance: number
  clickedRestaurantId: string
  onClickCategory: (categoryName: string) => void
  onClickDistance: (newDistance: number) => void
  onClickRestaurant: (rid: string, name: string) => void
  onClickRefresh: () => void
  onRemoveRestaurant: (restaurantId: number) => void
  onClickTournament: () => void
  onClickShare: () => void
  onToggleList: () => void
  isListOpen: boolean
}

interface RestaurantItemProps {
  restaurant: Restaurant
  index: number
  clickedRestaurantId: string
  onClickRestaurant: (rid: string, name: string) => void
  onRemoveRestaurant: (restaurantId: number) => void
  restaurantRefs: React.MutableRefObject<Map<string, HTMLDivElement>>
  hasInfo: (info: string) => boolean
}

const RestaurantItem: React.FC<RestaurantItemProps> = ({
  restaurant,
  index,
  clickedRestaurantId,
  onClickRestaurant,
  onRemoveRestaurant,
  restaurantRefs,
  hasInfo
}) => {
  // Intersection Observer 설정
  const { ref: inViewRef, inView } = useInView({
    triggerOnce: true,   // 한 번 보이면 계속 렌더링 유지
    threshold: 0.1,      // 10%만 보여도 트리거
    rootMargin: '100px'  // 100px 전에 미리 로드 시작
  })

  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (inView) {
      // 화면에 보이기 시작하면 1초 타이머 시작
      const timer = setTimeout(() => {
        setShouldRender(true)
      }, 1000) // 1초

      // 클린업: 1초 이내에 화면에서 사라지면 타이머 취소
      return () => clearTimeout(timer)
    } else {
      // 화면에서 사라지면 shouldRender를 false로 리셋
      setShouldRender(false)
    }
  }, [inView])

  // ref 합치기 (스크롤용 ref + IntersectionObserver ref)
  const setRefs = (el: HTMLDivElement | null) => {
    if (el) {
      restaurantRefs.current.set(restaurant.rid, el)
    }
    inViewRef(el)
  }

  return (
    <div
      className='rlr'
      ref={setRefs}
      onClick={() => onClickRestaurant(restaurant.rid, restaurant.name)}
    >
      {/* 리스트 바디 - 음식점 헤더 */}
      <div className="rlr-header">
        <div className="rlr-info">
          <div className="rlr-category">{restaurant.category}</div>
          <div className="rlr-index-name">{index + 1}. {restaurant.name}</div>
        </div>
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

      {/* 리스트 바디 - 음식점 바디 */}
      <ul className="rlr-body">
        <li>
          <div className="rlr-image-slider">
            {/* 1초 이상 화면에 보였을 때만 실제 이미지 렌더링 */}
            {shouldRender && restaurant.images.length > 0 && (
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
            {/* 아직 1초가 안 지났으면 스켈레톤 표시 */}
            {!shouldRender && restaurant.images.length > 0 && (
              <div className="rlr-skeleton-slider">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rlr-skeleton">
                    <ImageSkeleton
                      alt="loading"
                      width={100}
                      height={100}
                      borderRadius="5px"
                    />
                  </div>
                ))}
              </div>
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
  )
}

const RestaurantList: React.FC<RestaurantListProps> = ({
  categories,
  restaurants,
  distance,
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
      setAnimationClass('shake')
      return
    }

    setPendingDistance(newDistance)

    if (newDistance > distance) {
      setAnimationClass('sliding-right')
    } else {
      setAnimationClass('sliding-left')
    }
  }

  const handleAnimationEnd = () => {
    if (pendingDistance !== null) {
      onClickDistance(pendingDistance)
      setPendingDistance(null)
    }
    setAnimationClass('')
  }

  const hasInfo = (info: string) => {
    return info !== '정보없음'
  }

  const calculateRound = (teams: number): number => {
    let round = 1;
    while (round < teams) {
      round *= 2;
    }
    return round;
  };

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
                key={category.name}
                className={`rl-category ${category.survived ? 'active' : 'inactive'}`}
                onClick={() => onClickCategory(category.name)}
              >
                <span>{category.name}</span>
                <span className="rl-category-icon">
                  {category.survived ? <CloseIcon width={16} height={16} /> : <AddIcon width={16} height={16} />}
                </span>
              </button>
            ))}
            {categories.length > 0 && (
              <button
                className="refresh-btn"
                onClick={onClickRefresh}
              >
                <img src={RefreshIcon} alt="refresh" />
              </button>
            )}
            {categories.length === 0 && (
              <div className="no-category">반경을 늘려서 주변 음식점을 찾아보세요!</div>
            )}
          </div>
        </div>

        {/* 리스트 바디 - 음식점 */}
        <div className="rl-body scrollbar-custom">
          <div className="rl-restaurants">

            {/* 음식점이 없을 때 */}
            {survivedRestaurants.length === 0 && (
              <div className="no-restaurant-wrap">
                <img className="crying-face-icon" src={CryingFaceIcon} alt="crying-face" />
                <div className="no-restaurant-text">죄송해요. 음식점이 없어요</div>
              </div>
            )}

            {/* 음식점이 있을 때 - RestaurantItem 컴포넌트 사용 */}
            {survivedRestaurants.length > 0 &&
              survivedRestaurants.map((restaurant, index) => (
                <RestaurantItem
                  key={restaurant.id}
                  restaurant={restaurant}
                  index={index}
                  clickedRestaurantId={clickedRestaurantId}
                  onClickRestaurant={onClickRestaurant}
                  onRemoveRestaurant={onRemoveRestaurant}
                  restaurantRefs={restaurantRefs}
                  hasInfo={hasInfo}
                />
              ))
            }
          </div>
        </div>

        <div className="btn-wrap">
          {survivedRestaurants.length > 128 && (
            <>
              <button className="rl-worldcup btn disabled">
                <span>음식점이</span>
                <span>너무 많아요</span>
              </button>
              <button className="rl-share btn" onClick={onClickShare}>
                <span>공유하기</span>
              </button>
            </>
          )}
          {survivedRestaurants.length <= 1 && (
            <>
              <button className="rl-worldcup btn disabled">
                <span>월드컵 불가</span>
              </button>
              <button className="rl-share btn disabled">
                <span>공유 불가</span>
              </button>
            </>
          )}
          {survivedRestaurants.length > 1 && survivedRestaurants.length <= 128 && (
            <>
              <button
                className="rl-worldcup btn"
                onClick={onClickTournament}
              >
                <span>{calculateRound(survivedRestaurants.length)}강 시작</span>
              </button>
              <button className="rl-share btn" onClick={onClickShare}>
                <span>공유하기</span>
              </button>
            </>
          )}
        </div>
      </div>

      {isListOpen && <div className="restaurant-list-overlay" onClick={() => onToggleList()}></div>}
    </>
  )
}

export default RestaurantList