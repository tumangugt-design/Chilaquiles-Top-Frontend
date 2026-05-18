
const MildFlameIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="inline-block w-4 h-4 ml-1 mb-0.5"
  >
    <defs>
      <linearGradient id="half-flame-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="50%" stopColor="#F97316" />
        <stop offset="50%" stopColor="currentColor" stopOpacity="0.2" />
      </linearGradient>
    </defs>
    <path
      d="M12 2C12 2 13.5 6.5 16.5 8.5C19.5 10.5 21 14 21 17C21 20 18.5 22.5 15.5 22.5C12.5 22.5 11 20.5 11 20.5C11 20.5 11 22.5 8.5 22.5C6 22.5 3 20 3 17C3 13.5 5 11.5 7.5 9.5C10 7.5 12 2 12 2Z"
      fill="url(#half-flame-gradient)"
      stroke="none"
    />
  </svg>
)

const getUnavailableTone = (availabilityStatus) => {
  if (availabilityStatus === 'inactive') {
    return {
      card: 'border-slate-300 bg-slate-100/80 opacity-70 grayscale cursor-not-allowed',
      badge: 'bg-slate-600 text-white',
      text: 'text-slate-500',
      image: 'bg-slate-100',
      label: 'Desactivado',
    }
  }

  if (availabilityStatus === 'insufficient') {
    return {
      card: 'border-red-400 bg-red-50/90 cursor-not-allowed shadow-red-100',
      badge: 'bg-red-600 text-white',
      text: 'text-red-700',
      image: 'bg-red-50',
      label: 'Stock insuficiente',
    }
  }

  return null
}

const OptionCard = ({
  title,
  description,
  selected,
  onClick,
  price,
  image,
  illustration,
  badge,
  spicyLevel,
  multiSelect = false,
  disabled = false,
  availabilityStatus = 'available',
  availabilityLabel,
  availabilityDetail,
}) => {
  const isUnavailable = disabled || availabilityStatus === 'inactive' || availabilityStatus === 'insufficient'
  const unavailableTone = getUnavailableTone(availabilityStatus)
  const canSelect = !isUnavailable

  const handleClick = () => {
    if (!canSelect) return
    onClick?.()
  }

  return (
    <div
      onClick={handleClick}
      aria-disabled={isUnavailable}
      className={`
        relative group transition-all duration-300 ease-out
        rounded-2xl border-2 overflow-hidden bg-ui-card
        ${canSelect ? 'cursor-pointer' : 'cursor-not-allowed'}
        ${
          unavailableTone
            ? unavailableTone.card
            : selected
              ? 'border-brand-blue ring-2 sm:ring-4 ring-brand-blue/10 transform scale-[1.02] shadow-xl'
              : 'border-transparent shadow-sm hover:shadow-md hover:border-ui-border'
        }
      `}
    >
      <div
        className={`
          absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-md
          ${
            selected && canSelect
              ? 'bg-brand-blue text-white scale-100'
              : unavailableTone
                ? 'bg-white/90 text-transparent border border-current/20'
                : 'bg-ui-card/90 text-transparent border border-ui-border group-hover:border-ui-muted'
          }
        `}
      >
        <svg className="w-3 h-3 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {(availabilityLabel || unavailableTone?.label || badge) && (
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 max-w-[calc(100%-4.5rem)]">
          <span className={`${unavailableTone ? unavailableTone.badge : 'bg-brand-orange text-white'} text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full uppercase tracking-wider shadow-sm line-clamp-1`}>
            {availabilityLabel || unavailableTone?.label || badge}
          </span>
        </div>
      )}

      <div className={`relative w-full overflow-hidden ${unavailableTone ? unavailableTone.image : 'bg-ui-bg'} ${illustration ? 'h-36 sm:h-52 p-4 sm:p-6' : 'h-36 sm:h-48'}`}>
        {illustration ? (
          <div className={`w-full h-full transition-transform duration-500 ${selected && canSelect ? 'scale-105' : canSelect ? 'scale-100 group-hover:scale-105' : 'scale-100 opacity-75'}`}>
            {illustration}
          </div>
        ) : image ? (
          <>
            <img
              src={image}
              alt={title}
              className={`w-full h-full object-cover transition-transform duration-700 ${selected || !canSelect ? '' : 'group-hover:scale-110'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </>
        ) : null}
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex justify-between items-start mb-1 sm:mb-2 gap-3">
          <h3 className={`font-black text-base sm:text-lg leading-tight ${unavailableTone ? unavailableTone.text : selected ? 'text-brand-blue' : 'text-ui-text'}`}>
            {title}
          </h3>
          {price && (
            <span className="shrink-0 font-black text-base sm:text-lg text-brand-blue">{price}</span>
          )}
        </div>

        {description && (
          <p className={`text-[11px] sm:text-sm leading-relaxed font-bold line-clamp-2 sm:line-clamp-none ${unavailableTone ? unavailableTone.text : 'text-ui-muted'}`}>
            {description}
            {spicyLevel === 'MILD' && <MildFlameIcon />}
          </p>
        )}

        {availabilityDetail && (
          <p className={`mt-2 text-[10px] sm:text-xs font-black uppercase tracking-wide ${unavailableTone ? unavailableTone.text : 'text-ui-muted'}`}>
            {availabilityDetail}
          </p>
        )}
      </div>

      {selected && canSelect && <div className="absolute bottom-0 left-0 right-0 h-1 sm:h-1.5 bg-brand-blue" />}
    </div>
  )
}

export default OptionCard;
