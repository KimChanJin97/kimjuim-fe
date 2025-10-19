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
  ex: string[]
}): Promise<RestaurantNearbyResponses> => {
  const queryParams: any = {
    x: params.x,
    y: params.y,
    d: params.d,
  }

  // ex 배열이 있을 때만 추가
  if (params.ex.length > 0) {
    queryParams.ex = params.ex
  }

  const response = await api.get<RestaurantNearbyResponses>('/restaurants/nearby', {
    params: queryParams,
    paramsSerializer: {
      indexes: null, // ?ex=rid1&ex=rid2 형태
    }
  })
  return response.data
}

export const getRestaurantDetail = async (
  rid: string
): Promise<RestaurantDetailResponse> => {
  const response = await api.get(`/restaurants/${rid}`)
  return response.data
}

export const sendMailMessage = async (
  name: string,
  email: string,
  type: string,
  title: string,
  content: string,
  agreement: boolean,
  file: File
) => {
  const formData = new FormData();

  const jsonData = {
    name,
    email,
    type,
    title,
    content,
    agreement
  };

  formData.append(
    'data',
    new Blob([JSON.stringify(jsonData)], { type: 'application/json' })
  );

  if (file) {
    formData.append('file', file);
  }

  return api.post('/questions', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export default api