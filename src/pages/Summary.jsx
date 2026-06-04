import { useState } from 'react'
import { OPTIONS_SAUCE, OPTIONS_PROTEIN, OPTIONS_COMPLEMENT, formatBaseRecipe, getOptionLabel } from '../shared/constants/index.jsx'
import Button from '../components/ui/Button.jsx'
import { validateCoupon } from '../shared/config/api.js'
import toast from 'react-hot-toast'

const PlateDetails = ({ plate, onEdit, title, showEdit = true, idx }) => {
  const sauceLabel = getOptionLabel(plate.sauce, OPTIONS_SAUCE)
  const proteinLabel = getOptionLabel(plate.protein, OPTIONS_PROTEIN)
  const complementLabel = getOptionLabel(plate.complement, OPTIONS_COMPLEMENT)

  return (
    <div className="bg-ui-card border border-ui-border shadow-sm rounded-xl p-5 mb-4 relative overflow-hidden">
      {}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-blue"></div>

      <div className="mb-3 pb-2 border-b border-ui-border flex justify-between items-center pl-3">
        <h3 className="font-bold text-ui-text text-lg">{title}</h3>
      </div>

      <div className="space-y-2 pl-3">
        {}

        <div className="flex justify-between items-center text-sm text-ui-muted">
          <span className="text-ui-text">
            {sauceLabel || 'Sin salsa'}
          </span>
          {showEdit && onEdit &&              <button
                onClick={() => onEdit('SAUCE')}
                className="text-brand-orange text-xs font-bold uppercase hover:bg-brand-orange/10 px-2 py-1 rounded transition-colors"
              >
                Editar
              </button>
          }
        </div>

        <div className="flex justify-between items-center text-sm text-ui-muted">
          <span className="text-ui-text">
            {proteinLabel || 'Sin proteína'}
          </span>
          {showEdit && onEdit &&              <button
                onClick={() => onEdit('PROTEIN')}
                className="text-brand-orange text-xs font-bold uppercase hover:bg-brand-orange/10 px-2 py-1 rounded transition-colors"
              >
                Editar
              </button>
          }
        </div>

        <div className="flex justify-between items-center text-sm text-ui-muted">
          <span className="text-ui-text">
            {complementLabel || 'Sin complemento'}
          </span>
          {showEdit && onEdit &&              <button
                onClick={() => onEdit('COMPLEMENT')}
                className="text-brand-orange text-xs font-bold uppercase hover:bg-brand-orange/10 px-2 py-1 rounded transition-colors"
              >
                Editar
              </button>
          }
        </div>

        {}
        <div className="flex justify-between items-center text-sm text-ui-muted pt-1 border-t border-ui-border mt-1">
          <span className="font-bold text-ui-text uppercase">{formatBaseRecipe(plate.baseRecipe)}</span>
          {showEdit && onEdit &&              <button
                onClick={() => onEdit('BASE_RECIPE')}
                className="text-brand-orange text-xs font-bold uppercase hover:bg-brand-orange/10 px-2 py-1 rounded transition-colors"
              >
                Editar
              </button>
          }
        </div>
      </div>
    </div>
  )
}

const SummaryPage = ({ order, updateOrder, onNext, onBack, onEdit, onAddAnother }) => {
  const [couponInput, setCouponInput] = useState('')
  const [isValidating, setIsValidating] = useState(false)

  const allPlates = [...order.cart, order.currentPlate]
  const platesCount = allPlates.length
  const requestedCount = Number(order.appliedPromo?.requestedCount || order.requestedCount || 1)
  const isComplete = platesCount >= requestedCount

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    setIsValidating(true)
    try {
      const res = await validateCoupon(couponInput.trim())
      const coupon = res.data
      updateOrder({
        couponCode: coupon.code,
        couponDiscountPercent: coupon.discountPercent,
      })
      toast.success(`Cupón ${coupon.code} aplicado con éxito (-${coupon.discountPercent}%)`)
      setCouponInput('')
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Código de cupón inválido.')
    } finally {
      setIsValidating(false)
    }
  }

  const getAddAnotherLabel = () => {
    if (platesCount === 1) return 'Personalizar Segundo Plato'
    if (platesCount === 2) return 'Personalizar Tercer Plato'
    return 'Agregar otro plato'
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="mb-4">
        <h2 className="text-2xl font-extrabold mb-2 text-ui-text">Resumen del Pedido</h2>
        <p className="text-ui-muted text-sm">Revisa que todo esté delicioso antes de confirmar.</p>
        {order.appliedPromo && (
          <p className="mt-2 inline-flex rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-green-700">
            Promo aplicada: {order.appliedPromo.name} · {order.appliedPromo.requestedCount} platos por Q{Number(order.appliedPromo.promoPrice || 0).toFixed(2)}
          </p>
        )}
      </div>

      {}
      <div className="space-y-4">
        {allPlates.map((plate, idx) => {

          const isCurrent = idx === allPlates.length - 1

          return (
            <PlateDetails
              key={plate.id || idx} // Fallback to index if ID missing
              plate={plate}
              title={`Plato ${idx + 1}`}
              onEdit={isCurrent ? onEdit : undefined}
              showEdit={isCurrent && !order.isPromo}
              idx={idx}
            />
          )
        })}
      </div>

      {/* Sección de Cupón de Descuento */}
      {isComplete && (
        <div className="bg-ui-card border border-ui-border rounded-2xl p-5 mt-6 shadow-sm">
          <h3 className="font-bold text-ui-text text-sm mb-3 uppercase tracking-wider">¿Tienes un código de descuento?</h3>
          {order.couponCode ? (
            <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <span className="bg-green-500 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded-md">Activo</span>
                <span className="text-green-700 font-bold text-sm">
                  {order.couponCode} ({order.couponDiscountPercent}% de descuento)
                </span>
              </div>
              <button
                onClick={() => updateOrder({ couponCode: null, couponDiscountPercent: 0 })}
                className="text-red-500 hover:text-red-700 font-black text-xs uppercase transition-colors"
              >
                Quitar
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Ej: IAN123TOP"
                className="flex-1 p-3.5 border border-ui-border rounded-xl bg-ui-bg text-ui-text font-black uppercase placeholder:normal-case outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all"
              />
              <Button
                onClick={handleApplyCoupon}
                disabled={isValidating || !couponInput.trim()}
                className="px-6 py-3.5 font-black rounded-xl"
              >
                {isValidating ? 'Validando...' : 'Aplicar'}
              </Button>
            </div>
          )}
        </div>
      )}

      {}
      <div className="mt-6">
        {!isComplete ? (
          <Button
            variant="secondary"
            fullWidth
            onClick={onAddAnother}
            className="py-4 border-2 border-dashed border-brand-orange text-brand-orange hover:bg-orange-50 hover:border-solid transition-all group"
          >
            <span className="text-xl mr-2 font-bold group-hover:scale-110 transition-transform">+</span>
            {getAddAnotherLabel()}
          </Button>
        ) : null}
      </div>

      <div className="pt-6 border-t border-ui-border mt-6 flex flex-col sm:flex-row gap-4">
        <button
          onClick={onBack}
          className="order-2 sm:order-1 text-ui-muted font-bold hover:text-ui-text transition-colors flex items-center justify-center px-4 py-3 sm:py-2"
        >
          <span className="mr-2">←</span> Volver a editar
        </button>
        <Button 
          fullWidth 
          onClick={onNext} 
          disabled={!isComplete}
          className="order-1 sm:order-2 py-4 shadow-xl shadow-brand-orange/20 flex-1"
        >
          <span className="hidden sm:inline">Finalizar Pedido y Continuar</span>
          <span className="sm:hidden">Finalizar Pedido</span>
          <span className="ml-2">→</span>
        </Button>
      </div>
    </div>
  )
}

export default SummaryPage
