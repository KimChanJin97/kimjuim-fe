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
import Tooltip from '../common/Tooltip'
import { useTooltip } from '../../../hooks/useTooltip'
import RestaurantImageSlider from '../common/RestaurantImageSlider'
import { useInView } from 'react-intersection-observer'

interface RestaurantListProps {
  categories: Category[]
  restaurants: Restaurant[]
  distance: number
  clickedRestaurantId: string
  onClickCategory: (categoryName: string) => void
  onClickDistance: (newDistance: number) => void
  onClickRestaurant: (rid: string) => void
  onClickRefresh: () => void
  onRemoveRestaurant: (restaurantId: number) => void
  onClickTournament: () => void
  onClickShare: () => void
}

// 개별 음식점 아이템 컴포넌트 (같은 파일 내 추가)
interface RestaurantItemProps {
  restaurant: Restaurant
  index: number
  clickedRestaurantId: string
  onClickRestaurant: (rid: string) => void
  onRemoveRestaurant: (restaurantId: number) => void
  showTooltip: (e: React.MouseEvent, text: string) => void
  hideTooltip: () => void
  restaurantRefs: React.MutableRefObject<Map<string, HTMLDivElement>>
  hasInfo: (info: string) => boolean
}

const RestaurantItem: React.FC<RestaurantItemProps> = ({
  restaurant,
  index,
  clickedRestaurantId,
  onClickRestaurant,
  onRemoveRestaurant,
  showTooltip,
  hideTooltip,
  restaurantRefs,
  hasInfo
}) => {
  // Intersection Observer 설정
  const { ref: inViewRef, inView } = useInView({
    triggerOnce: false,
    threshold: 0.1,
    rootMargin: '100px'
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
      className={`rlr ${clickedRestaurantId === restaurant.rid ? 'clicked' : ''}`}
      ref={setRefs}
      onClick={() => onClickRestaurant(restaurant.rid)}
    >
      {/* 리스트 바디 - 음식점 헤더 */}
      <div className="rlr-header">
        <div className="rlr-info">
          <div className="rlr-index">{index + 1}.</div>
          <div className="rlr-name">{restaurant.name}</div>
          <div className="rlr-category">{restaurant.category}</div>
        </div>

        <div
          className="rlr-close-btn-wrap"
          onMouseMove={(e) => showTooltip(e, '음식점 탈락')}
          onMouseLeave={hideTooltip}
        >
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
  onClickShare
}) => {
  const [animationClass, setAnimationClass] = useState<string>('')
  const [displayDistance, setDisplayDistance] = useState(distance)
  const [pendingDistance, setPendingDistance] = useState<number | null>(null)
  const { tooltip, showTooltip, hideTooltip } = useTooltip()
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
          <div className={`rl-categories ${categories.length === 0 ? 'empty' : ''}`}>
            {categories.map((category) => (
              <div
                key={category.name}
                className={`rl-category-btn-wrap ${category.survived ? 'active' : 'deactive'}`}
              >
                <button
                  className="rl-category"
                  onClick={() => onClickCategory(category.name)}
                >
                  {category.name}
                </button>
                <button
                  className="rl-category-toggle-btn"
                  onClick={() => onClickCategory(category.name)}
                >
                  {category.survived ? <CloseIcon width={16} height={16} /> : <AddIcon width={16} height={16} />}
                </button>
              </div>
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
                  showTooltip={showTooltip}
                  hideTooltip={hideTooltip}
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
                <span>음식점이 너무 많아요</span>
              </button>
              <button className="rl-share btn" onClick={onClickShare}>
                <span>공유하기</span>
              </button>
            </>
          )}
          {survivedRestaurants.length <= 1 && (
            <>
              <button className="rl-worldcup btn disabled">
                <span>점심 월드컵 불가</span>
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
                <span>점심 월드컵 {calculateRound(survivedRestaurants.length)}강 시작</span>
              </button>
              <button className="rl-share btn" onClick={onClickShare}>
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