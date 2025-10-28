import './Introduction.css'
import TournamentImage from '@/assets/tournament.png'
import ShareImage from '@/assets/share.png'
import SearchImage from '@/assets/search.png'
import DataImage from '@/assets/data.png'
import PcMobileImage from '@/assets/pc-mobile.png'
import PatchnoteImage from '@/assets/patchnote.png'
import ArrowLeftIcon from '@/assets/lt-arrow.png'

const Introduction = ({
  isIntroOpen,
  onToggleIntro,
}: {
  isIntroOpen: boolean
  onToggleIntro: () => void
}) => {
  return (
    <>
      <div className={`intro-container scrollbar-custom ${isIntroOpen ? 'open' : 'closed'}`}>

        <button
          className="intro-toggle-btn"
          onClick={() => onToggleIntro()}
          aria-label={isIntroOpen ? "상세정보 닫기" : "상세정보 열기"}
        >
          <span className={`toggle-arrow ${isIntroOpen ? 'open' : ''}`}>
            <img src={ArrowLeftIcon} alt="arrow-left" width={12} height={12} />
          </span>
        </button>

        <div className="intro-bg">
          <div className="intro-text">
            <h1>김쥠님, 메뉴 좀 골라주세요. 고기 드시죠? 점심부터 고기는 좀; 그럼 면 드실래요? 밥을 먹어야죠; 설렁탕 어때요? 설렁탕은 어제 먹었잖아요; 그럼 피자? 밀가루잖아요; 그럼 죽? 죽 쑬 일 있어요? 그럼 순두부 어때요? 입 데일 일 있어요? 좀 깔끔하고 담백한 메뉴 없을까요?</h1>
          </div>
          <div className="intro-main-text">
            <h2>직장인 최대 고민, 메뉴 고르기</h2>
            <h2>김쥠님이 해결해드립니다.</h2>
          </div>
        </div>

        <div className="intro-body">

          <div className="ib-first">
            <div className="ib-text-header">
              <img src={TournamentImage} width={30} alt="data Image" className="ib-text-header-image" />
              <h3>메뉴 월드컵</h3>
            </div>
            <p><strong>카테고리</strong> 또는 <strong>개별 음식점</strong>을 제거하여 <strong>메뉴 후보군</strong>을 빠르고 간편하게 추릴 수 있습니다.</p>
          </div>

          <div className="ib-second">
            <div className="ib-text-header">
              <img src={ShareImage} width={30} alt="data Image" className="ib-text-header-image" />
              <h3>공유 기능</h3>
            </div>
            <p><strong>메뉴 월드컵 링크</strong>를 <strong>공유</strong>하여 회사 동료, 친구, 가족들과 함께 즐길 수 있습니다. 메뉴 후보군은 <strong>공유자</strong> 기준으로 고정됩니다.</p>
          </div>

          <div className="ib-third">
            <div className="ib-text-header">
              <img src={SearchImage} width={30} alt="data Image" className="ib-text-header-image" />
              <h3>검색</h3>
            </div>
            <p><strong>지역, 음식점, 메뉴</strong>를 검색하여 연관도가 높은 음식점들을 찾아볼 수 있습니다. </p>
          </div>

          <div className="ib-fourth">
            <div className="ib-text-header">
              <img src={DataImage} width={30} alt="data Image" className="ib-text-header-image" />
              <h3>데이터</h3>
            </div>
            <p>자체 개발 크롤러로 <strong>전국 약 83만 개</strong>의 음식점 데이터를 확보하고 있습니다. <strong>베타 버전</strong>에서는 <strong>서울/경기</strong> 지역에 대해서만 서비스됩니다.</p>
          </div>

          <div className="ib-fifth">
            <div className="ib-text-header">
              <img src={PcMobileImage} width={30} alt="data Image" className="ib-text-header-image" />
              <h3>PC / Mobile 지원</h3>
            </div>
            <p>PC / Mobile 버전을 모두 지원합니다. <strong>디바이스 종류</strong>와 관계없이 서비스를 이용하실 수 있습니다.</p>
          </div>

          <div className="ib-sixth">
            <div className="ib-text-header">
              <img src={PatchnoteImage} width={30} alt="data Image" className="ib-text-header-image" />
              <h3>문의하기 & 패치노트</h3>
            </div>
            <p><strong>문의하기</strong>를 통해 버그를 신고하거나, 신기능을 건의할 수 있습니다. 실제 반영이 이뤄진 건에 대해서는 <strong>패치노트</strong>에 공지됩니다.</p>
          </div>

        </div>

      </div >

      {isIntroOpen && <div className="intro-overlay" onClick={() => onToggleIntro()}></div>}
    </>
  )
}

export default Introduction