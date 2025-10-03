import { useState } from 'react'
import './RestaurantDetail.css'
import { RestaurantDetailResponse, MenuResponse, ReviewResponse } from '@/api/api'
import { CloseIcon } from '@/assets/CloseIcon.tsx'
import MenuIcon from '@/assets/menu.png'
import PriceIcon from '@/assets/price.png'
import DescriptionIcon from '@/assets/description.png'
import NoImageIcon from '@/assets/no-image.png'
import CryingFaceIcon from '@/assets/crying-face.png'
import ImageSkeleton from './ImageSkeleton'
import Tooltip from './Tooltip'
import { useTooltip } from '../hooks/useTooltip'

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
  restaurantDetail: RestaurantDetailResponse
  onCloseRestaurantDetail: () => void
}

const RestaurantDetail: React.FC<RestaurantDetailProps> = ({
  restaurantDetail,
  onCloseRestaurantDetail,
}) => {
  const [activeTab, setActiveTab] = useState(0)
  const { tooltip, showTooltip, hideTooltip } = useTooltip()

  const onClickTab = (index: number) => {
    setActiveTab(index)
  }

  const hasInfo = (info: string) => {
    return info !== NO_INFO && info !== '' && info !== null && info !== undefined
  }

  return (
    <>
      <div className="restaurant-detail-container">

        <div className="rd-header">

          <div className="rd-title">상세정보</div>

          <button className="close-btn" onClick={() => onCloseRestaurantDetail()}>
            <CloseIcon
              className="close-icon"
              width={22}
              height={22}
            />
          </button>
        </div>

        <div className="rd-body">

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
          {activeTab === 0 && restaurantDetail.menus.length > 0 && (
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
                        width={140}
                        height={140}
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
                        width={140}
                        height={140}
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

          {activeTab === 0 && restaurantDetail.menus.length === 0 && (
            <div className="no-item-wrap">
              <div className="no-menu-text">메뉴가 없어요</div>
              <img className="crying-face-icon" src={CryingFaceIcon} alt="crying-face" />
            </div>
          )}

          {/* 리뷰 탭 */}
          {activeTab === 1 && restaurantDetail.reviews.length > 0 && (
            <div className="rd-reviews scrollbar-custom">
              {restaurantDetail.reviews.map((review) => (
                <a href={review.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={review.id}
                  onMouseMove={(e) => showTooltip(e, '리뷰 새창으로 열기')}
                  onMouseLeave={hideTooltip}
                >
                  <div className="rdv">
                    {/* 리뷰 프로필 이미지, 작성자 이름, 작성일 */}
                    <div className="rdv-row">
                      <img src={review.profileUrl} alt={review.authorName} />
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

          {activeTab === 1 && restaurantDetail.reviews.length === 0 && (
            <div className="no-item-wrap">
              <div className="no-review-text">리뷰가 없어요</div>
              <img className="crying-face-icon" src={CryingFaceIcon} alt="crying-face" />
            </div>
          )}

        </div>
      </div >

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

export default RestaurantDetail