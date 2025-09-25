export default function QuestionAnswerCard({ question, options = [], selectedIndex = null, onSelect }) {
  return (
    <div className="w-full rounded-lg border overflow-hidden bg-white" style={{borderColor:'#D1D5DB'}}>
      <div className="px-4 py-3 text-white font-medium" style={{background:'linear-gradient(90deg,#3F3F46,#6B7280)'}}>
        {question}
      </div>
      <div className="p-4 space-y-3">
        {options.map((label, idx)=> (
          <button
            key={idx}
            type="button"
            onClick={()=> onSelect && onSelect(idx)}
            className={'w-full h-12 rounded-md border px-4 text-left bg-[#F3F4F6] transition-shadow '+(selectedIndex===idx?'ring-2 ring-[#7C3AED] bg-white':'')}
          >
            <span className={'mr-3 inline-flex items-center justify-center w-6 h-6 rounded-full text-white ' + 
              (selectedIndex===idx ? 'bg-[#4F0DCE]' : 'bg-[#6E6E6E]')}>{idx+1}</span>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}


