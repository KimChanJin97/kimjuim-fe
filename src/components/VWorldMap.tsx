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
  // 완전히 동일한 좌표를 가진 음식점 처리
  const [overlappedRestaurants, setOverlappedRestaurants] = useState<Restaurant[]>([])
  const [isOverlapModalOpen, setIsOverlapModalOpen] = useState(false)
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 })

  // 스프라이트에서 마커 추출
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
        // 마커 레이어
        new VectorLayer({
          source: vectorSourceRef.current,
        }),
      ],
      view: new View({
        projection: 'EPSG:3857',
        center: fromLonLat([127.024612, 36.5146]),
        zoom: 18,
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
        const feature = new Feature({
          geometry: new Point(fromLonLat([r.x, r.y])),
          type: 'restaurant',
          rid: r.rid,
          markerState: MarkerState.NORMAL,
        })

        const isClicked = clickedRestaurantId === r.rid
        const style = isClicked ? clickedIcon : normalIcon
        feature.setStyle(new Style({ image: style }))
        newFeatures.push(feature)
      })

    // vectorSource에 추가
    newFeatures.forEach(f => vectorSource.addFeature(f))
  }, [restaurants, clickedRestaurantId])


  useEffect(() => {
    if (!mapInstanceRef.current) return

    const map = mapInstanceRef.current

    // 툴팁 요소 생성
    const tooltip = document.createElement('div')
    tooltip.className = 'marker-tooltip'
    tooltip.style.cssText = `
      position: absolute;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      pointer-events: none;
      z-index: 1000;
      display: none;
      white-space: pre-line;
    `
    document.body.appendChild(tooltip)

    // 클릭 핸들러
    const handleClick = (event: MapBrowserEvent<MouseEvent>) => {
      const features: RestaurantFeature[] = []

      // 해당 픽셀에 있는 모든 음식점 오버레이 수집
      map.forEachFeatureAtPixel(event.pixel, (feature, layer, geometry) => {
        if (feature instanceof Feature && feature.get('type') === 'restaurant') {
          features.push(feature)
        }
      })

      if (features.length > 1) {
        const overlappedRids = features.map(f => f.get('rid'))
        const overlappedRestaurants = restaurants.filter(r => overlappedRids.includes(r.rid))
        setOverlappedRestaurants(overlappedRestaurants)
        setIsOverlapModalOpen(true)
        setModalPosition({ x: event.originalEvent.clientX, y: event.originalEvent.clientY })
        return
      }

      // 음식점 오버레이가 하나만 있을 때만 클릭 이벤트 처리
      if (features.length === 1) {
        const restaurantFeature = features[0] as RestaurantFeature
        const restaurantId = restaurantFeature.get('rid')

        // 부모 컴포넌트에 클릭 알림
        onClickRestaurant(restaurantId)

        // 클릭한 음식점 오버레이만 clicked 스타일로 변경
        map.getLayers().forEach(layer => {
          if (layer instanceof VectorLayer) {
            layer.getSource()?.getFeatures().forEach(feature => {
              if (feature instanceof Feature && feature.get('type') === 'restaurant') {
                if (feature.get('restaurantId') === restaurantId) {
                  feature.setStyle(new Style({ image: clickedIcon }))
                } else {
                  feature.setStyle(new Style({ image: normalIcon }))
                }
              }
            })
          }
        })
      }
    }

    // 호버 핸들러
    let hoveredFeatures: Set<Feature> = new Set()
    const handleHover = (event: MapBrowserEvent<MouseEvent>) => {
      const pixel = event.pixel
      const features: Feature[] = []

      // 해당 픽셀에 있는 모든 음식점 마커 수집
      map.forEachFeatureAtPixel(pixel, (feature, layer, geometry) => {
        if (feature instanceof Feature && feature.get('type') === 'restaurant') {
          features.push(feature)
        }
      })

      // 겹친 음식점 오버레이가 있을 때 툴팁 표시
      if (features.length > 1) {
        tooltip.textContent = `${features.length}개`
        tooltip.style.display = 'block'
        tooltip.style.left = (event.originalEvent.clientX + 10) + 'px'
        tooltip.style.top = (event.originalEvent.clientY - 10) + 'px'

        // 이전에 호버된 마커들 중 현재 features에 없는 것들 복원
        hoveredFeatures.forEach(hf => {
          if (!features.includes(hf)) {
            const markerState = hf.get('markerState')
            if (markerState === MarkerState.NORMAL_HOVERED) {
              hf.setStyle(new Style({ image: normalIcon }))
              hf.set('markerState', MarkerState.NORMAL)
            } else if (markerState === MarkerState.CLICKED_HOVERED) {
              hf.setStyle(new Style({ image: clickedIcon }))
              hf.set('markerState', MarkerState.CLICKED)
            }
          }
        })

        // 현재 겹친 모든 마커를 호버 상태로
        hoveredFeatures = new Set(features)
        features.forEach(f => {
          const markerState = f.get('markerState')
          if (markerState === MarkerState.NORMAL) {
            f.setStyle(new Style({ image: normalHoveredIcon }))
            f.set('markerState', MarkerState.NORMAL_HOVERED)
          } else if (markerState === MarkerState.CLICKED) {
            f.setStyle(new Style({ image: clickedHoveredIcon }))
            f.set('markerState', MarkerState.CLICKED_HOVERED)
          }
        })
      }
      // 음식점 오버레이가 하나만 있을 때만 호버 이벤트 처리
      else {
        tooltip.style.display = 'none'
        const foundFeature = features[0]

        // 이전에 호버된 모든 마커 복원
        hoveredFeatures.forEach(hf => {
          if (hf !== foundFeature) {
            const markerState = hf.get('markerState')
            if (markerState === MarkerState.NORMAL_HOVERED) {
              hf.setStyle(new Style({ image: normalIcon }))
              hf.set('markerState', MarkerState.NORMAL)
            } else if (markerState === MarkerState.CLICKED_HOVERED) {
              hf.setStyle(new Style({ image: clickedIcon }))
              hf.set('markerState', MarkerState.CLICKED)
            }
          }
        })

        // 새로운 오버레이 설정
        if (foundFeature) {
          const markerState = foundFeature.get('markerState')
          if (markerState === MarkerState.NORMAL) {
            foundFeature.setStyle(new Style({ image: normalHoveredIcon }))
            foundFeature.set('markerState', MarkerState.NORMAL_HOVERED)
          } else if (markerState === MarkerState.CLICKED) {
            foundFeature.setStyle(new Style({ image: clickedHoveredIcon }))
            foundFeature.set('markerState', MarkerState.CLICKED_HOVERED)
          }
          hoveredFeatures = new Set([foundFeature])
        } else {
          hoveredFeatures = new Set()
        }
      }

      map.getViewport().style.cursor = features.length > 0 ? 'pointer' : ''
    }

    map.on('click', handleClick)
    map.on('pointermove', handleHover)

    return () => {
      map.un('click', handleClick)
      map.un('pointermove', handleHover)
      // 툴팁 요소 제거
      if (tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip)
      }
    }
  }, [clickedRestaurantId, restaurants])

  // 리스트에서 선택한 음식점 마커 포커싱
  useEffect(() => {
    if (!mapInstanceRef.current) return

    const vectorSource = vectorSourceRef.current
    const features = vectorSource.getFeatures()

    // 포커싱 해제 (상세정보 닫을 경우)
    if (!clickedRestaurantId) {
      features.forEach(f => {
        f.setStyle(new Style({ image: normalIcon }))
        f.set('markerState', MarkerState.NORMAL)
      })
      return
    }

    // 포커싱 (리스트에서 선택한 음식점 오버레이 포커싱)
    const foundFeature = features.find(f => f.get('rid') === clickedRestaurantId)
    if (foundFeature) {
      // 뷰 중앙 이동
      const geometry = foundFeature.getGeometry()
      if (geometry instanceof Point) {
        const coord = geometry.getCoordinates()
        if (coord) {
          mapInstanceRef.current.getView().animate({
            center: coord,
            zoom: 19,
            duration: 500,
          })
        }
      }

      // 오버레이 상태 변경
      foundFeature.setStyle(new Style({ image: clickedIcon }))
      foundFeature.set('markerState', MarkerState.CLICKED)
    }
  }, [clickedRestaurantId])

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
            style={{
              left: `${modalPosition.x}px`,
              top: `${modalPosition.y - 280}px`, // 모달 높이 + 여유 공간
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
    </div>
  )
}

export default VWorldMap