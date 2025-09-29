import RestaurantList from './RestaurantList'
import VWorldMap from './VWorldMap'
import RestaurantDetail from './RestaurantDetail'
import { useEffect, useState } from 'react'
import { RestaurantNearbyResponse, RestaurantNearbyResponses, getRestaurantNearby, RestaurantDetailResponse, getRestaurantDetail } from '@/api/api'
import './RestaurantVWorldMap.css'

export interface Category {
  name: string
  survived: boolean
}

export interface Restaurant extends RestaurantNearbyResponse {
  survived: boolean
}

const RestaurantVWorldMap = () => {

  // 위치
  const [x, setX] = useState<number>(0)
  const [y, setY] = useState<number>(0)
  const [distance, setDistance] = useState<number>(100)
  // 카테고리, 음식점
  const [categories, setCategories] = useState<Category[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [clickedRestaurantId, setClickedRestaurantId] = useState<string>('')
  const [focusedRestaurantId, setFocusedRestaurantId] = useState<string>('')
  // 디테일
  const [isRestaurantDetailOn, setIsRestaurantDetailOn] = useState<boolean>(false)
  const [restaurantDetail, setRestaurantDetail] = useState<RestaurantDetailResponse | null>(null)

  // 위치 정보 가져오기
  useEffect(() => {
    const getLocation = async () => {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        })

        // const x = position.coords.longitude
        // const y = position.coords.latitude
        const x = 127.25093556196362
        const y = 36.48482670839242
        setX(x)
        setY(y)
        await loadRestaurants(x, y, distance)
      } catch (error) {
        console.error('위치 정보를 가져올 수 없습니다:', error)
      }
    }
    getLocation()
  }, [])

  // 음식점 정보 가져오기
  const loadRestaurants = async (x: number, y: number, d: number) => {
    try {
      const response = await getRestaurantNearby({ x, y, d })
      const restaurants = response.restaurantNearbyResponses

      // 카테고리
      const categoriesSet = new Set(restaurants.map((r) => r.category))
      const categories = Array.from(categoriesSet).map(name => ({
        name,
        survived: true,
      }))
      setCategories(categories)
      // 음식점
      const restaurantArr = restaurants.map((r) => ({
        ...r,
        survived: true,
      }))
      setRestaurants(restaurantArr)

    } catch (error) {
      console.error('음식점 정보를 가져올 수 없습니다:', error)
    }
  }

  // 카테고리 토글
  const onClickCategory = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName)
    if (category) {
      category.survived = !category.survived
      setCategories([...categories])

      const newRestaurants = restaurants.map((r) => {
        if (r.category === categoryName) {
          return {
            ...r,
            survived: category.survived,
          }
        }
        return r
      })
      console.log(newRestaurants)
      setRestaurants(newRestaurants)
    }
  }


  // 음식점 제거
  const removeRestaurant = (restaurantId: number) => {
    // 음식점
    const restaurantArr = restaurants.map((r) => {
      if (r.id === restaurantId) {
        return {
          ...r,
          survived: false,
        }
      }
      return r
    })
    setRestaurants(restaurantArr)

    // 카테고리
    const categorySet = new Set(restaurantArr.filter((r) => r.survived).map((r) => r.category))
    const newCategories = categories.map(c => ({
      ...c,
      survived: categorySet.has(c.name),
    }))
    setCategories(newCategories)
  }

  // 음식점 새로 고침
  const onClickRefreshCategories = () => {
    setCategories(categories.map((c) => ({ ...c, survived: true })))
    setRestaurants(restaurants.map((r) => ({ ...r, survived: true })))
  }

  // 음식점 선택
  const onClickRestaurantOverlay = (rid: string) => {
    setClickedRestaurantId(rid)
    setFocusedRestaurantId(rid)
  }

  // 거리 업데이트
  const onClickDistance = async (newDistance: number) => {
    setDistance(newDistance)
    await loadRestaurants(x, y, newDistance)
  }

  const onClickRestaurantDetail = async (rid: string) => {
    const response = await getRestaurantDetail(rid)
    setClickedRestaurantId(rid)
    setFocusedRestaurantId(rid)
    setIsRestaurantDetailOn(true)
    setRestaurantDetail(response)
  }

  const onClickCloseRestaurantDetail = () => {
    setClickedRestaurantId('')
    setIsRestaurantDetailOn(false)
    setFocusedRestaurantId('')
    setRestaurantDetail(null)
  }

  return (
    <div className="rvm-container">
      <div className="rvm-restaurant-list">
        <RestaurantList
          categories={categories}
          restaurants={restaurants}
          distance={distance}
          onClickCategory={onClickCategory}
          onClickDistance={onClickDistance}
          onClickRestaurantDetail={onClickRestaurantDetail}
          onClickRefreshCategories={onClickRefreshCategories}
        />
      </div>
      <div className="rvm-restaurant-detail">
        {isRestaurantDetailOn && restaurantDetail && (
          <RestaurantDetail
            restaurantDetail={restaurantDetail}
            onClickCloseRestaurantDetail={onClickCloseRestaurantDetail}
          />
        )}
      </div>
      <div className="rvm-vworld-map">
        <VWorldMap
          restaurants={restaurants}
          x={x}
          y={y}
          distance={distance}
          onClickRestaurantOverlay={onClickRestaurantOverlay}
          focusedRestaurantId={focusedRestaurantId}
        />
      </div>
    </div>
  )
}

export default RestaurantVWorldMap