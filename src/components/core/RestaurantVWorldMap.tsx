import RestaurantList from './RestaurantList'
import VWorldMap from './VWorldMap'
import RestaurantDetail from './RestaurantDetail'
import { useEffect, useState } from 'react'
import { RestaurantNearbyResponse, getRestaurantNearby, RestaurantDetailResponse, getRestaurantDetail } from '@/api/api'
import './RestaurantVWorldMap.css'
import Tournament from './Tournament'

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
  const [isLoading, setIsLoading] = useState<boolean>(false)
  // 카테고리, 음식점
  const [categories, setCategories] = useState<Category[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [clickedRestaurantId, setClickedRestaurantId] = useState<string>('')
  // 디테일
  const [restaurantDetail, setRestaurantDetail] = useState<RestaurantDetailResponse | null>(null)
  // 토너먼트
  const [isTournamentOpen, setIsTournamentOpen] = useState<boolean>(false)


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
        setIsLoading(false)
      }
    }
    getLocation()
  }, [])

  // 음식점 정보 가져오기
  const loadRestaurants = async (x: number, y: number, d: number) => {
    setIsLoading(true)
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
    } finally {
      setIsLoading(false)
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
  const onRemoveRestaurant = (restaurantId: number) => {
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
  const onClickRefresh = () => {
    setRestaurantDetail(null)
    setClickedRestaurantId('')
    setCategories(categories.map((c) => ({ ...c, survived: true })))
    setRestaurants(restaurants.map((r) => ({ ...r, survived: true })))
  }

  // 거리 업데이트
  const onClickDistance = async (newDistance: number) => {
    setRestaurantDetail(null)
    setClickedRestaurantId('')
    setDistance(newDistance)
    await loadRestaurants(x, y, newDistance)
  }

  // 음식점 상세정보 닫기
  const onCloseRestaurantDetail = () => {
    setClickedRestaurantId('')
    setRestaurantDetail(null)
  }

  // 음식점 선택 (리스트 또는 지도)
  const onClickRestaurant = (rid: string) => {
    setClickedRestaurantId(rid)
  }

  // 토너먼트 열기
  const onClickTournament = () => {
    setIsTournamentOpen(true)
  }

  // 토너먼트 닫기
  const onCloseTournament = () => {
    setIsTournamentOpen(false)
  }

  // 음식점 상세정보 가져오기
  useEffect(() => {
    const fetchRestaurantDetail = async () => {
      if (clickedRestaurantId) {
        const response = await getRestaurantDetail(clickedRestaurantId)
        setRestaurantDetail(response)
      }
    }
    fetchRestaurantDetail()
  }, [clickedRestaurantId])

  return (
    <div className="rvm-container">
      <div className="rvm-restaurant-list">
        <RestaurantList
          categories={categories}
          restaurants={restaurants}
          distance={distance}
          isLoading={isLoading}
          clickedRestaurantId={clickedRestaurantId}
          onClickCategory={onClickCategory}
          onClickDistance={onClickDistance}
          onClickRefresh={onClickRefresh}
          onRemoveRestaurant={onRemoveRestaurant}
          onClickRestaurant={onClickRestaurant}
          onClickTournament={onClickTournament}
        />
      </div>
      <div className="rvm-restaurant-detail">
        {restaurantDetail && (
          <RestaurantDetail
            restaurantDetail={restaurantDetail}
            onCloseRestaurantDetail={onCloseRestaurantDetail}
          />
        )}
      </div>
      <div className="rvm-vworld-map">
        <VWorldMap
          restaurants={restaurants}
          x={x}
          y={y}
          distance={distance}
          clickedRestaurantId={clickedRestaurantId}
          onClickRestaurant={onClickRestaurant}
        />
      </div>
      <div className="rvm-tournament">
        {isTournamentOpen && (
          <Tournament
            restaurants={restaurants}
            onRemoveRestaurant={onRemoveRestaurant}
            onCloseTournament={onCloseTournament}

          />
        )}
      </div>
    </div>
  )
}

export default RestaurantVWorldMap