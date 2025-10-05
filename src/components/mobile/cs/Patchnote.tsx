import { useState } from 'react'
import './Patchnote.css'

interface Patchnote {
  id: number
  title: string
  content: string
}

const Patchnote = () => {
  const [patchnotes] = useState<Patchnote[]>([
    { id: 1, title: '1.0.1 업데이트', content: '버그 수정' },
    { id: 2, title: '1.0.2 업데이트', content: 'UI 개선' },
  ])

  return (
    <div className="patchnote-container">
      <h2>📢 패치노트</h2>
      <ul>
        {patchnotes.map((note) => (
          <li key={note.id}>
            <strong>{note.title}</strong> - {note.content}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Patchnote