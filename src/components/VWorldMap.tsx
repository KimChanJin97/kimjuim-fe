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
  onClickRestaurantOverlay: (rid: string) => void
}

enum MarkerState {
  NORMAL = 'normal',
  CLICKED = 'clicked',
  NORMAL_HOVERED = 'normal_hovered',
  CLICKED_HOVERED = 'clicked_hovered',
}

const VWorldMap: React.FC<VWorldMapProps> = ({
  restaurants, x, y, distance, onClickRestaurantOverlay
}) => {

  // 지도
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<OlMap | null>(null)
  const vectorSourceRef = useRef<VectorSource>(new VectorSource())
  const circleSourceRef = useRef<VectorSource>(new VectorSource())
  const [oldClickedMarkerFeature, setOldClickedMarkerFeature] = useState<Feature | null>(null)

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

  // 음식점 마커
  const normal = extractFromSprite(0, 0, SMALL_MARKER_WIDTH, SMALL_MARKER_HEIGHT)
  const clicked = extractFromSprite(50, 0, SMALL_MARKER_WIDTH, SMALL_MARKER_HEIGHT)
  const normalHovered = extractFromSprite(100, 0, LARGE_MARKER_WIDTH, LARGE_MARKER_HEIGHT)
  const clickedHovered = extractFromSprite(154, 0, LARGE_MARKER_WIDTH, LARGE_MARKER_HEIGHT)

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
    const circleFeature = new Feature({ geometry: new Circle(fromLonLat([x, y]), distance + 50) })
    circleSource.addFeature(circleFeature)
  }, [x, y, distance])

  // 음식점 마커 제거 및 초기화
  useEffect(() => {
    if (!mapInstanceRef.current) return

    const vectorSource = vectorSourceRef.current

    // 기존 음식점 마커 제거
    const features = vectorSource.getFeatures()
    const restaurantFeatures = features.filter(f => f.get('type') === 'restaurant')
    restaurantFeatures.forEach(f => vectorSource.removeFeature(f))

    // 1. 음식점 마커 생성 (아직 vectorSource에 추가하지 않음)
    const newFeatures: Feature[] = []
    restaurants
      .filter(r => r.survived)
      .forEach(r => {
        const feature = new Feature({
          geometry: new Point(fromLonLat([r.x, r.y])),
          type: 'restaurant',
          restaurantId: r.rid,
          originalRestaurant: r,
          markerState: MarkerState.NORMAL,
        })

        // 음식점 마커 기본 상태
        feature.setStyle(new Style({ image: normal }))
        newFeatures.push(feature)
      })

    // 2. 마커 겹침 방지 적용
    resolveMarkerOverlap(newFeatures)

    // 3. 겹침 해결된 마커들을 vectorSource에 추가
    newFeatures.forEach(f => vectorSource.addFeature(f))
  }, [restaurants])

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
      white-space: nowrap;
    `
    document.body.appendChild(tooltip)

    // 마커 클릭 이벤트
    const handleClick = (event: MapBrowserEvent<MouseEvent>) => {
      const features: Feature[] = []

      // 해당 픽셀에 있는 모든 음식점 마커 수집
      map.forEachFeatureAtPixel(event.pixel, (feature, layer, geometry) => {
        if (feature instanceof Feature && feature.get('type') === 'restaurant') {
          features.push(feature)
        }
      })

      if (features.length > 1) {
        // 겹친 마커가 있을 때 툴팁 표시
        tooltip.textContent = `${features.length}개의 음식점이 겹쳤어요. 줌인해주세요 🥲`
        tooltip.style.display = 'block'
        tooltip.style.left = (event.originalEvent.clientX + 10) + 'px'
        tooltip.style.top = (event.originalEvent.clientY - 10) + 'px'
      }

      else if (features.length === 1) {
        // 마커가 하나만 있을 때만 클릭 이벤트 처리
        const newClickedMarkerFeature = features[0]
        const restaurantId = newClickedMarkerFeature.get('restaurantId')

        // 기존 클릭되어있던 음식점 마커 CLICKED -> NORMAL
        if (oldClickedMarkerFeature && oldClickedMarkerFeature !== newClickedMarkerFeature) {
          const oldClickedMarkerFeatureState = oldClickedMarkerFeature.get('markerState')
          if (oldClickedMarkerFeature !== newClickedMarkerFeature && oldClickedMarkerFeatureState === MarkerState.CLICKED) {
            oldClickedMarkerFeature.setStyle(new Style({ image: normal }))
            oldClickedMarkerFeature.set('markerState', MarkerState.NORMAL)
          }
        }

        if (restaurantId) {
          // 새로 클릭된 음식점 마커 NORMAL -> CLICKED
          (newClickedMarkerFeature as Feature).setStyle(new Style({ image: clicked }));
          (newClickedMarkerFeature as Feature).set('markerState', MarkerState.CLICKED)
          setOldClickedMarkerFeature(newClickedMarkerFeature as Feature)
          onClickRestaurantOverlay(restaurantId)
        }
      }
    }

    // 마커 호버 이벤트
    let hoveredFeature: Feature | null = null
    const handleHover = (event: MapBrowserEvent<MouseEvent>) => {
      const pixel = event.pixel
      const features: Feature[] = []

      // 해당 픽셀에 있는 모든 음식점 마커 수집
      map.forEachFeatureAtPixel(pixel, (feature, layer, geometry) => {
        if (feature instanceof Feature && feature.get('type') === 'restaurant') {
          features.push(feature)
        }
      })

      if (features.length > 1) {
        // 겹친 마커가 있을 때 툴팁 표시
        tooltip.textContent = `${features.length}개의 음식점이 겹쳤어요. 줌인해주세요 🥲`
        tooltip.style.display = 'block'
        tooltip.style.left = (event.originalEvent.clientX + 10) + 'px'
        tooltip.style.top = (event.originalEvent.clientY - 10) + 'px'
      } else {
        // 툴팁 숨기기
        tooltip.style.display = 'none'

        // 마커가 하나만 있을 때만 호버 이벤트 처리
        const foundFeature = features.length === 1 ? features[0] : null

        // 기존에 호버되어있었던 음식점 마커 복원
        if (hoveredFeature && hoveredFeature !== foundFeature) {
          const markerState = hoveredFeature.get('markerState')

          // 기존 호버되어있었던 음식점 마커 NORMAL_HOVERED -> NO
          if (markerState === MarkerState.NORMAL_HOVERED) {
            const isClicked = hoveredFeature === oldClickedMarkerFeature
            hoveredFeature.setStyle(new Style({ image: isClicked ? clicked : normal }))
            hoveredFeature.set('markerState', isClicked ? MarkerState.CLICKED : MarkerState.NORMAL)
          }

          else if (markerState === MarkerState.CLICKED_HOVERED) {
            hoveredFeature.setStyle(new Style({ image: clicked }))
            hoveredFeature.set('markerState', MarkerState.CLICKED)
          }
        }

        // 새로운 호버 마커 설정
        if (foundFeature) {
          const markerState = (foundFeature as Feature).get('markerState')

          if (markerState === MarkerState.NORMAL) {
            (foundFeature as Feature).setStyle(new Style({ image: normalHovered }));
            (foundFeature as Feature).set('markerState', MarkerState.NORMAL_HOVERED)
          }

          else if (markerState === MarkerState.CLICKED) {
            (foundFeature as Feature).setStyle(new Style({ image: clickedHovered }));
            (foundFeature as Feature).set('markerState', MarkerState.CLICKED_HOVERED)
          }
        }

        hoveredFeature = foundFeature
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
  }, [onClickRestaurantOverlay, oldClickedMarkerFeature])

  // 음식점 마커 겹침 방지
  const resolveMarkerOverlap = (features: Feature[]): void => {
    const adjustedPositions: { x: number, y: number }[] = []
    const offset = 0.00007 // 겹침 방지 오프셋 (경도/위도 단위)

    features.forEach(feature => {
      const geometry = feature.getGeometry()
      if (geometry instanceof Point) {
        const coord = geometry.getCoordinates()
        if (coord) {
          // Web Mercator를 경도/위도로 변환
          const [lon, lat] = toLonLat(coord)
          let y = lat
          let x = lon

          // 기존 조정된 위치들과 정확히 일치하는지 체크
          const isExactMatch = adjustedPositions.some(ap =>
            ap.x === x && ap.y === y
          )

          // 정확히 일치하면 옆으로 이동
          if (isExactMatch) {
            x += offset
            y += offset
          }

          // 조정된 위치로 마커 이동
          const newCoord = fromLonLat([x, y])
          geometry.setCoordinates(newCoord)

          // 조정된 위치 저장
          adjustedPositions.push({ x, y })
        }
      }
    })
  }

  return (
    <div className="vworld-map-container">
      <div ref={mapRef} className="rvm-vworld-map" />
    </div>
  )
}

export default VWorldMap