import { STEPS_ORDER } from '../../shared/constants/index.jsx'

const Stepper = ({ currentStep }) => {
  if (currentStep === 'LOCATION' || currentStep === 'CONFIRMATION') return null

  const currentIndex = STEPS_ORDER.indexOf(currentStep)

  const milestones = [
    { label: 'Salsa', step: 'SAUCE' },
    { label: 'Proteína', step: 'PROTEIN' },
    { label: 'Complemento', step: 'COMPLEMENT' },
    { label: 'Base', step: 'BASE_RECIPE' },
    { label: 'Confirmar', step: 'SUMMARY' },
    { label: 'Datos', step: 'CUSTOMER' },
  ]

  const stepWidth = 80
  const translateX = `calc(50% - ${stepWidth / 2}px - ${currentIndex * stepWidth}px)`

  return (
    <div className="sticky top-16 lg:top-20 z-30 -mx-4 sm:mx-0 bg-ui-bg border-b border-ui-border transition-all duration-300 shadow-sm">
      <div className="w-full relative overflow-hidden h-14 sm:h-20 select-none flex items-center">

        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-r from-ui-bg to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-l from-ui-bg to-transparent z-20 pointer-events-none" />

        <div
          className="absolute top-0 left-0 h-full flex items-center transition-transform duration-500 ease-out will-change-transform"
          style={{ transform: `translateX(${translateX})`, width: `${milestones.length * stepWidth}px` }}
        >
          {/* Background Line */}
          <div className="absolute top-[50%] -translate-y-[50%] left-0 right-0 h-0.5 bg-ui-border -z-10 mx-10 rounded-full" />

          {milestones.map((m, idx) => {
            const mIndex = STEPS_ORDER.indexOf(m.step)
            const isActive = currentIndex === mIndex
            const isPassed = currentIndex > mIndex

            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-center flex-shrink-0 transition-all duration-300"
                style={{ width: `${stepWidth}px` }}
              >
                {/* Dot / Circle */}
                <div
                  className={`
                    w-3 h-3 sm:w-5 sm:h-5 rounded-full border mb-1.5 transition-all duration-300 relative z-10 flex items-center justify-center
                    ${
                      isActive
                        ? 'bg-brand-blue border-brand-blue scale-125 shadow-lg shadow-blue-500/30'
                        : isPassed
                        ? 'bg-brand-blue border-brand-blue'
                        : 'bg-ui-card border-ui-border'
                    }
                  `}
                >
                  {isPassed && (
                    <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`
                    text-[9px] sm:text-[10px] font-black uppercase tracking-tighter transition-all duration-300 text-center px-1 leading-none
                    ${isActive ? 'text-brand-blue opacity-100 scale-110' : 'text-ui-muted opacity-60'}
                  `}
                >
                  {m.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Stepper;
