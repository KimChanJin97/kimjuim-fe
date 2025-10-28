import './Question.css'
import { useState } from 'react'
import upIcon from '@/assets/up.png'
import downIcon from '@/assets/down.png'
import profileImage from '@/assets/profile.png'
import { sendMailMessage } from '@/api/api'
import ArrowLeftIcon from '@/assets/lt-arrow.png'

const Question = ({
  isQuestionOpen,
  onToggleQuestion,
}: {
  isQuestionOpen: boolean
  onToggleQuestion: () => void
}) => {

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "서비스 이용은 무료인가요?",
      answer: "넵, 김쥠님 서비스는 무료입니다."
    },
    {
      question: "음식점 업데이트가 필요해요.",
      answer: "음식점 크롤링 및 업데이트는 주기적으로 실행되며, 빠른 업데이트가 필요하신 경우 문의하기를 통해 알려주시면 확인 후 반영하겠습니다."
    },
    {
      question: "신규 음식점을 등록하고 싶어요.",
      answer: "문의하기를 통해 음식점 이름, 주소, 메뉴 등의 정보를 보내주시면 검토 후 등록하겠습니다."
    },
    {
      question: "지도가 보이지 않아요.",
      answer: "빠르게 줌 인/아웃할 경우 지도가 렌더링되지 않는 문제가 발생할 수 있습니다. 일시적인 현상이므로 페이지를 새로고침(로고 클릭) 해보세요. 문제가 지속되면 문의하기를 통해 상세 내용을 알려주세요."
    },
    {
      question: "하얀색 화면만 보여요.",
      answer: "김쥠님은 크롤링 방지를 위해 블랙리스트 로직이 구현되어 있습니다. 크롤링을 시도하지 않았지만 하얀색 화면만 보인다면 문의하기를 통해 이메일을 보내주시기 바랍니다."
    },
    {
      question: "서비스 운영 비용은 어떻게 충당하나요?",
      answer: "작고 소중한 월급으로 충당하고 있습니다. 후원 문의는 kimchanjin.dev@gmail.com 연락주세요. :)"
    }
  ]

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: '',
    title: '',
    content: '',
    agreement: false,
    file: null as File | null
  })

  // 에러 상태 추가
  const [errors, setErrors] = useState({
    name: false,
    email: false,
    type: false,
    title: false,
    content: false,
    agreement: false
  })

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  const handleSubmit = () => {
    const { name, email, type, title, content, agreement, file } = formData

    // 에러 체크
    const newErrors = {
      name: !name,
      email: !email,
      type: !type,
      title: !title,
      content: !content,
      agreement: !agreement
    }

    setErrors(newErrors)

    // 에러가 있으면 제출하지 않음
    if (Object.values(newErrors).some(error => error)) {
      // 1초 후 에러 상태 제거
      setTimeout(() => {
        setErrors({
          name: false,
          email: false,
          type: false,
          title: false,
          content: false,
          agreement: false
        })
      }, 500)
      return
    }

    // 제출
    sendMailMessage(name, email, type, title, content, agreement, file || new File([], ''))
  }


  return (
    <>
      <div className={`question-container scrollbar-custom ${isQuestionOpen ? 'open' : 'closed'}`}>

        <button
          className="question-toggle-btn"
          onClick={() => onToggleQuestion()}
          aria-label={isQuestionOpen ? "문의하기 닫기" : "문의하기 열기"}
        >
          <span className={`toggle-arrow ${isQuestionOpen ? 'open' : ''}`}>
            <img src={ArrowLeftIcon} alt="arrow-left" width={12} height={12} />
          </span>
        </button>

        <div className="question-container-center">

          {/* 프로필 섹션 */}
          <div className="profile-section">
            <div className="profile-header">
              <h3>양해의 말씀</h3>
            </div>
            <div className="profile-body">
              <div className="profile-image-col">
                <div className="profile-image-row">
                  <div className="profile-image">
                    <img src={profileImage} width={80}></img>
                  </div>
                  <div className="profile-text">
                    <p>IT본부 / 주임</p>
                    <h3>김&nbsp;&nbsp;찬&nbsp;&nbsp;진
                      &nbsp;&nbsp;<span className="splitter">|</span>&nbsp;&nbsp;
                      개&nbsp;&nbsp;발&nbsp;&nbsp;자
                    </h3>
                    <p>경기도 성남시 분당구</p>
                    <p>kimjuim.dev@gmail.com</p>
                  </div>
                </div>
                <div className="profile-image-info">
                  <ul>
                    <li>김쥠님은 퇴근 이후와 주말 동안에만 개발되고 있습니다.</li>
                    <li>기획, 디자인, 개발을 혼자 수행하기 때문에 CS와 버그 패치가 다소 늦어질 수 있다는 점 양해해주시면 감사드리겠습니다.</li>
                    <li>빠르고 안정적인 서비스를 제공하기 위해 최선을 다하겠습니다.</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>

          {/* 문의하기 섹션 */}
          <div className="question-section">
            <div className="question-header">
              <h3>문의하기</h3>
            </div>

            <div className="question-body">
              <div className="qb-form">

                <div className="qbf-required">
                  <span>* 필수 입력 항목</span>
                </div>

                <div className="qbf-name">
                  <h4 className="qbf-key">이름 *</h4>
                  <input
                    type="text"
                    placeholder="이름을 작성해주세요."
                    className={errors.name ? 'error' : ''}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="qbf-email">
                  <h4 className="qbf-key">이메일 *</h4>
                  <input
                    type="email"
                    placeholder="이메일을 작성해주세요."
                    className={errors.email ? 'error' : ''}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="qbf-type">
                  <h4 className="qbf-key">문의 유형 *</h4>
                  <select
                    className={errors.type ? 'error' : ''}
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="" disabled>문의 유형을 선택하세요</option>
                    <option value="버그 신고">버그 신고</option>
                    <option value="신기능 건의">신기능 건의</option>
                    <option value="음식점 신규 등록">음식점 신규 등록</option>
                    <option value="기타">기타</option>
                  </select>
                </div>

                <div className="qbf-title">
                  <h4 className="qbf-key">제목 *</h4>
                  <input
                    type="text"
                    placeholder="제목을 작성해주세요."
                    className={errors.title ? 'error' : ''}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="qbf-content">
                  <h4 className="qbf-key">내용 *</h4>
                  <textarea
                    placeholder="내용을 작성해주세요."
                    className={errors.content ? 'error' : ''}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </div>

                <div className="qbf-file">
                  <h4 className="qbf-key">첨부 파일</h4>
                  <input
                    type="file"
                    onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                  />
                </div>

                <div className="qbf-agreement">
                  <div className="qbfa-row">
                    <input
                      type="checkbox"
                      className={errors.agreement ? 'error' : ''}
                      checked={formData.agreement}
                      onChange={(e) => setFormData({ ...formData, agreement: e.target.checked })}
                    />
                    <h4 className="qbf-key-no-margin">개인정보 수집 및 이용 동의</h4>
                  </div>

                  <ul>
                    <li>수집 항목: 이름, 이메일</li>
                    <li>수집 목적: 의사소통 채널 확보 및 문의 사항 처리</li>
                    <li>보유 기간: 문의 처리 완료시까지</li>
                  </ul>
                </div>

                <div className="qbf-submit">
                  <button onClick={handleSubmit}>제출</button>
                </div>
              </div>
            </div>
          </div>




          {/* FAQ 섹션 */}
          <div className="faq-section">
            <div className="faq-header">
              <h3>자주 묻는 질문</h3>
            </div>

            <div className="faq-body">
              <div className="qb-faq-list">
                {faqs.map((faq, index) => (
                  <div key={index} className="qb-faq-item">
                    <button
                      className="qb-faq-question"
                      onClick={() => toggleFaq(index)}
                    >
                      <span>{faq.question}</span>
                      <img
                        src={openFaqIndex === index ? upIcon : downIcon}
                        alt={openFaqIndex === index ? '접기' : '펼치기'}
                        className="qb-faq-icon"
                      />
                    </button>
                    <div className={`qb-faq-answer ${openFaqIndex === index ? 'open' : ''}`}>
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {isQuestionOpen && <div className="question-overlay" onClick={() => onToggleQuestion()}></div>}
    </>
  )
}

export default Question