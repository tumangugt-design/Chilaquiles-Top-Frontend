// ============================================
// COMPONENTE: OptionCard
// Tarjeta seleccionable para elegir opciones del menú
// ============================================

const MildFlameIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="inline-block w-4 h-4 ml-1 mb-0.5"
  >
    <defs>
      <linearGradient id="half-flame-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="50%" stopColor="#F97316" />
        <stop offset="50%" stopColor="#CBD5E1" />
      </linearGradient>
    </defs>
    <path
      d="M12 2C12 2 13.5 6.5 16.5 8.5C19.5 10.5 21 14 21 17C21 20 18.5 22.5 15.5 22.5C12.5 22.5 11 20.5 11 20.5C11 20.5 11 22.5 8.5 22.5C6 22.5 3 20 3 17C3 13.5 5 11.5 7.5 9.5C10 7.5 12 2 12 2Z"
      fill="url(#half-flame-gradient)"
      stroke="none"
    />
  </svg>
)

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
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative group cursor-pointer transition-all duration-300 ease-out
        rounded-2xl border-2 overflow-hidden bg-white
        ${
          selected
            ? 'border-brand-blue ring-2 sm:ring-4 ring-blue-50 transform scale-[1.02] shadow-xl'
            : 'border-transparent shadow-sm hover:shadow-md hover:border-gray-200'
        }
      `}
    >
      {/* Selection Check Circle */}
      <div
        className={`
          absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-md
          ${
            selected
              ? 'bg-brand-blue text-white scale-100'
              : 'bg-white/90 text-transparent border border-gray-200 group-hover:border-gray-300'
          }
        `}
      >
        <svg className="w-3 h-3 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Badge */}
      {badge && (
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
          <span className="bg-brand-orange text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full uppercase tracking-wider shadow-sm">
            {badge}
          </span>
        </div>
      )}

      {/* Visual Area */}
      <div className={`relative w-full overflow-hidden bg-gray-50 ${illustration ? 'h-32 sm:h-52 p-2 sm:p-6' : 'h-32 sm:h-48'}`}>
        {illustration ? (
          <div className={`w-full h-full transition-transform duration-500 ${selected ? 'scale-105' : 'scale-100 group-hover:scale-105'}`}>
            {illustration}
          </div>
        ) : image ? (
          <>
            <img
              src={image}
              alt={title}
              className={`w-full h-full object-cover transition-transform duration-700 ${selected ? '' : 'group-hover:scale-110'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </>
        ) : null}
      </div>

      {/* Content Area */}
      <div className="p-3 sm:p-5">
        <div className="flex justify-between items-start mb-1 sm:mb-2">
          <h3 className={`font-bold text-base sm:text-lg leading-tight ${selected ? 'text-brand-blue' : 'text-gray-900'}`}>
            {title}
          </h3>
          {price && (
            <span className="shrink-0 font-bold text-base sm:text-lg text-brand-blue">{price}</span>
          )}
        </div>

        {description && (
          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-medium line-clamp-2 sm:line-clamp-none">
            {description}
            {spicyLevel === 'MILD' && <MildFlameIcon />}
          </p>
        )}
      </div>

      {/* Active Bottom Bar */}
      {selected && <div className="absolute bottom-0 left-0 right-0 h-1 sm:h-1.5 bg-brand-blue" />}
    </div>
  )
}

export default OptionCard
