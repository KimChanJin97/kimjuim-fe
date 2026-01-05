import RestaurantList from './RestaurantList'
import VWorldMap from './VWorldMap'
import RestaurantDetail from './RestaurantDetail'
import { useEffect, useState } from 'react'
import { RestaurantNearbyResponse, getRestaurantNearby, RestaurantDetailResponse, getRestaurantDetail, searchRestaurants } from '@/api/api'
import './RestaurantVWorldMap.css'
import Tournament from './Tournament'
import { useSearchParams } from 'react-router-dom'
import LZString from 'lz-string'
import { AddIcon } from '@/assets/AddIcon'
import { CheckIcon } from '@/assets/CheckIcon'
import RestaurantSearch from './RestaurantSearch'

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
  // 검색 상태 추가
  const [isSearchMode, setIsSearchMode] = useState<boolean>(false)
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  // 로딩 상태
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // 위치 정보 가져오기
  useEffect(() => {
    const getLocation = async () => {
      try {
        let finalX: number | undefined
        let finalY: number | undefined
        let finalDistance: number | undefined
        let ex: string[] = []
        let keyword: string = ''
        let isValidShareLink = false // 공유 링크가 유효한지 추적

        // 압축된 데이터 파라미터 확인
        const dataParam = searchParams.get('data')

        if (dataParam) {
          // 공유 링크로 접속
          try {
            const decompressed = LZString.decompressFromEncodedURIComponent(dataParam)
            const shareData = decompressed ? JSON.parse(decompressed) : null

            // 필수 필드(x, y, d)가 유효한 숫자인지 검증
            if (shareData &&
              typeof shareData.x === 'number' &&
              typeof shareData.y === 'number' &&
              typeof shareData.d === 'number') {
              ex = shareData.ex || []
              finalX = shareData.x
              finalY = shareData.y
              finalDistance = shareData.d
              keyword = shareData.k || ''
              isValidShareLink = true // 디코딩 성공
            } else {
              throw new Error('유효하지 않은 공유 데이터')
            }
          } catch (error) {
            console.error('공유 데이터 디코딩 실패:', error)
            // 디코딩 실패 시 모든 데이터 초기화하고 사용자 위치로 폴백
            setSearchParams({}, { replace: true })
            ex = []
            finalDistance = undefined
            keyword = ''
            alert('공유 링크가 유효하지 않습니다. 현재 위치로 이동합니다.')
          }
        }

        // 공유 링크가 없거나 디코딩 실패 시 사용자 위치 사용
        if (finalX === undefined || finalY === undefined) {
          // 일반 접속 또는 공유 링크 디코딩 실패
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,  // true면 GPS만 사용, false면 WiFi도 활용
              timeout: 10000,             // 10초 타임아웃
              maximumAge: 60000           // 1분 이내 캐시된 위치 허용
            })
          })

          finalX = position.coords.longitude
          finalY = position.coords.latitude
          finalDistance = finalDistance || 100
        }

        setX(finalX)
        setY(finalY)
        setDistance(finalDistance || 100)
        setExceptedRestaurants(ex)

        // 검색 키워드가 있으면 검색 수행, 없으면 위치 기반 로딩
        if (keyword) {
          setSearchKeyword(keyword)
          await onSearchRestaurants(keyword, ex)
        } else {
          await loadRestaurants(finalX, finalY, finalDistance || 100, ex)
        }

        // 유효한 공유 링크일 때만 토너먼트 열기
        if (isValidShareLink) {
          setIsTournamentOpen(true)
        }
      } catch (error) {
        console.error('위치 정보를 가져올 수 없습니다:', error)
        alert('위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.')
      } finally {
        await new Promise(resolve => setTimeout(resolve, 10000))
        setIsLoading(false)
      }
    }
    getLocation()
  }, [])

  // 음식점 정보 가져오기
  const loadRestaurants = async (x: number, y: number, d: number, ex: string[]) => {
    try {
      const restaurants = await getRestaurantNearby({ x, y, d, ex })

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
      } else {
        setRestaurantDetail(null)
      }
    }
    fetchRestaurantDetail()
  }, [clickedRestaurantId])

  const onClickShare = () => {
    // 모든 데이터를 객체로 만들어 압축
    const shareData = {
      ex: exceptedRestaurants,
      x: x,
      y: y,
      d: distance,
      k: isSearchMode ? searchKeyword : ''
    }
    const jsonString = JSON.stringify(shareData)
    const compressed = LZString.compressToEncodedURIComponent(jsonString)

    const url = `${window.location.origin}/map?data=${compressed}`
    navigator.clipboard.writeText(url)

    // 모달 표시
    setIsShareModalOpen(true)

    // 2초 후 자동으로 닫기
    setTimeout(() => {
      setIsShareModalOpen(false)
    }, 2000)
  }

  // 음식점 검색
  const onSearchRestaurants = async (keyword: string, excludedRids: string[] = []) => {
    try {
      const searchResults = await searchRestaurants(keyword)

      // 카테고리 (제외된 음식점을 고려)
      const filteredResults = searchResults.filter(r => !excludedRids.includes(r.rid))
      const categoriesSet = new Set(filteredResults.map((r) => r.category))
      const categories = Array.from(categoriesSet).map(name => ({
        name,
        survived: true,
      }))
      setCategories(categories)

      // 음식점 (제외된 음식점은 survived: false로 설정)
      const restaurantArr = searchResults.map((r) => ({
        ...r,
        survived: !excludedRids.includes(r.rid),
      }))
      setRestaurants(restaurantArr)
      setIsSearchMode(true)
      setSearchKeyword(keyword)

      // 디테일 초기화
      setRestaurantDetail(null)
      setClickedRestaurantId('')
    } catch (error) {
      console.error('음식점 검색 실패:', error)
    }
  }

  // 음식점 검색 초기화
  const onResetSearchRestaurants = async () => {
    setIsSearchMode(false)
    setSearchKeyword('')
    await loadRestaurants(x, y, distance, exceptedRestaurants)
    setRestaurantDetail(null)
    setClickedRestaurantId('')
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
          isSearchMode={isSearchMode}
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
        <RestaurantSearch
          onSearchRestaurants={onSearchRestaurants}
          onResetSearchRestaurants={onResetSearchRestaurants}
        />
        <VWorldMap
          restaurants={restaurants}
          x={x}
          y={y}
          distance={distance}
          clickedRestaurantId={clickedRestaurantId}
          onClickRestaurant={onClickRestaurant}
          isSearchMode={isSearchMode}
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
            <CheckIcon width={80} height={80} />
            <h2>공유 링크가 복사되었습니다!</h2>
            <p>클립보드에 링크가 저장되었습니다.</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="loading-modal-overlay">
          <div className="loading-modal-content">
            <div className="loading-spinner" />
            <h2>위치 정보를 가져오는 중입니다.</h2>
            <p>위치 정보를 가져오지 못할 경우, <br />위치 권한을 확인하거나 OS를 업데이트해주세요.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default RestaurantVWorldMap