import './VWorldMap.css'
import React, { useState, useEffect, useRef } from 'react'
import OlMap from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import Circle from 'ol/geom/Circle'
import { Style, Icon, Fill, Stroke } from 'ol/style'
import { fromLonLat, toLonLat } from 'ol/proj'
import { Restaurant } from './RestaurantVWorldMap'
import markers from '@/assets/markers.png'
import { MapBrowserEvent } from 'ol'
import Tooltip from './Tooltip'
import { useTooltip } from '../hooks/useTooltip'
import { Geometry } from 'ol/geom'

const SMALL_MARKER_WIDTH = 50
const SMALL_MARKER_HEIGHT = 50
const LARGE_MARKER_WIDTH = 54
const LARGE_MARKER_HEIGHT = 54

interface VWorldMapProps {
  restaurants: Restaurant[]
  x: number
  y: number
  distance: number
  clickedRestaurantId: string
  onClickRestaurant: (rid: string) => void
}

interface RestaurantFeature extends Feature {
  get(key: 'rid'): string;
  get(key: 'type'): string;
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
  const hoveredFeaturesRef = useRef<Set<Feature>>(new Set())
  // 완전히 동일한 좌표를 가진 음식점 처리
  const [overlappedRestaurants, setOverlappedRestaurants] = useState<Restaurant[]>([])
  const [isOverlapModalOpen, setIsOverlapModalOpen] = useState(false)
  const [overlapModalPosition, setOverlapModalPosition] = useState({ x: 0, y: 0 })
  const [overlapModalHeight, setOverlapModalHeight] = useState(0)
  // 툴팁
  const { tooltip, showTooltip, hideTooltip } = useTooltip()

  // 스프라이트에서 음식점 이미지 추출
  const extractFromSprite = (
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    centerX: number = width / 2,
    centerY: number = height / 2
  ): Icon => {
    return new Icon({
      src: markers,
      size: [width, height],
      offset: [offsetX, offsetY],
      offsetOrigin: 'top-left',
      anchor: [centerX / width, centerY / height],
      scale: 0.6,
    })
  }

  // 음식점 아이콘
  const normalIcon = extractFromSprite(0, 0, SMALL_MARKER_WIDTH, SMALL_MARKER_HEIGHT)
  const clickedIcon = extractFromSprite(50, 0, SMALL_MARKER_WIDTH, SMALL_MARKER_HEIGHT)
  const normalHoveredIcon = extractFromSprite(100, 0, LARGE_MARKER_WIDTH, LARGE_MARKER_HEIGHT)
  const clickedHoveredIcon = extractFromSprite(154, 0, LARGE_MARKER_WIDTH, LARGE_MARKER_HEIGHT)

  // 지도 초기화
  useEffect(() => {
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

    mapInstanceRef.current = map

    return () => {
      map.setTarget(undefined)
    }
  }, [])

  // 지도에 벡터 추가
  useEffect(() => {
    if (!mapInstanceRef.current) return

    // 지도 중심
    mapInstanceRef.current.getView().setCenter(fromLonLat([x, y]))

    // 반경 제거 및 초기화
    const circleSource = circleSourceRef.current
    circleSource.clear()
    const circleFeature = new Feature({ geometry: new Circle(fromLonLat([x, y]), distance) })
    circleSource.addFeature(circleFeature)
  }, [x, y, distance])

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
        const isClicked = clickedRestaurantId === r.rid
        const feature = new Feature({
          geometry: new Point(fromLonLat([r.x, r.y])),
          type: 'restaurant',
          rid: r.rid,
          markerState: isClicked ? MarkerState.CLICKED : MarkerState.NORMAL,
        })

        const style = isClicked ? clickedIcon : normalIcon
        feature.setStyle(new Style({ image: style }))
        newFeatures.push(feature)
      })

    // 벡터 소스에 추가
    newFeatures.forEach(f => vectorSource.addFeature(f))
  }, [restaurants, clickedRestaurantId])

  const createMarkerStyle = (icon: Icon, zIndex: number = 500): Style => {
    return new Style({
      image: icon,
      zIndex: zIndex
    })
  }


  useEffect(() => {
    if (!mapInstanceRef.current) return

    const map = mapInstanceRef.current
    const oldHoveredFeatures = hoveredFeaturesRef.current

    // 마우스 커서 아래의 음식점 레이어 수집
    const getRestaurantFeatures = (pixel: number[]): Feature[] => {
      const features: Feature[] = []
      map.forEachFeatureAtPixel(pixel, (feature) => {
        if (feature instanceof Feature && feature.get('type') === 'restaurant') {
          features.push(feature)
        }
      })
      return features
    }

    // 음식점 레이어 호버 상태 복원 함수
    const restoreHovered = (feature: Feature) => {
      const markerState = feature.get('markerState')
      if (markerState === MarkerState.NORMAL_HOVERED) {
        feature.setStyle(new Style({ image: normalIcon }))
        feature.set('markerState', MarkerState.NORMAL)
      } else if (markerState === MarkerState.CLICKED_HOVERED) {
        feature.setStyle(new Style({ image: clickedIcon }))
        feature.set('markerState', MarkerState.CLICKED)
      }
    }

    // 음식점 레이어 호버 상태 변경 함수
    const setHovered = (feature: Feature) => {
      const markerState = feature.get('markerState')
      if (markerState === MarkerState.NORMAL) {
        feature.setStyle(new Style({ image: normalHoveredIcon }))
        feature.set('markerState', MarkerState.NORMAL_HOVERED)
      } else if (markerState === MarkerState.CLICKED) {
        feature.setStyle(new Style({ image: clickedHoveredIcon }))
        feature.set('markerState', MarkerState.CLICKED_HOVERED)
      }
    }

    // 클릭 핸들러
    const handleClick = (event: MapBrowserEvent<MouseEvent>) => {
      const features: RestaurantFeature[] = getRestaurantFeatures(event.pixel)

      // 음식점 레이어가 여러 개 있을 경우
      if (features.length > 1) {
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

        return
      }
      // 음식점 레이어가 하나만 있을 경우 클릭 처리
      else {
        const restaurantId = features[0].get('rid')
        onClickRestaurant(restaurantId)
      }
    }

    // 호버 핸들러
    const handleHover = (event: MapBrowserEvent<MouseEvent>) => {
      const newHoveredFeatures = getRestaurantFeatures(event.pixel)

      // 음식점 레이어가 여러 개 있을 경우 호버링 처리
      if (newHoveredFeatures.length > 1) {
        // 툴팁 표시
        showTooltip(event.originalEvent, `${newHoveredFeatures.length}개`)

        // 과거 마우스 커서 아래에 있었던 음식점 레이어 호버링 복원
        oldHoveredFeatures.forEach(ohf => {
          if (!newHoveredFeatures.includes(ohf)) {
            restoreHovered(ohf)
          }
        })

        // 현재 마우스 커서 아래에 있는 음식점 레이어 호버링 처리
        oldHoveredFeatures.clear()
        newHoveredFeatures.forEach(nhf => {
          setHovered(nhf)
          oldHoveredFeatures.add(nhf)
        })
      }
      // 음식점 레이어가 하나만 있을 경우 호버링 처리
      else {
        // 툴팁 숨기기
        hideTooltip()
        const newHoveredFeature = newHoveredFeatures[0]

        // 과거 마우스 커서 아래에 있었던 음식점 레이어 호버링 복원
        oldHoveredFeatures.forEach(ohf => {
          if (ohf !== newHoveredFeature) {
            restoreHovered(ohf)
          }
        })

        // 현재 마우스 커서 아래에 있는 음식점 레이어 호버링 처리
        if (newHoveredFeature) {
          setHovered(newHoveredFeature)
          oldHoveredFeatures.clear()
          oldHoveredFeatures.add(newHoveredFeature)
        } else {
          oldHoveredFeatures.forEach(ohf => restoreHovered(ohf))
          oldHoveredFeatures.clear()
        }
      }

      map.getViewport().style.cursor = newHoveredFeatures.length > 0 ? 'pointer' : ''
    }

    map.on('click', handleClick)
    map.on('pointermove', handleHover)

    return () => {
      map.un('click', handleClick)
      map.un('pointermove', handleHover)
    }
  }, [clickedRestaurantId, restaurants])

  // 음식점 클릭시 줌인 처리
  const zoomIn = (geometry: Geometry | undefined) => {
    if (!mapInstanceRef.current || !geometry) return
    if (geometry instanceof Point) {
      const coord = geometry.getCoordinates()
      if (coord) {
        mapInstanceRef.current.getView().animate({
          center: coord,
          zoom: 19,
          duration: 1000,
        })
      }
    }
  }

  // 음식점 클릭할 때 포커싱 처리
  useEffect(() => {
    if (!mapInstanceRef.current) return

    const vectorSource = vectorSourceRef.current
    const features = vectorSource.getFeatures()

    // 상세정보 닫을 경우 클릭 해제 처리
    if (!clickedRestaurantId) {
      features.forEach(f => {
        f.setStyle(new Style({ image: normalIcon }))
        f.set('markerState', MarkerState.NORMAL)
      })
      return
    }

    // 포커싱
    const foundFeature = features.find(f => f.get('rid') === clickedRestaurantId)
    if (foundFeature) {
      // 뷰 중앙 이동
      zoomIn(foundFeature.getGeometry())
      // 음식점 레이어 클릭 상태 변경
      foundFeature.setStyle(new Style({ image: clickedIcon }))
      foundFeature.set('markerState', MarkerState.CLICKED)
    }
  }, [clickedRestaurantId])

  // 음식점 모달 높이 처리
  useEffect(() => {
    if (isOverlapModalOpen && modalRef.current) {
      const height = modalRef.current.offsetHeight
      setOverlapModalHeight(height)
    }
  }, [isOverlapModalOpen, overlappedRestaurants])

  return (
    <div className="vworld-map-container">
      <div ref={mapRef} className="rvm-vworld-map" />

      {/* 겹친 음식점 선택 레이어 */}
      {isOverlapModalOpen && (
        <>
          {/* 투명한 배경 - 클릭 시 닫기용 */}
          <div
            className="overlap-modal-backdrop"
            onClick={() => setIsOverlapModalOpen(false)}
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
                    onClickRestaurant(restaurant.rid)
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