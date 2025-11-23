import { Icon } from 'ol/style'
import markers from '@/assets/markers.png'

export type CategoryType =
  'korean' | 'bunsik' | 'yasik' | 'gogi' | 'seafood' | 'steamsoup' | 'jokbo' | 'chicken' |
  'burger' | 'pizza' | 'cafe' | 'chinese' | 'japanese' | 'yangsik' | 'asian' | 'global' | 'porridge'

const CATEGORY_ORDER: CategoryType[] = [
  'korean', 'bunsik', 'yasik', 'gogi', 'seafood', 'steamsoup', 'jokbo', 'chicken',
  'burger', 'pizza', 'cafe', 'chinese', 'japanese', 'yangsik', 'asian', 'global', 'porridge'
]

const MARKER_SIZE = 650

// 카테고리를 CategoryType으로 매핑
export const mapCategoryToType = (category: string): CategoryType => {
  const categoryMap: Record<string, CategoryType> = {
    '한식': 'korean',
    '분식': 'bunsik',
    '야식': 'yasik',
    '고기': 'gogi',
    '해산물': 'seafood',
    '찜/탕': 'steamsoup',
    '족발/보쌈': 'jokbo',
    '치킨': 'chicken',
    '햄버거': 'burger',
    '피자': 'pizza',
    '카페/디저트': 'cafe',
    '중식': 'chinese',
    '일식': 'japanese',
    '양식': 'yangsik',
    '아시안': 'asian',
    '세계음식': 'global',
    '죽': 'porridge',
  }
  return categoryMap[category] || 'korean'
}

// 스프라이트에서 카테고리별 아이콘 추출
export const extractCategoryIcon = (
  category: CategoryType,
  isHovered: boolean = false
): Icon => {
  const categoryIndex = CATEGORY_ORDER.indexOf(category)

  // 기본 이미지 위치 (1행만 사용)
  const offsetX = categoryIndex * (MARKER_SIZE + 1) // 각 이미지 사이 1px 간격
  const offsetY = 0

  return new Icon({
    src: markers,
    size: [MARKER_SIZE, MARKER_SIZE],
    offset: [offsetX, offsetY],
    offsetOrigin: 'top-left',
    anchor: [0.5, 0.5],
    scale: isHovered ? 0.07 : 0.06,  // 호버 시 scale만 증가
  })
}