import './RestaurantList.css'
import { Category, Restaurant } from './RestaurantVWorldMap'
import { TriangleLeftIcon, TriangleRightIcon } from '../../../assets/TrianlgeIcon'
import { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react'
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
  isSearchMode: boolean
}

interface RestaurantItemProps {
  restaurant: Restaurant
  index: number
  clickedRestaurantId: string
  onClickRestaurant: (rid: string, name: string) => void
  onRemoveRestaurant: (restaurantId: number) => void
  restaurantRefs: React.MutableRefObject<Map<string, HTMLDivElement>>
}

const hasInfo = (info: string) => {
  return info !== '정보없음'
}

const SKELETON_ITEMS = [1, 2, 3, 4]

// React.memo로 RestaurantItem 최적화
const RestaurantItem = memo<RestaurantItemProps>(({
  restaurant,
  index,
  clickedRestaurantId,
  onClickRestaurant,
  onRemoveRestaurant,
  restaurantRefs,
}) => {
  const { ref: inViewRef, inView } = useInView({
    triggerOnce: false, // 화면을 벗어나면 inView: false가 되도록
    threshold: 0.1,
    rootMargin: '100px'
  })

  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {

    // 이미 렌더링되었으면 다시 처리하지 않음
    if (shouldRender) {
      return
    }

    if (inView) {
      const timer = setTimeout(() => {
        setShouldRender(true)
      }, 1500)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [inView, shouldRender, restaurant.name])

  // useCallback으로 setRefs 메모이제이션
  const setRefs = useCallback((el: HTMLDivElement | null) => {
    if (el) {
      restaurantRefs.current.set(restaurant.rid, el)
    }
    inViewRef(el)
  }, [restaurant.rid, restaurantRefs, inViewRef])

  // useCallback으로 클릭 핸들러 메모이제이션
  const handleClick = useCallback(() => {
    onClickRestaurant(restaurant.rid, restaurant.name)
  }, [onClickRestaurant, restaurant.rid, restaurant.name])

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onRemoveRestaurant(restaurant.id)
  }, [onRemoveRestaurant, restaurant.id])

  // isClicked를 useMemo로 계산
  const isClicked = useMemo(() =>
    clickedRestaurantId === restaurant.rid,
    [clickedRestaurantId, restaurant.rid]
  )

  return (
    <div
      className={`rlr ${isClicked ? 'clicked' : ''}`}
      ref={setRefs}
      onClick={handleClick}
    >
      <div className="rlr-header">
        <div className="rlr-info">
          <div className="rlr-category">{restaurant.category}</div>
          <div className="rlr-index-name">{index + 1}. {restaurant.name}</div>
        </div>
        <button
          className="rlr-close-btn"
          onClick={handleRemove}
        >
          <CloseIcon
            className="close-icon"
            width={22}
            height={22}
          />
        </button>
      </div>

      <ul className="rlr-body">
        <li>
          <div className="rlr-image-slider">
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
            {!shouldRender && restaurant.images.length > 0 && (
              <div className="rlr-skeleton-slider">
                {SKELETON_ITEMS.map((i) => (
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

          {hasInfo(restaurant.menus) && (
            <div className="rlr-row">
              <img src={MenuIcon} alt="menu" />
              <div className="rlr-menus">{restaurant.menus}</div>
            </div>
          )}

          {hasInfo(restaurant.bizHour) && (
            <div className="rlr-row">
              <img src={BizHourIcon} alt="bizHour" />
              <div className="rlr-bizHour">{restaurant.bizHour}</div>
            </div>
          )}

          <div className="rlr-row">
            <img src={AddressIcon} alt="address" />
            <div className="rlr-address">{restaurant.address}</div>
          </div>

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
}, (prevProps, nextProps) => {
  // 필요한 props만 비교
  return (
    prevProps.restaurant.id === nextProps.restaurant.id &&
    prevProps.restaurant.rid === nextProps.restaurant.rid &&
    prevProps.restaurant.name === nextProps.restaurant.name &&
    prevProps.index === nextProps.index &&
    prevProps.clickedRestaurantId === nextProps.clickedRestaurantId &&
    prevProps.restaurant.survived === nextProps.restaurant.survived &&
    prevProps.onClickRestaurant === nextProps.onClickRestaurant &&
    prevProps.onRemoveRestaurant === nextProps.onRemoveRestaurant
  )
})

RestaurantItem.displayName = 'RestaurantItem'

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
  isListOpen,
  isSearchMode
}) => {
  const [animationClass, setAnimationClass] = useState<string>('')
  const [displayDistance, setDisplayDistance] = useState(distance)
  const [pendingDistance, setPendingDistance] = useState<number | null>(null)
  const restaurantRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // survivedRestaurants를 useMemo로 최적화
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

  // useCallback으로 함수들 메모이제이션
  const handleDistanceChange = useCallback((newDistance: number) => {
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
  }, [distance])

  const handleAnimationEnd = useCallback(() => {
    if (pendingDistance !== null) {
      onClickDistance(pendingDistance)
      setPendingDistance(null)
    }
    setAnimationClass('')
  }, [pendingDistance, onClickDistance])

  const handleDistanceDecrease = useCallback(() => {
    handleDistanceChange(distance - 100)
  }, [handleDistanceChange, distance])

  const handleDistanceIncrease = useCallback(() => {
    handleDistanceChange(distance + 100)
  }, [handleDistanceChange, distance])

  // calculateRound를 useCallback으로
  const calculateRound = useCallback((teams: number): number => {
    let round = 1
    while (round < teams) {
      round *= 2
    }
    return round
  }, [])

  const roundText = useMemo(() =>
    calculateRound(survivedRestaurants.length),
    [survivedRestaurants.length, calculateRound]
  )

  return (
    <>
      <div className={`restaurant-list-container ${isListOpen ? 'open' : 'closed'}`}>

        <button
          className="list-toggle-btn"
          onClick={onToggleList}
          aria-label={isListOpen ? "리스트 닫기" : "리스트 열기"}
        >
          <span className="toggle-text">
            {isListOpen ? '목록닫기' : '목록열기'}
          </span>
        </button>

        <div className="rl-header">
          {!isSearchMode && (
            <div className="rl-distance">
              <button
                className="triangle-left"
                onClick={handleDistanceDecrease}
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
                onClick={handleDistanceIncrease}
              >
                <TriangleRightIcon />
              </button>
              <strong className="distance-text">이내 {survivedRestaurants.length} 곳이에요</strong>
            </div>
          )}

          {isSearchMode && (
            <div className="rl-distance">
              <strong className="distance-text">검색하신 음식점 {survivedRestaurants.length} 곳이에요</strong>
            </div>
          )}

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
              <div className="no-category">반경을 늘리거나 검색해서 음식점을 찾아주세요!</div>
            )}
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
                <span>{roundText}강 시작</span>
              </button>
              <button className="rl-share btn" onClick={onClickShare}>
                <span>공유하기</span>
              </button>
            </>
          )}
        </div>

        <div className="rl-body scrollbar-custom">
          <div className="rl-restaurants">
            {survivedRestaurants.length === 0 && (
              <div className="no-restaurant-wrap">
                <img className="crying-face-icon" src={CryingFaceIcon} alt="crying-face" />
                <div className="no-restaurant-text">죄송해요. 음식점이 없어요</div>
              </div>
            )}

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
                />
              ))
            }
          </div>
        </div>


      </div>

      {isListOpen && <div className="restaurant-list-overlay" onClick={onToggleList}></div>}
    </>
  )
}

export default RestaurantList