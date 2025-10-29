import './VWorldMap.css'
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import OlMap from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import Circle from 'ol/geom/Circle'
import { Style, Icon, Fill, Stroke, Text } from 'ol/style'
import { fromLonLat, toLonLat } from 'ol/proj'
import { Restaurant } from './RestaurantVWorldMap'
import markers from '@/assets/markers.png'
import { MapBrowserEvent, Overlay } from 'ol'
import Tooltip from '../common/Tooltip'
import { useTooltip } from '../../../hooks/useTooltip'
import { Geometry } from 'ol/geom'
import { CategoryType, mapCategoryToType, extractCategoryIcon } from '@/utils/extractCategoryIcon'

interface VWorldMapProps {
  restaurants: Restaurant[]
  x: number
  y: number
  distance: number
  clickedRestaurantId: string
  onClickRestaurant: (rid: string, name: string) => void
}

interface RestaurantFeature extends Feature {
  get(key: 'rid'): string;
  get(key: 'name'): string;
  get(key: 'type'): string;
  get(key: 'categoryType'): CategoryType;
  get(key: 'markerState'): MarkerState;
}

enum MarkerState {
  NORMAL,
  CLICKED,
  NORMAL_HOVERED,
  CLICKED_HOVERED,
}

const VWorldMap: React.FC<VWorldMapProps> = ({
  restaurants, x, y, distance, clickedRestaurantId, onClickRestaurant
}) => {

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<OlMap | null>(null)
  const vectorSourceRef = useRef<VectorSource>(new VectorSource())
  const circleSourceRef = useRef<VectorSource>(new VectorSource())
  const modalRef = useRef<HTMLDivElement>(null)
  // 완전히 동일한 좌표를 가진 음식점 처리
  const [overlappedRestaurants, setOverlappedRestaurants] = useState<Restaurant[]>([])
  const [isOverlapModalOpen, setIsOverlapModalOpen] = useState(false)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const [overlapModalPosition, setOverlapModalPosition] = useState({ x: 0, y: 0 })
  const [overlapModalHeight, setOverlapModalHeight] = useState(0)
  // 툴팁
  const { tooltip, showTooltip, hideTooltip } = useTooltip()
  // 라벨 오버레이
  const labelOverlayRef = useRef<Overlay | null>(null)
  const labelElementRef = useRef<HTMLDivElement>(null)

  // 지도 초기화
  useLayoutEffect(() => {
    if (!mapRef.current) return

    const map = new OlMap({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: `https://api.vworld.kr/req/wmts/1.0.0/${import.meta.env.VITE_VWORLD_API_KEY}/Base/{z}/{y}/{x}.png`,
          }),
        }),
        // 반경(원)
        new VectorLayer({
          source: circleSourceRef.current,
          style: new Style({
            fill: new Fill({
              color: 'rgba(0, 0, 0, 0.1)',
            }),
            stroke: new Stroke({
              color: 'rgba(0, 0, 0, 0.1)',
              width: 2,
              lineDash: [5, 5],
            }),
          }),
        }),
        // 벡터 레이어 (음식점)
        new VectorLayer({
          source: vectorSourceRef.current,
        }),
      ],
      view: new View({
        projection: 'EPSG:3857',
        center: fromLonLat([127.024612, 36.5146]),
        zoom: 18,
        minZoom: 14,
        maxZoom: 19,
      }),
      controls: [],
    })

    // Label Overlay 생성
    const labelOverlay = new Overlay({
      element: labelElementRef.current || undefined,
      positioning: 'bottom-center',
      offset: [0, -35],  // 마커 위로 35px
      stopEvent: false,
    })

    map.addOverlay(labelOverlay)
    labelOverlayRef.current = labelOverlay
    mapInstanceRef.current = map

    return () => {
      map.setTarget(undefined)
    }
  }, [])

  // 사용자 위치, 반경에 따라 원 벡터 재설정
  useEffect(() => {
    if (!mapInstanceRef.current) return

    // 지도 중심
    const view = mapInstanceRef.current.getView()
    view.setCenter(fromLonLat([x, y]))

    // 반경 제거 및 초기화
    const circleSource = circleSourceRef.current
    circleSource.clear()

    // 음식점 개수 확인
    const survivedRestaurants = restaurants.filter(r => r.survived)
    const hasNoRestaurants = survivedRestaurants.length === 0

    const circleFeature = new Feature({
      geometry: new Circle(fromLonLat([x, y]), distance + 50)
    })

    // 음식점이 없으면 텍스트 표시
    circleFeature.setStyle(new Style({
      fill: new Fill({
        color: 'rgba(0, 0, 0, 0.1)',
      }),
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.1)',
        width: 2,
        lineDash: [5, 5],
      }),
      text: hasNoRestaurants ? new Text({
        text: '반경을 늘려서\n주변 음식점을 찾아보세요!',
        font: 'bold 16px noto sans kr',
        fill: new Fill({
          color: '#555555',
        }),
        textAlign: 'center',
        textBaseline: 'middle',
      }) : undefined,
    }))

    circleSource.addFeature(circleFeature)

    // 반경에 따라 줌 레벨 자동 조정
    const circleGeometry = circleFeature.getGeometry()
    if (circleGeometry) {
      const extent = circleGeometry.getExtent()
      view.fit(extent, {
        padding: [50, 50, 50, 50],
        duration: 1000,
      })
    }
  }, [x, y, distance, restaurants])

  // 음식점 레이어 초기화
  useEffect(() => {
    if (!mapInstanceRef.current) return

    const vectorSource = vectorSourceRef.current

    // 기존 음식점 레이어 제거
    const features = vectorSource.getFeatures()
    const restaurantFeatures = features.filter(f => f.get('type') === 'restaurant')
    restaurantFeatures.forEach(f => vectorSource.removeFeature(f))

    // 음식점 레이어 생성
    const newFeatures: Feature[] = []
    restaurants
      .filter(r => r.survived)
      .forEach(r => {
        const categoryType = mapCategoryToType(r.category)
        const feature = new Feature({
          geometry: new Point(fromLonLat([r.x, r.y])),
          type: 'restaurant',
          rid: r.rid,
          name: r.name,
          category: r.category,
          categoryType: categoryType,
          markerState: MarkerState.NORMAL,  // 항상 NORMAL
        })

        const icon = extractCategoryIcon(categoryType, false)  // 기본 아이콘
        feature.setStyle(new Style({ image: icon }))
        newFeatures.push(feature)
      })

    // 벡터 소스에 추가
    newFeatures.forEach(f => vectorSource.addFeature(f))
  }, [restaurants, clickedRestaurantId])

  // 음식점 레이어 클릭 핸들러
  useEffect(() => {
    if (!mapInstanceRef.current) return

    const map = mapInstanceRef.current

    // 마우스 커서 아래의 음식점 레이어 수집
    const getRestaurantFeatures = (pixel: number[]): Feature[] => {
      const features: Feature[] = []
      map.forEachFeatureAtPixel(
        pixel,
        (feature) => {
          if (feature instanceof Feature && feature.get('type') === 'restaurant') {
            features.push(feature)
          }
        },
        {
          hitTolerance: 10  // 클릭 지점 주변 10px 영역까지 감지
        }
      )
      return features
    }

    // 클릭 핸들러
    const handleClick = (event: MapBrowserEvent<MouseEvent>) => {
      const features: RestaurantFeature[] = getRestaurantFeatures(event.pixel)

      // 아무 음식점도 클릭하지 않았을 경우
      if (features.length === 0) {
        onClickRestaurant('', '')
      }

      // 클릭된 음식점이 없고, 음식점 레이어가 여러 개 클릭되었을 경우
      else if (features.length > 1) {
        // 음식점 모달 처리
        const overlappedRids = features.map(f => f.get('rid'))
        const overlappedRestaurants = restaurants.filter(r => overlappedRids.includes(r.rid))

        // 모달창 위치 설정
        setOverlappedRestaurants(overlappedRestaurants)
        setIsOverlapModalOpen(true)
        setOverlapModalPosition({
          x: event.originalEvent.clientX,
          y: event.originalEvent.clientY
        })
      }

      // 클릭된 음식점이 없고, 음식점 레이어가 하나만 클릭되었을 경우
      else if (features.length === 1) {
        const restaurantId = features[0].get('rid')
        onClickRestaurant(restaurantId, features[0].get('name'))
      }
    }

    map.on('singleclick', handleClick)

    return () => {
      map.un('singleclick', handleClick)
    }
  }, [clickedRestaurantId, restaurants])

  // 음식점 클릭시 줌인 처리 (리스트/지도)
  const zoomIn = (geometry: Geometry | undefined) => {
    if (!mapInstanceRef.current || !geometry) return
    if (geometry instanceof Point) {
      const coord = geometry.getCoordinates()
      if (coord) {
        mapInstanceRef.current.getView().animate({
          center: coord,
          zoom: 19,
          duration: 900,
        })
      }
    }
  }

  // 음식점 클릭할 때 포커싱 처리
  useEffect(() => {
    if (!mapInstanceRef.current || !labelOverlayRef.current) return

    const vectorSource = vectorSourceRef.current
    const features = vectorSource.getFeatures()

    // 상세정보 닫을 경우 클릭 해제 처리
    if (!clickedRestaurantId) {

      // 라벨 숨기기
      labelOverlayRef.current.setPosition(undefined)

      // 투명도 복원
      features.forEach(f => {
        const categoryType = f.get('categoryType') as CategoryType
        const normalIcon = extractCategoryIcon(categoryType, false)
        const style = new Style({ image: normalIcon })
        style.getImage()?.setOpacity(1)
        f.setStyle(style)
        f.set('markerState', MarkerState.NORMAL)
      })
      return
    }

    features.forEach(f => {
      const categoryType = f.get('categoryType') as CategoryType
      const normalIcon = extractCategoryIcon(categoryType, false)
      const isClicked = f.get('rid') === clickedRestaurantId

      const style = new Style({ image: normalIcon })
      style.getImage()?.setOpacity(isClicked ? 1 : 0.3)
      f.setStyle(style)
      f.set('markerState', MarkerState.NORMAL)

      // 클릭된 마커에 라벨 표시
      if (isClicked) {
        const geometry = f.getGeometry()
        if (geometry instanceof Point) {
          const coordinates = geometry.getCoordinates()
          labelOverlayRef.current?.setPosition(coordinates)

          // 라벨 텍스트 업데이트
          if (labelElementRef.current) {
            labelElementRef.current.textContent = f.get('name')
          }
        }
        zoomIn(geometry)
      }
    })
  }, [clickedRestaurantId])

  // 음식점 모달 높이 처리
  useEffect(() => {
    if (isOverlapModalOpen && modalRef.current) {
      const height = modalRef.current.offsetHeight
      setOverlapModalHeight(height)
    }
  }, [isOverlapModalOpen, overlappedRestaurants])

  // 터치 시작 위치 저장
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }
  }

  // 터치 종료 시 모달 닫기
  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsOverlapModalOpen(false)
    touchStartRef.current = null
  }

  return (
    <div className="vworld-map-container">
      <div ref={mapRef} className="rvm-vworld-map" />

      {/* 음식점 이름 라벨 */}
      <div ref={labelElementRef} className="rvm-label-overlay" />

      {/* 겹친 음식점 선택 레이어 */}
      {isOverlapModalOpen && (
        <>
          {/* 투명한 배경 - 클릭 시 닫기용 */}
          <div
            className="overlap-modal-backdrop"
            onClick={() => setIsOverlapModalOpen(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />

          {/* 말풍선 모달 */}
          <div
            className="overlap-modal"
            ref={modalRef}
            style={{
              left: `${overlapModalPosition.x}px`,
              top: `${overlapModalPosition.y - overlapModalHeight - 30}px`, // 모달 높이 + 여유 공간
            }}
            onClick={(e) => e.stopPropagation()}
          >

            <div className="om-restaurants scrollbar-custom">
              {overlappedRestaurants.map((restaurant, index) => (
                <div
                  key={restaurant.rid}
                  className="om-restaurant"
                  onClick={() => {
                    onClickRestaurant(restaurant.rid, restaurant.name)
                    setIsOverlapModalOpen(false)
                  }}
                >
                  <div className="omr-name">{restaurant.name}</div>
                  <div className="omr-category">{restaurant.category}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Tooltip
        visible={tooltip.visible}
        x={tooltip.x}
        y={tooltip.y}
        text={tooltip.text}
      />
    </div>
  )
}

export default VWorldMap