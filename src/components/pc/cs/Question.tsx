import './Question.css'
import { useState } from 'react'
import upIcon from '@/assets/up.png'
import downIcon from '@/assets/down.png'
import { sendMailMessage } from '@/api/api'

const Question = () => {

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "서비스 이용은 무료인가요?",
      answer: "넵, 김주임 서비스는 무료입니다."
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
      question: "지도가 제대로 표시되지 않아요.",
      answer: "빠르게 줌 인/아웃할 경우 지도가 렌더링되지 않는 문제가 발생할 수 있습니다. 일시적인 현상이므로 페이지를 새로고침 해보세요. 문제가 지속되면 문의하기를 통해 상세 내용을 알려주세요."
    },
    {
      question: "음식점 데이터 판매도 하나요?",
      answer: "아뇨. 판매하지 않습니다. 크롤링으로 확보한 데이터는 상업적인 용도로 사용될 수 없습니다. 추가적으로, 김주임 서비스는 서버 안정화를 위해 크롤링 방지(블랙리스트) 로직이 적용되어 있습니다."
    },
    {
      question: "서비스 운영 비용은 어떻게 충당하나요?",
      answer: "저의 작고 소중한 월급으로 충당하고 있습니다."
    },
    {
      question: "수익도 없는데 왜 서비스를 운영하나요?",
      answer: "그야... 재미있기 때문입니다..."
    },
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
    <div className="question-container scrollbar-custom">
      <div className="question-content">

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
                  <option value="" disabled selected>문의 유형을 선택하세요</option>
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
  )
}

export default Question