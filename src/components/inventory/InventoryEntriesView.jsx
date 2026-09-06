import { useMemo, useState } from 'react'
import { PlusCircle, Search, Pencil } from 'lucide-react'
import EntryFormModal from './EntryFormModal.jsx'
import PriceEditModal from './PriceEditModal.jsx'
import { INVENTORY_PRODUCT_OPTIONS } from '../../shared/constants/index.jsx'
import { formatInventoryAmount } from '../../shared/utils/inventoryFormat.js'

const getLogTotalPrice = (log) => {
  if (log.totalPrice !== undefined && log.totalPrice !== null) return Number(log.totalPrice)
  const priceFromReason = log.reason?.match(/Costo Total\s*Q\s*([\d.]+)/i)
  if (priceFromReason) return Number(priceFromReason[1])
  if (log.price && log.price > 0) return Number(log.price)
  return null
}

const getLogEntryAmount = (log, product) => {
  const amtMatch = log.reason?.match(/Entrada de inventario:\s*([\d.]+)\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)/i)
  const displayAmount = log.inputAmount !== undefined && log.inputAmount !== null
    ? formatInventoryAmount(log.inputAmount)
    : amtMatch ? amtMatch[1] : formatInventoryAmount(log.amount || log.storedAmount || 0)
  const displayUnit = log.inputUnit || amtMatch?.[2] || product?.unit || log.storedUnit || ''
  return displayAmount && displayAmount !== '0' ? `${displayAmount} ${displayUnit}`.trim() : ''
}

const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const isSameMonth = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()

/**
 * Pestaña "Entradas". Antes: formulario siempre abierto ocupando media pantalla.
 * Ahora: la vista se enfoca en mostrar los datos (KPIs, historial, consumo por
 * plato) y el registro de una entrada se hace en un modal bajo demanda.
 */
const InventoryEntriesView = ({ inventory, inventoryLogs, getProductPortionConfig, isSaving, onSubmitEntry, onSavePrice }) => {
  const [entryModalOpen, setEntryModalOpen] = useState(false)
  const [historySearch, setHistorySearch] = useState('')
  const [editingPrice, setEditingPrice] = useState(null) // { value, label, currentPrice }

  const validLogs = useMemo(
    () => inventoryLogs.filter((log) => !!getProductPortionConfig(log.ingredientName).label),
    [inventoryLogs, getProductPortionConfig]
  )

  const filteredLogs = useMemo(() => {
    if (!historySearch.trim()) return validLogs
    const q = historySearch.trim().toLowerCase()
    return validLogs.filter((log) => {
      const product = getProductPortionConfig(log.ingredientName)
      return (product?.label || log.ingredientName).toLowerCase().includes(q) || (product?.category || '').toLowerCase().includes(q)
    })
  }, [validLogs, historySearch, getProductPortionConfig])

  const stats = useMemo(() => {
    const now = new Date()
    const today = validLogs.filter((log) => log.createdAt && isSameDay(new Date(log.createdAt), now))
    const month = validLogs.filter((log) => log.createdAt && isSameMonth(new Date(log.createdAt), now))
    const investedMonth = month.reduce((sum, log) => sum + (getLogTotalPrice(log) || 0), 0)
    return {
      todayCount: today.length,
      monthCount: month.length,
      investedMonth,
    }
  }, [validLogs])

  const consumoOptions = useMemo(() => {
    const allProductNames = Array.from(new Set([
      ...INVENTORY_PRODUCT_OPTIONS.map((p) => p.value),
      ...inventory.map((i) => i.name),
    ]))
    return allProductNames
      .map((name) => {
        const config = getProductPortionConfig(name)
        const inventoryItem = inventory.find((i) => i.name === config.name)
        return {
          value: config.name,
          label: config.label,
          category: config.category,
          usedPerPlate: config.usedPerPlate,
          unit: config.unit,
          fixedPrice: Number(inventoryItem?.lastPrice || 0),
        }
      })
      .sort((a, b) => (a.category !== b.category ? a.category.localeCompare(b.category) : a.label.localeCompare(b.label)))
  }, [inventory, getProductPortionConfig])

  return (
    <div className="space-y-6 animate-fade-in min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-ui-border pb-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-ui-text">Entradas de Inventario</h2>
          <p className="text-xs text-ui-muted font-bold uppercase tracking-widest mt-1">Registro de compras y consumo por plato</p>
        </div>
        <button
          type="button"
          onClick={() => setEntryModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-blue text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:shadow-xl transition-all"
        >
          <PlusCircle size={16} />
          Registrar entrada
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-[2rem] border border-ui-border bg-white p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-wider text-ui-muted">Entradas hoy</p>
          <p className="text-2xl font-black text-brand-blue mt-2">{stats.todayCount}</p>
        </div>
        <div className="rounded-[2rem] border border-ui-border bg-white p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-wider text-ui-muted">Entradas este mes</p>
          <p className="text-2xl font-black text-brand-blue mt-2">{stats.monthCount}</p>
        </div>
        <div className="rounded-[2rem] border border-ui-border bg-white p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-wider text-ui-muted">Invertido este mes</p>
          <p className="text-2xl font-black text-green-600 mt-2">Q{stats.investedMonth.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 min-w-0">
        {/* Historial de Entradas */}
        <div className="rounded-[2rem] border border-ui-border bg-ui-bg/40 p-4 sm:p-6 space-y-4 min-w-0">
          <div className="border-b border-ui-border pb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-ui-text">Historial de Entradas</h3>
              <p className="text-[10px] text-ui-muted font-bold uppercase tracking-widest mt-1">Últimas entradas registradas ({filteredLogs.length})</p>
            </div>
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ui-muted" size={14} />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Buscar producto..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-ui-border bg-white text-xs font-bold outline-none"
              />
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-ui-muted font-bold text-sm">
                {validLogs.length === 0 ? 'No hay entradas registradas aún.' : 'Ninguna entrada coincide con tu búsqueda.'}
              </p>
              {validLogs.length === 0 && <p className="text-ui-muted text-xs mt-1">Las entradas que registres aparecerán aquí.</p>}
            </div>
          ) : (
            <>
              {/* Tabla — laptop */}
              <div className="hidden xl:block rounded-2xl border border-ui-border bg-white overflow-hidden">
                <div className="overflow-x-auto max-h-[26rem] overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0">
                      <tr className="bg-ui-bg/80 backdrop-blur border-b border-ui-border text-[10px] font-black uppercase tracking-wider text-ui-muted">
                        <th className="py-3 px-4">Producto</th>
                        <th className="py-3 px-4">Entrada</th>
                        <th className="py-3 px-4 text-right">Costo</th>
                        <th className="py-3 px-4 text-right">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ui-border/60 text-xs font-bold text-ui-text">
                      {filteredLogs.map((log) => {
                        const product = getProductPortionConfig(log.ingredientName)
                        const totalPrice = getLogTotalPrice(log)
                        const entryAmt = getLogEntryAmount(log, product)
                        const stockAmount = log.storedAmount || log.amount || 0
                        const stockUnit = log.storedUnit || product?.unit || ''
                        const dateStr = log.createdAt
                          ? new Date(log.createdAt).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                          : ''
                        return (
                          <tr key={log._id} className="hover:bg-ui-bg/10 transition-colors">
                            <td className="py-3 px-4">
                              <p className="font-black text-ui-text">{product?.label || log.ingredientName}</p>
                              <p className="text-[10px] text-ui-muted uppercase tracking-wide font-black">{product?.category || ''}</p>
                            </td>
                            <td className="py-3 px-4">
                              <p>{entryAmt}</p>
                              <p className="text-[10px] text-brand-blue font-black mt-0.5">Stock: +{formatInventoryAmount(stockAmount)} {stockUnit}</p>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {totalPrice !== null ? (
                                <span className="font-black text-green-600">Q{totalPrice.toFixed(2)}</span>
                              ) : (
                                <span className="text-[10px] font-bold text-orange-400 italic">Sin costo</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right text-ui-muted text-[10px]">{dateStr}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tarjetas — iPad / móvil */}
              <div className="xl:hidden space-y-2 max-h-[26rem] overflow-y-auto pr-1">
                {filteredLogs.map((log) => {
                  const product = getProductPortionConfig(log.ingredientName)
                  const totalPrice = getLogTotalPrice(log)
                  const entryAmt = getLogEntryAmount(log, product)
                  const stockAmount = log.storedAmount || log.amount || 0
                  const stockUnit = log.storedUnit || product?.unit || ''
                  const dateStr = log.createdAt
                    ? new Date(log.createdAt).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : ''
                  return (
                    <div key={log._id} className="rounded-2xl border border-ui-border bg-white/70 px-4 py-3 flex items-start justify-between gap-3 min-w-0">
                      <div className="min-w-0">
                        <p className="font-black text-ui-text text-sm leading-tight truncate">{product?.label || log.ingredientName}</p>
                        <p className="text-[10px] font-bold text-ui-muted uppercase tracking-widest mt-0.5">{product?.category || ''} · {entryAmt}</p>
                        <p className="text-[10px] text-ui-muted mt-0.5">{dateStr}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {totalPrice !== null ? (
                          <p className="text-sm font-black text-green-600">Q{totalPrice.toFixed(2)}</p>
                        ) : (
                          <p className="text-[10px] font-bold text-orange-400 italic">Sin costo registrado</p>
                        )}
                        <p className="text-[10px] font-bold text-brand-blue mt-0.5">Stock: +{formatInventoryAmount(stockAmount)} {stockUnit}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Consumo por plato */}
        <div className="rounded-[2rem] border border-ui-border bg-ui-bg/40 p-4 sm:p-6 space-y-4 min-w-0">
          <div className="border-b border-ui-border pb-4">
            <h3 className="text-lg font-black text-ui-text">Consumo por plato</h3>
            <p className="text-[10px] text-ui-muted font-bold uppercase tracking-widest mt-1">Referencia de porciones y precio fijo</p>
          </div>

          {/* Tabla — laptop */}
          <div className="hidden xl:block rounded-2xl border border-ui-border bg-white overflow-hidden">
            <div className="overflow-x-auto max-h-[28rem] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0">
                  <tr className="bg-ui-bg/80 backdrop-blur border-b border-ui-border text-[10px] font-black uppercase tracking-wider text-ui-muted">
                    <th className="py-3 px-4">Producto</th>
                    <th className="py-3 px-4 text-right">Consumo/plato</th>
                    <th className="py-3 px-4 text-right">Precio fijo</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ui-border/60 text-xs font-bold text-ui-text">
                  {consumoOptions.map((product) => (
                    <tr key={product.value} className="hover:bg-ui-bg/10 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-black text-ui-text">{product.label}</p>
                        <p className="text-[10px] text-ui-muted uppercase tracking-wide font-black">{product.category}</p>
                      </td>
                      <td className="py-3 px-4 text-right text-brand-blue font-black">{product.usedPerPlate} {product.unit}</td>
                      <td className="py-3 px-4 text-right text-green-600 font-black">Q{product.fixedPrice.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setEditingPrice(product)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-brand-blue/20 bg-brand-blue/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-brand-blue transition-all hover:bg-brand-blue hover:text-white"
                        >
                          <Pencil size={12} /> Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tarjetas — iPad / móvil */}
          <div className="xl:hidden space-y-3 max-h-[28rem] overflow-y-auto pr-1">
            {consumoOptions.map((product) => (
              <div key={product.value} className="rounded-2xl border border-ui-border bg-white/60 p-4 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 min-w-0">
                  <div className="min-w-0">
                    <p className="font-black text-ui-text break-words leading-tight">{product.label}</p>
                    <p className="text-[10px] uppercase tracking-widest text-ui-muted font-black mt-1">{product.category}</p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <p className="text-sm font-black text-brand-blue break-words">{product.usedPerPlate} {product.unit}</p>
                    <p className="text-[10px] font-black text-green-600 mt-0.5">Precio fijo Q{product.fixedPrice.toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-3 border-t border-ui-border pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingPrice(product)}
                    className="rounded-xl border border-brand-blue/20 bg-brand-blue/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-brand-blue transition-all hover:bg-brand-blue hover:text-white"
                  >
                    Editar precio
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <EntryFormModal
        isOpen={entryModalOpen}
        onClose={() => setEntryModalOpen(false)}
        inventory={inventory}
        isSaving={isSaving}
        onSubmit={onSubmitEntry}
      />

      <PriceEditModal
        isOpen={!!editingPrice}
        onClose={() => setEditingPrice(null)}
        product={editingPrice}
        currentPrice={editingPrice?.fixedPrice}
        isSaving={isSaving}
        onSave={onSavePrice}
      />
    </div>
  )
}

export default InventoryEntriesView
