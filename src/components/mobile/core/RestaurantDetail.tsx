import { useEffect, useRef, useState } from 'react'
import './RestaurantDetail.css'
import { RestaurantDetailResponse } from '@/api/api'
import MenuIcon from '@/assets/menu.png'
import PriceIcon from '@/assets/price.png'
import DescriptionIcon from '@/assets/description.png'
import NoImageIcon from '@/assets/no-image.png'
import CryingFaceIcon from '@/assets/crying-face.png'
import ImageSkeleton from '../common/ImageSkeleton'
import NoProfileIcon from '@/assets/no-profile.png'

const NO_INFO = '정보없음'
const tabs = [
  {
    index: 0,
    name: '메뉴',
  },
  {
    index: 1,
    name: '리뷰',
  },
]

interface RestaurantDetailProps {
  restaurantDetail: RestaurantDetailResponse | null
  onToggleDetail: () => void
  isDetailOpen: boolean
  clickedRestaurantId: string
  restaurantName: string
}

const RestaurantDetail: React.FC<RestaurantDetailProps> = ({
  restaurantDetail,
  onToggleDetail,
  isDetailOpen,
  clickedRestaurantId,
  restaurantName
}) => {
  const [activeTab, setActiveTab] = useState(0)
  const [imageSize, setImageSize] = useState(140)
  const rdBodyRef = useRef<HTMLDivElement>(null)

  const onClickTab = (index: number) => {
    setActiveTab(index)
  }

  const hasInfo = (info: string) => {
    return info !== NO_INFO && info !== '' && info !== null && info !== undefined
  }

  useEffect(() => {
    if (rdBodyRef.current && isDetailOpen) {
      const bodyWidth = rdBodyRef.current.offsetWidth
      // rd-menus의 패딩(좌우 60px), 컬럼 갭(15px)을 고려
      const availableWidth = bodyWidth - 60 - 15
      const size = Math.floor(availableWidth / 2)
      setImageSize(size)
    }
  }, [isDetailOpen])

  return (
    <>
      <div className={`restaurant-detail-container ${isDetailOpen ? 'open' : 'closed'}`}>

        <button
          className="detail-toggle-btn"
          onClick={() => onToggleDetail()}
          aria-label={isDetailOpen ? "상세정보 닫기" : "상세정보 열기"}
        >
          <span className="toggle-text">
            {isDetailOpen ? '상세닫기' : '상세열기'}
          </span>
        </button>

        <div className="rd-header">
          {restaurantName && (
            <div className="rd-title">{restaurantName}</div>
          )}
          {!restaurantName && (
            <div className="rd-title">음식점 상세정보</div>
          )}
        </div>

        <div className="rd-body" ref={rdBodyRef}>

          <div className="tabs">
            {tabs.map((tab) => (
              <div
                className={`tab ${activeTab === tab.index ? 'active' : ''}`}
                key={tab.index}
                onClick={() => onClickTab(tab.index)}
              >
                <div className="tab-name">{tab.name}</div>
              </div>
            ))}
          </div>

          {/* 메뉴 탭 */}
          {activeTab === 0 && restaurantDetail && restaurantDetail.menus.length > 0 && (
            <div className="rd-menus scrollbar-custom">
              {restaurantDetail.menus.map((menu) => (

                <div className="rdm" key={menu.id}>
                  {/* 메뉴 이미지 */}
                  {menu.menuImages.length > 0 ? (
                    <div className="rdm-image-wrap">
                      {menu.isRecommended && (
                        <div className="rdm-badge">추천</div>
                      )}
                      <ImageSkeleton
                        src={menu.menuImages[0].url || NoImageIcon}
                        alt={menu.name}
                        width={imageSize}
                        height={imageSize}
                        borderRadius="8px"
                      />
                    </div>
                  ) : (
                    <div className="rdm-image-wrap">
                      {menu.isRecommended && (
                        <div className="rdm-badge">추천</div>
                      )}
                      <ImageSkeleton
                        src={NoImageIcon}
                        alt="이미지 없음"
                        width={imageSize}
                        height={imageSize}
                        borderRadius="8px"
                      />
                    </div>
                  )}
                  {/* 메뉴 이름 */}
                  {hasInfo(menu.name) && (
                    <div className="rdm-row">
                      <img src={MenuIcon} alt="menu" />
                      <div className="rdm-name">{menu.name}</div>
                    </div>
                  )}
                  {/* 메뉴 가격 */}
                  {hasInfo(menu.price) && (
                    <div className="rdm-row">
                      <img src={PriceIcon} alt="price" />
                      <div className="rdm-price">{menu.price}</div>
                    </div>
                  )}
                  {/* 메뉴 설명 */}
                  {hasInfo(menu.description) && (
                    <div className="rdm-row">
                      <img src={DescriptionIcon} alt="description" />
                      <div className="rdm-description">{menu.description}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 0 && !restaurantDetail && !clickedRestaurantId && (
            <div className="no-item-wrap">
              <img className="crying-face-icon" src={CryingFaceIcon} alt="crying-face" />
              <div className="no-menu-text">음식점을 선택해주세요</div>
            </div>
          )}

          {activeTab === 0 && restaurantDetail && clickedRestaurantId && restaurantDetail.menus.length === 0 && (
            <div className="no-item-wrap">
              <img className="crying-face-icon" src={CryingFaceIcon} alt="crying-face" />
              <div className="no-menu-text">메뉴가 없어요</div>
            </div>
          )}

          {/* 리뷰 탭 */}
          {activeTab === 1 && restaurantDetail && restaurantDetail.reviews.length > 0 && (
            <div className="rd-reviews scrollbar-custom">
              {restaurantDetail.reviews.map((review) => (
                <a href={review.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={review.id}
                >
                  <div className="rdv">
                    {/* 리뷰 프로필 이미지, 작성자 이름, 작성일 */}
                    <div className="rdv-row">
                      {/* <img src={review.profileUrl} alt={review.authorName} /> */}
                      <img src={NoProfileIcon} alt={review.authorName} />
                      <div className="rdv-author-name">{review.authorName}</div>
                      <div className="rdv-created-at">{review.createdAt}</div>
                    </div>
                    {/* 리뷰 제목 */}
                    <div className="rdv-title">{review.title}</div>
                    {/* 리뷰 내용 */}
                    <div className="rdv-content">{review.content}</div>
                  </div>
                </a>
              ))}
            </div>
          )}

          {activeTab === 1 && !restaurantDetail && !clickedRestaurantId && (
            <div className="no-item-wrap">
              <img className="crying-face-icon" src={CryingFaceIcon} alt="crying-face" />
              <div className="no-menu-text">음식점을 선택해주세요</div>
            </div>
          )}

          {activeTab === 1 && restaurantDetail && clickedRestaurantId && restaurantDetail.reviews.length === 0 && (
            <div className="no-item-wrap">
              <img className="crying-face-icon" src={CryingFaceIcon} alt="crying-face" />
              <div className="no-review-text">리뷰가 없어요</div>
            </div>
          )}

        </div>
      </div >

      {isDetailOpen && <div className="restaurant-detail-overlay" onClick={() => onToggleDetail()}></div>}
    </>
  )
}

export default RestaurantDetail