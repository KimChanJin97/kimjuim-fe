import { useState, useRef, useEffect } from 'react'
import './RestaurantSearch.css'
import { CloseIcon } from '@/assets/CloseIcon'
import { useTooltip } from '@/hooks/useTooltip'
import Tooltip from '../common/Tooltip'
import { getRestaurantAutocomplete, RestaurantAutocompleteResponse } from '@/api/api'
import magnifierIcon from '@/assets/magnifier.png'

interface RestaurantSearchProps {
  onSearchRestaurants: (keyword: string) => void
  onResetSearchRestaurants: () => void
}

const RestaurantSearch: React.FC<RestaurantSearchProps> = ({
  onSearchRestaurants,
  onResetSearchRestaurants,
}) => {
  const [keyword, setKeyword] = useState<string>('')
  const [suggestions, setSuggestions] = useState<RestaurantAutocompleteResponse[]>([])
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false)
  const [isComposing, setIsComposing] = useState<boolean>(false)
  const { tooltip, showTooltip, hideTooltip } = useTooltip()
  const inputRef = useRef<HTMLInputElement>(null)

  // 자동완성 추천을 가져오는 함수
  useEffect(() => {
    if (!keyword.trim()) {
      setSuggestions([])
      return
    }

    // debounce 효과
    const timer = setTimeout(async () => {
      try {
        const response = await getRestaurantAutocomplete(keyword)

        // 현재 입력값과 다른 것들만 필터링
        const filteredSuggestions = response.filter(
          item => item.name.toLowerCase() !== keyword.toLowerCase()
        )

        setSuggestions(filteredSuggestions)
      } catch (error) {
        console.error('자동완성 요청 실패:', error)
        setSuggestions([])
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [keyword])

  const onSearch = () => {
    if (keyword.trim()) {
      onSearchRestaurants(keyword.trim())
      setIsSearchActive(true)
      setSuggestions([])
    }
  }

  const onReset = () => {
    setKeyword('')
    setSuggestions([])
    setIsSearchActive(false)
    setIsComposing(false)
    onResetSearchRestaurants()
  }

  // 자동완성 적용 함수
  const applySuggestion = (suggestionText: string) => {
    // 조합 중에는 적용 불가
    if (isComposing) {
      return
    }

    if (suggestionText && inputRef.current) {
      // IME 버퍼를 먼저 비우기
      inputRef.current.blur()

      // 다음 프레임에서 검색 실행
      requestAnimationFrame(() => {
        onSearchRestaurants(suggestionText.trim())
        setIsSearchActive(true)
        setKeyword(suggestionText)
        setSuggestions([])
      })
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 조합 중일 때는 자동완성 적용 방지
    if (isComposing) {
      if (e.key === 'Enter') {
        return // Enter도 조합 완료 후 처리
      }
      return
    }

    if (e.key === 'Enter') {
      onSearch()
    }
  }

  // 한글 조합 시작
  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  // 한글 조합 종료
  const handleCompositionEnd = () => {
    setIsComposing(false)
  }

  return (
    <>
      <div className="restaurant-search-container">
        <div className="rs-input-wrapper">
          <div className="rs-input-container">
            {/* 실제 입력 필드 */}
            <input
              ref={inputRef}
              type="text"
              className="rs-input"
              placeholder="주소, 음식점명, 메뉴명을 검색해보세요!"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={onKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              autoComplete="off"
              name="restaurant-search"
              id="restaurant-search-input"
            />
            <button className="rs-search-btn" onClick={onSearch}>
              <img src={magnifierIcon} alt="검색" width={20} height={20} />
            </button>
          </div>
        </div>
        {isSearchActive && (
          <button
            className="rs-reset-btn"
            onClick={() => {
              hideTooltip()  // 툴팁 먼저 숨기기
              onReset()
            }}
            onMouseMove={(e) => showTooltip(e, '현재 위치로 초기화')}
            onMouseLeave={hideTooltip}
          >
            <CloseIcon
              className="close-icon"
              width={22}
              height={22}
            />
          </button>
        )}
      </div>

      {/* 자동완성 제안들을 grid로 표시 */}
      {suggestions.length > 0 && keyword && (
        <div className="rs-suggestion-wrapper">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="rs-suggestion-chip"
              onClick={() => {
                hideTooltip()
                applySuggestion(suggestion.name)
              }}
              onMouseEnter={(e) => showTooltip(e, '클릭하여 검색')}
              onMouseLeave={hideTooltip}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="rs-arrow-icon">
                <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="rs-suggestion-name">{suggestion.name}</span>
              <span className="rs-suggestion-category">{suggestion.category}</span>
            </div>
          ))}
        </div>
      )}

      {/* 툴팁 */}
      <Tooltip
        visible={tooltip.visible}
        x={tooltip.x}
        y={tooltip.y}
        text={tooltip.text}
      />
    </>
  )
}

export default RestaurantSearch