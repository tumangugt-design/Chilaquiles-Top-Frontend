import Button from '../components/ui/Button.jsx'
import {
  OPTIONS_SAUCE,
  OPTIONS_PROTEIN,
  OPTIONS_COMPLEMENT,
  formatBaseRecipe,
  getOptionLabel,
} from '../shared/constants/index.jsx'

const getPlateSummaryLines = (plate = {}) => {
  const lines = [
    { label: 'Salsa', value: getOptionLabel(plate.sauce, OPTIONS_SAUCE) || 'Sin salsa' },
    { label: 'Proteína', value: getOptionLabel(plate.protein, OPTIONS_PROTEIN) || 'Sin proteína' },
    { label: 'Complemento', value: getOptionLabel(plate.complement, OPTIONS_COMPLEMENT) || 'Sin complemento' },
    { label: 'Base', value: formatBaseRecipe(plate.baseRecipe) || 'Sin base' },
  ]
  return lines
}

const PlateSummaryCard = ({ plate, plateNumber, onCopy }) => (
  <button
    type="button"
    onClick={() => onCopy(plate)}
    className="w-full rounded-3xl border-2 border-ui-border bg-ui-bg/70 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand-blue hover:bg-brand-blue/5 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 sm:p-5"
  >
    <div className="mb-3 flex items-center justify-between gap-3 border-b border-ui-border pb-3">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-brand-blue">Plato {plateNumber}</span>
      <span className="rounded-full bg-brand-blue px-3 py-1 text-[10px] font-black uppercase text-white">Usar este</span>
    </div>
    <div className="space-y-2">
      {getPlateSummaryLines(plate).map((line) => (
        <div key={line.label} className="grid grid-cols-[92px_1fr] gap-3 text-sm">
          <span className="font-black uppercase text-ui-muted text-[11px] tracking-wide">{line.label}</span>
          <span className="font-bold text-ui-text">{line.value}</span>
        </div>
      ))}
    </div>
  </button>
)

const PlateCopyChoice = ({ sourcePlates = [], nextPlateNumber, onCopyPlate, onCustomize, onBack }) => {
  const isSecondPlate = nextPlateNumber === 2

  return (
    <div className="animate-fade-in space-y-6 pb-6">
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-orange">
          Plato {nextPlateNumber}
        </p>
        <h2 className="text-2xl font-extrabold text-ui-text sm:text-3xl">
          {isSecondPlate
            ? '¿Querés que el segundo plato sea igual al primero?'
            : '¿Querés copiar un plato anterior?'}
        </h2>
        <p className="text-sm font-semibold leading-relaxed text-ui-muted sm:text-base">
          {isSecondPlate
            ? 'Podés copiar el primer plato completo o personalizar el segundo desde cero.'
            : 'Elegí si el tercer plato será igual al primero, igual al segundo o si preferís personalizarlo.'}
        </p>
      </div>

      <div className="grid gap-4">
        {sourcePlates.map((plate, index) => (
          <PlateSummaryCard
            key={plate.id || index}
            plate={plate}
            plateNumber={index + 1}
            onCopy={onCopyPlate}
          />
        ))}
      </div>

      <div className="grid gap-3 border-t border-ui-border pt-5 sm:grid-cols-[auto_1fr]">
        <Button type="button" variant="secondary" onClick={onBack} className="order-2 sm:order-1">
          Atrás
        </Button>
        <Button type="button" onClick={onCustomize} className="order-1 py-4 sm:order-2">
          No, personalizar plato {nextPlateNumber}
        </Button>
      </div>
    </div>
  )
}

export default PlateCopyChoice
