import { useState } from 'react'
import './Patchnote.css'

interface Patchnote {
  id: number
  createdAt: string
  version: string
  content: string
}

const Patchnote = () => {
  const [patchnotes] = useState<Patchnote[]>([
    { id: 1, createdAt: '2025-12-25', version: '1.0.0', content: '안녕하세요. 김주임입니다. 잘 부탁드립니다.' },
    { id: 2, createdAt: '2025-12-26', version: '1.0.1', content: '검색 기능을 추가했습니다.' },
    { id: 3, createdAt: '2026-01-01', version: '1.0.2', content: '식당이 업데이트되었습니다.' },
  ])

  return (
    <div className="patchnote-container scrollbar-custom">

      <div className="patchnote-header">
        <h3>패치노트</h3>
      </div>

      <div className="patchnote-body">
        <ul className="pb-list">
          {patchnotes.slice().reverse().map((note) => (
            <li key={note.id} className="pb-item">
              <strong className="pb-item-title">김주임 {note.version} 업데이트 안내</strong>
              <p className="pb-item-created-at">{note.createdAt}</p>
              <p className="pb-item-content">{note.content}</p>
            </li>
          ))}
        </ul>
      </div>

    </div>
  )
}

export default Patchnote