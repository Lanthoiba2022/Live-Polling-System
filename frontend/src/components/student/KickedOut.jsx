import BrandBadge from '../ui/BrandBadge'

export default function KickedOut() {
  return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="text-center px-6">
        <div className="flex justify-center mb-7">
          <BrandBadge />
        </div>
        <h1 className="kickTitle">You’ve been Kicked out !</h1>
        <p className="kickSub">Looks like the teacher had removed you from the poll system .Please<br/>Try again sometime.</p>
      </div>
    </div>
  )
}


