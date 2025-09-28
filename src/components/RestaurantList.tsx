import './RestaurantList.css'
import { Category, Restaurant } from './RestaurantVWorldMap'
import { TriangleLeftIcon, TriangleRightIcon } from '../assets/TrianlgeIcon'
import { useState, useEffect, useMemo } from 'react'
import { useTooltip } from '../hooks/useTooltip'
import MenuIcon from '@/assets/menu.png'
import BizHourIcon from '@/assets/biz-hour.png'
import AddressIcon from '@/assets/address.png'
import PriceIcon from '@/assets/price.png'
import RefreshIcon from '@/assets/refresh-btn.png'
import CryingFaceIcon from '@/assets/crying-face.png'

const NO_INFO = '정보없음'

interface RestaurantListProps {
  categories: Category[]
  restaurants: Restaurant[]
  distance: number
  onClickCategory: (categoryName: string) => void
  onClickDistance: (newDistance: number) => void
  onClickRestaurantDetail: (rid: string) => void
  onClickRefreshCategories: () => void
}

const RestaurantList: React.FC<RestaurantListProps> = ({
  categories, restaurants, distance, onClickCategory, onClickDistance, onClickRestaurantDetail, onClickRefreshCategories
}) => {
  const [animationClass, setAnimationClass] = useState<string>('')
  const [displayDistance, setDisplayDistance] = useState(distance)
  const [pendingDistance, setPendingDistance] = useState<number | null>(null)
  const { tooltip, showTooltip, hideTooltip } = useTooltip()

  useEffect(() => {
    setDisplayDistance(distance)
  }, [distance])

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

  const survivedRestaurants = useMemo(() => {
    return restaurants.filter(restaurant => restaurant.survived)
  }, [restaurants])

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
              onClick={onClickRefreshCategories}
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

            {/* 음식점이 없을 때 */}
            {survivedRestaurants.length === 0 && (
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
                  className="rlr"
                  key={restaurant.id}
                  onClick={() => onClickRestaurantDetail(restaurant.rid)}
                  onMouseMove={(e) => showTooltip(e, '상세정보 보기')}
                  onMouseLeave={hideTooltip}
                >

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
                        <div className="rlr-images">
                          {restaurant.images.map((image) => (<img src={image} alt={restaurant.name} key={image} />))}
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


        {survivedRestaurants.length > 128 && (
          <button className="rl-worldcup-btn" disabled>
            <span>음식점 128개 초과</span>
          </button>
        )}
        {survivedRestaurants.length < 1 && (
          <button className="rl-worldcup-btn" disabled>
            <span>음식점 1개 미만</span>
          </button>
        )}
        {survivedRestaurants.length >= 1 && survivedRestaurants.length <= 128 && (
          <button className="rl-worldcup-btn">
            <span>점심 월드컵 {survivedRestaurants.length}강 시작</span>
          </button>
        )}
      </div>

      {/* 툴팁 */}
      {tooltip.visible && (
        <div
          className="tooltip show"
          style={{
            left: tooltip.x,
            top: tooltip.y
          }}
        >
          {tooltip.text}
        </div>
      )}
    </>
  )
}

export default RestaurantList