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
  get(key: 'restaurantId'): string;
  get(key: 'type'): string;
  get(key: 'markerState'): MarkerState;
}

enum MarkerState {
  NORMAL = 'normal',
  CLICKED = 'clicked',
  NORMAL_HOVERED = 'normal_hovered',
  CLICKED_HOVERED = 'clicked_hovered',
}

const VWorldMap: React.FC<VWorldMapProps> = ({
  restaurants, x, y, distance, clickedRestaurantId, onClickRestaurant
}) => {

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<OlMap | null>(null)
  const vectorSourceRef = useRef<VectorSource>(new VectorSource())
  const circleSourceRef = useRef<VectorSource>(new VectorSource())

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
    const circleFeature = new Feature({ geometry: new Circle(fromLonLat([x, y]), distance + 50) })
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
          restaurantId: r.rid,
          markerState: MarkerState.NORMAL,
        })

        const isClicked = clickedRestaurantId === r.rid
        const style = isClicked ? clickedIcon : normalIcon
        feature.setStyle(new Style({ image: style }))
        newFeatures.push(feature)
      })

    // 음식점 레이어 겹침 방지
    resolveMarkerOverlap(newFeatures)

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
      white-space: nowrap;
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

      // 음식점 오버레이가 하나만 있을 때만 클릭 이벤트 처리
      if (features.length === 1) {
        const restaurantFeature = features[0] as RestaurantFeature
        const restaurantId = restaurantFeature.get('restaurantId')

        // 클릭한 음식점 오버레이만 clicked 스타일로 변경
        map.getLayers().forEach(layer => {
          if (layer instanceof VectorLayer) {
            layer.getSource()?.getFeatures().forEach(feature => {
              if (feature instanceof Feature && feature.get('type') === 'restaurant') {
                if (feature.get('restaurantId') === restaurantId) {
                  feature.setStyle(new Style({ image: clickedIcon }))
                  onClickRestaurant(restaurantId)
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

      // 겹친 음식점 오버레이가 있을 때 툴팁 표시
      if (features.length > 1) {
        tooltip.textContent = `${features.length}개의 음식점이 겹쳤어요. 줌인해주세요 🥲`
        tooltip.style.display = 'block'
        tooltip.style.left = (event.originalEvent.clientX + 10) + 'px'
        tooltip.style.top = (event.originalEvent.clientY - 10) + 'px'
      }
      // 음식점 오버레이가 하나만 있을 때만 호버 이벤트 처리
      else {
        tooltip.style.display = 'none'
        const foundFeature = features[0]

        // 기존에 호버되어있었던 음식점 오버레이 복원
        if (hoveredFeature && hoveredFeature !== foundFeature) {
          const markerState = hoveredFeature.get('markerState')

          // 기존 호버되어있었던 음식점 마커 원상복구
          if (markerState === MarkerState.NORMAL_HOVERED) {
            hoveredFeature.setStyle(new Style({ image: normalIcon }))
            hoveredFeature.set('markerState', MarkerState.NORMAL)
          } else if (markerState === MarkerState.CLICKED_HOVERED) {
            hoveredFeature.setStyle(new Style({ image: clickedIcon }))
            hoveredFeature.set('markerState', MarkerState.CLICKED)
          }
        }

        // 새로운 오버레이 설정
        if (foundFeature) {
          const markerState = foundFeature.get('markerState')
          if (markerState === MarkerState.NORMAL) {
            foundFeature.setStyle(new Style({ image: normalHoveredIcon }));
            foundFeature.set('markerState', MarkerState.NORMAL_HOVERED)
          } else if (markerState === MarkerState.CLICKED) {
            foundFeature.setStyle(new Style({ image: clickedHoveredIcon }));
            foundFeature.set('markerState', MarkerState.CLICKED_HOVERED)
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
  }, [clickedRestaurantId])

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
    const foundFeature = features.find(f => f.get('restaurantId') === clickedRestaurantId)
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
    </div>
  )
}

export default VWorldMap