import { useState, useRef, useEffect } from 'react'
import './RestaurantSearch.css'
import { CloseIcon } from '@/assets/CloseIcon'
import { getRestaurantAutocomplete, RestaurantAutocompleteResponse } from '@/api/api'

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

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isComposing) {
      e.preventDefault()
      onSearch()
    }
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

  // 한글 조합 시작
  const onCompositionStart = () => {
    setIsComposing(true)
  }

  // 한글 조합 종료
  const onCompositionEnd = () => {
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
              onCompositionStart={onCompositionStart}
              onCompositionEnd={onCompositionEnd}
              onKeyDown={onKeyDown}
              enterKeyHint="search"
              autoComplete="off"
              name="restaurant-search"
              id="restaurant-search-input"
            />
          </div>
        </div>
        {isSearchActive && (
          <button
            className="rs-reset-btn"
            onClick={onReset}
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
              onClick={() => applySuggestion(suggestion.name)}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="rs-arrow-icon">
                <path d="M3 1L7 5L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="rs-suggestion-name">{suggestion.name}</span>
              <span className="rs-suggestion-category">{suggestion.category}</span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default RestaurantSearch