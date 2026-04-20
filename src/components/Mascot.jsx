// ============================================
// COMPONENTE: Mascot (TopIA)
// Mascota animada de Chilaquiles TOP
// ============================================

import { useEffect, useState } from 'react'

const Mascot = ({ currentStep, variant = 'fixed', className = '' }) => {
  const [isCheering, setIsCheering] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  // Trigger cheer animation cuando cambia el paso
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCheering(true)
      const resetTimer = setTimeout(() => setIsCheering(false), 600)
      return () => clearTimeout(resetTimer)
    }, 200)
    return () => clearTimeout(timer)
  }, [currentStep])

  const isFlowStep = currentStep !== 'LOCATION' && currentStep !== 'CONFIRMATION'
  const bottomPositionClass = isFlowStep ? 'bottom-[110px]' : 'bottom-4'

  const positionClasses =
    variant === 'fixed'
      ? `fixed z-50 right-4 ${bottomPositionClass} lg:right-10 lg:bottom-10`
      : `relative z-10`

  const sizeClasses = variant === 'fixed' ? `w-28 h-28 lg:w-40 lg:h-40` : `w-40 h-40`

  return (
    <div
      className={`
        ${positionClasses}
        ${sizeClasses}
        transition-all duration-700 ease-in-out animate-pop-in
        cursor-pointer hover:scale-110 active:scale-95
        ${className}
      `}
      onClick={() => setIsCheering(true)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      title="TopIA"
    >
      {/* Tooltip Bubble */}
      <div
        className={`
          absolute -top-12 right-1/2 translate-x-1/2 lg:right-0 lg:translate-x-0
          bg-ui-card px-4 py-2 rounded-2xl shadow-xl border border-ui-border
          text-sm font-extrabold text-brand-blue whitespace-nowrap
          transition-all duration-300 pointer-events-none z-50
          ${showTooltip ? 'opacity-100 -translate-y-2' : 'opacity-0 translate-y-2'}
        `}
      >
        Hola, soy TopIA
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 lg:left-auto lg:right-8 lg:translate-x-0 w-3 h-3 bg-ui-card transform rotate-45 border-r border-b border-ui-border" />
      </div>

      <div className={`w-full h-full ${isCheering ? 'animate-cheer' : 'animate-float'}`}>
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
          <g transform="translate(10, 10)">

            {/* LEGS */}
            <path d="M70 160 Q 60 180 50 180" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />
            <path d="M50 180 L 40 180" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />
            <path d="M110 160 Q 120 180 130 180" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />
            <path d="M130 180 L 140 180" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />

            {/* ARMS */}
            <path d="M145 100 Q 170 80 170 60" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />
            <circle cx="170" cy="60" r="6" fill="#F59E0B" />
            <path d="M35 100 Q 10 120 30 130" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />

            {/* BODY (Triangle chip shape) */}
            <path
              d="M20 30 Q 90 10 160 30 L 90 170 Z"
              fill="#FBBF24"
              stroke="#D97706"
              strokeWidth="3"
              strokeLinejoin="round"
            />

            {/* Texture (Toasted spots) */}
            <circle cx="50" cy="50" r="2" fill="#B45309" opacity="0.4" />
            <circle cx="120" cy="60" r="1.5" fill="#B45309" opacity="0.4" />
            <circle cx="90" cy="120" r="2" fill="#B45309" opacity="0.4" />
            <circle cx="80" cy="40" r="1" fill="#B45309" opacity="0.4" />
            <circle cx="130" cy="90" r="2" fill="#B45309" opacity="0.4" />

            {/* FACE */}
            <g className="animate-blink" style={{ transformOrigin: '90px 80px' }}>
              {/* Left Eye */}
              <ellipse cx="70" cy="80" rx="18" ry="22" fill="white" stroke="#D97706" strokeWidth="1" />
              <circle cx="72" cy="80" r="8" fill="#1F2937" />
              <circle cx="75" cy="76" r="3" fill="white" />
              {/* Right Eye */}
              <ellipse cx="110" cy="80" rx="18" ry="22" fill="white" stroke="#D97706" strokeWidth="1" />
              <circle cx="108" cy="80" r="8" fill="#1F2937" />
              <circle cx="111" cy="76" r="3" fill="white" />
            </g>

            {/* Eyebrows */}
            <path d="M55 55 Q 70 45 85 55" stroke="#78350F" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M95 55 Q 110 45 125 55" stroke="#78350F" strokeWidth="3" strokeLinecap="round" fill="none" />

            {/* Mouth (Smile) */}
            <path d="M75 110 Q 90 125 105 110" stroke="#78350F" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M72 108 Q 90 130 108 108" fill="#78350F" opacity="0.1" />

          </g>
        </svg>
      </div>
    </div>
  )
}

export default Mascot
