import './Introduction.css'
import CrawlingImage from '@/assets/ib-first.png'
import DataImage from '@/assets/data.png'

const Introduction = () => {
  return (
    <div className="intro-container scrollbar-custom">
      <div className="intro-bg">

        <div className="intro-header">

          <div className="ih-subtitle">
            <div className="ih-dialog">
              <div className="ih-left">
                <h1>김주임 님, 뭐 먹을까요?</h1>
                <h1>에이... 밥을 먹어야죠.</h1>
                <h1>그건 어제 먹었잖아요.</h1>
              </div>

              <div className="ih-right">
                <h1>파스타?</h1>
                <h1>설렁탕?</h1>
                <h1>☠️</h1>
              </div>

            </div>

            <p>직장인의 최대 고민, <strong>식사 메뉴 고르기!</strong></p>
            <p>매일 <strong>반복되는 고민</strong>, 김주임이 해결해드릴게요.</p>
          </div>
        </div>

      </div>

      <div className="intro-body">

        <div className="ib-first">
          <img src={CrawlingImage} alt="Crawling Image" className="ib-image" />
          <div className="ib-text">
            <div className="ib-text-header">
              <img src={DataImage} alt="data Image" className="ib-text-header-image" />
              <h3>데이터</h3>
            </div>
            <p>자체 개발한 크롤러로 <strong>전국 17개 행정구역</strong>, <br />약 <strong>83만 개</strong>의 음식점 데이터를 확보하고 있습니다.</p>
          </div>
        </div>

        <div className="ib-second">
          <h3>PC / Mobile 버전을 모두 지원합니다.</h3>
          <p>토너먼트 링크를 여러 디바이스에서 공유하며 사용하실 수 있습니다.</p>
          <p>(더 나은 경험을 위해 Mobile 버전에서는 크롬 브라우저 사용을 권장드립니다.)</p>
        </div>

        <div className="ib-third">
          건의사항 및 패치노트 기능을 제공합니다.
          버그, 도입되었으면 하는 새로운 기능들을 제안해주시면 적극 반영하겠습니다.
        </div>

      </div>

    </div >
  )
}

export default Introduction