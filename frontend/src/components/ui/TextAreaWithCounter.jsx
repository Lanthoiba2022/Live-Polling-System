import { useState, useEffect } from 'react'

export default function TextAreaWithCounter({ value, onChange, max = 100, placeholder='' }) {
  const [text, setText] = useState(value || '')
  useEffect(()=>{ setText(value || '') }, [value])
  const handle = (e) => {
    const v = e.target.value.slice(0, max)
    setText(v)
    onChange && onChange(v)
  }
  return (
    <div className="relative">
      <textarea
        value={text}
        onChange={handle}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-md border border-gray-200 bg-[#f2f2f2] p-4 resize-none focus:outline-none"
      />
      <div className="absolute bottom-2 right-3 text-sm text-gray-500">{text.length}/{max}</div>
    </div>
  )
}


