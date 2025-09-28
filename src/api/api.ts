import axios from 'axios'

const BASE_URL = import.meta.env.VITE_BASE_URL

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

// 음식점 리스트 조회
export interface RestaurantNearbyResponse {
  id: number
  rid: string
  name: string
  x: number
  y: number
  category: string
  address: string
  roadAddress: string
  recommendedPrice: string
  images: string[]
  menus: string
  bizHour: string
}

export interface RestaurantNearbyResponses {
  restaurantNearbyResponses: RestaurantNearbyResponse[]
}

// 음식점 상세 조회
export interface MenuResponse {
  id: number
  name: string
  price: string
  isRecommended: boolean
  description: string
  menuIdx: number
  menuImages: MenuImageResponse[]
}

export interface MenuImageResponse {
  id: number
  url: string
}

export interface ReviewResponse {
  id: number
  title: string,
  url: string,
  authorName: string,
  profileUrl: string,
  content: string,
  createdAt: string
}

export interface RestaurantDetailResponse {
  menus: MenuResponse[]
  reviews: ReviewResponse[]
}

export const getRestaurantNearby = async (params: {
  x: number
  y: number
  d: number
}): Promise<RestaurantNearbyResponses> => {
  const response = await api.get<RestaurantNearbyResponses>('/restaurants/nearby', {
    params: {
      ...params,
    },
  })
  return response.data
}

export const getRestaurantDetail = async (
  rid: string
): Promise<RestaurantDetailResponse> => {
  const response = await api.get(`/restaurants/${rid}`)
  return response.data
}

export default api