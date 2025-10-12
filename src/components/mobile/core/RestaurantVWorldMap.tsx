import RestaurantList from './RestaurantList'
import VWorldMap from './VWorldMap'
import RestaurantDetail from './RestaurantDetail'
import { useEffect, useState } from 'react'
import { RestaurantNearbyResponse, getRestaurantNearby, RestaurantDetailResponse, getRestaurantDetail } from '@/api/api'
import './RestaurantVWorldMap.css'
import Tournament from './Tournament'
import { useSearchParams } from 'react-router-dom'
import LZString from 'lz-string'

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
  // 디테일
  const [restaurantDetail, setRestaurantDetail] = useState<RestaurantDetailResponse | null>(null)
  // 토너먼트
  const [isTournamentOpen, setIsTournamentOpen] = useState<boolean>(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const [exceptedRestaurants, setExceptedRestaurants] = useState<string[]>([])
  // 공유 모달
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false)
  // 리스트 토글
  const [isListOpen, setIsListOpen] = useState<boolean>(false)
  // 디테일 토글
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false)

  // 위치 정보 가져오기
  useEffect(() => {
    const getLocation = async () => {
      try {
        // URL에서 x, y 파라미터 확인
        const xParam = searchParams.get('x')
        const yParam = searchParams.get('y')

        let finalX: number
        let finalY: number

        // x, y 파라미터가 있으면 사용, 없으면 geolocation 사용
        if (xParam && yParam) {
          finalX = parseFloat(xParam)
          finalY = parseFloat(yParam)
          setX(finalX)
          setY(finalY)
        } else {
          // const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          //   navigator.geolocation.getCurrentPosition(resolve, reject)
          // })

          // finalX = position.coords.longitude
          // finalY = position.coords.latitude
          const finalX = 127.13229313772779
          const finalY = 37.41460591790208
          setX(finalX)
          setY(finalY)
        }

        // 제외 음식점 추출
        const except = searchParams.get('ex')
        let ex: string[] = []
        if (except) {
          try {
            // 압축된 문자열 디코딩
            const decompressed = LZString.decompressFromEncodedURIComponent(except)
            ex = decompressed ? JSON.parse(decompressed) : []
          } catch (error) {
            console.error('URL 파라미터 디코딩 실패:', error)
            ex = []
          }
        }
        setExceptedRestaurants(ex)

        // distance 파라미터 읽기
        const distanceParam = searchParams.get('d')
        const urlDistance = distanceParam ? parseInt(distanceParam, 10) : 100

        // distance가 유효한 값인지 확인
        const validDistances = [100, 200, 300, 400, 500]
        const finalDistance = validDistances.includes(urlDistance) ? urlDistance : 100
        setDistance(finalDistance)

        await loadRestaurants(x, y, finalDistance, ex)
        if (ex.length > 0) {
          setIsTournamentOpen(true)
        }
      } catch (error) {
        console.error('위치 정보를 가져올 수 없습니다:', error)
      }
    }
    getLocation()
  }, [])

  // 음식점 정보 가져오기
  const loadRestaurants = async (x: number, y: number, d: number, ex: string[]) => {
    try {
      const response = await getRestaurantNearby({ x, y, d, ex })
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

  // 제외 음식점 업데이트 (토너먼트 링크 공유 목적)
  useEffect(() => {
    const deadRestaurants = restaurants
      .filter((r) => !r.survived)
      .map((r) => r.rid)
    setExceptedRestaurants(deadRestaurants)
  }, [restaurants])

  // 카테고리 토글
  const onClickCategory = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName)
    if (category) {
      category.survived = !category.survived
      setCategories([...categories])

      // 생존한 음식점 업데이트
      const newRestaurants = restaurants.map((r) => {
        if (r.category === categoryName) {
          return {
            ...r,
            survived: category.survived,
          }
        }
        return r
      })
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

  // 카테고리 새로 고침
  const onClickRefresh = () => {
    setRestaurantDetail(null)
    setClickedRestaurantId('')
    setCategories(categories.map((c) => ({ ...c, survived: true })))
    setRestaurants(restaurants.map((r) => ({ ...r, survived: true })))
    setExceptedRestaurants([])
  }

  // 거리 업데이트
  const onClickDistance = async (newDistance: number) => {
    setRestaurantDetail(null)
    setClickedRestaurantId('')
    setDistance(newDistance)
    setExceptedRestaurants([])
    await loadRestaurants(x, y, newDistance, exceptedRestaurants)
  }

  // 음식점 상세정보 닫기
  const onCloseRestaurantDetail = () => {
    setClickedRestaurantId('')
    setRestaurantDetail(null)
    setIsDetailOpen(false)
  }

  // 음식점 선택 (리스트 또는 지도)
  const onClickRestaurant = (rid: string) => {
    setClickedRestaurantId(rid)
    // setRestaurantDetail useEffect 추적
    setIsDetailOpen(true)
  }

  // 토너먼트 열기
  const onClickTournament = () => {
    setIsTournamentOpen(true)
    setIsListOpen(false)
    setIsDetailOpen(false)
  }

  // 토너먼트 닫기
  const onCloseTournament = () => {
    setIsTournamentOpen(false)
    setIsListOpen(false)
    setIsDetailOpen(false)
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

  const onClickShare = () => {
    // JSON 문자열로 변환 후 압축
    const jsonString = JSON.stringify(exceptedRestaurants)
    const compressed = LZString.compressToEncodedURIComponent(jsonString)

    // 현재 경로 기반으로 URL 생성
    const isMobile = window.location.pathname.startsWith('/m')
    const path = isMobile ? '/m/map' : '/map'
    const url = `${window.location.origin}${path}?ex=${compressed}&d=${distance}&x=${x}&y=${y}`

    // 236번 줄 삭제! (조건 체크 전에 실행하면 안됨)

    // clipboard API 지원 확인
    if (navigator.clipboard && navigator.clipboard.writeText) {
      // 최신 브라우저 (HTTPS 또는 localhost)
      navigator.clipboard.writeText(url)
        .then(() => {
          setIsShareModalOpen(true)
          setTimeout(() => {
            setIsShareModalOpen(false)
          }, 1500)
        })
        .catch(() => {
          // 실패 시 구식 방법
          legacyCopy(url)
        })
    } else {
      // 구식 브라우저 또는 비보안 컨텍스트 (HTTP)
      legacyCopy(url)
    }
  }

  const legacyCopy = (url: string) => {
    try {
      const textarea = document.createElement('textarea')
      textarea.value = url
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()

      const successful = document.execCommand('copy')
      document.body.removeChild(textarea)

      if (successful) {
        setIsShareModalOpen(true)
        setTimeout(() => {
          setIsShareModalOpen(false)
        }, 1500)
      } else {
        alert('링크 복사에 실패했습니다.')
      }
    } catch (err) {
      console.error('복사 실패:', err)
      alert('링크 복사에 실패했습니다.')
    }
  }

  const onToggleList = () => {
    setIsListOpen(!isListOpen)
  }

  const onToggleDetail = () => {
    setIsDetailOpen(!isDetailOpen)
  }

  return (
    <div className="rvm-container">
      <div className="rvm-restaurant-list">
        <RestaurantList
          categories={categories}
          restaurants={restaurants}
          distance={distance}
          clickedRestaurantId={clickedRestaurantId}
          onClickCategory={onClickCategory}
          onClickDistance={onClickDistance}
          onClickRefresh={onClickRefresh}
          onRemoveRestaurant={onRemoveRestaurant}
          onClickRestaurant={onClickRestaurant}
          onClickTournament={onClickTournament}
          onClickShare={onClickShare}
          onToggleList={onToggleList}
          isListOpen={isListOpen}
        />
      </div>
      <div className="rvm-restaurant-detail">
        <RestaurantDetail
          restaurantDetail={restaurantDetail}
          onToggleDetail={onToggleDetail}
          isDetailOpen={isDetailOpen}
        />
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
      {isShareModalOpen && (
        <div className="share-modal-overlay">
          <div className="share-modal-content">
            <div className="share-modal-icon">✓</div>
            <h2>공유 링크가 복사되었습니다!</h2>
            <p>클립보드에 링크가 저장되었습니다.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default RestaurantVWorldMap