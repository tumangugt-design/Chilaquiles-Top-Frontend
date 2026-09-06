import { useMemo, useState } from 'react'
import { Package, Plus, Search, Beaker, ChevronDown, ChevronUp } from 'lucide-react'
import PurchaseFormModal from './PurchaseFormModal.jsx'
import ProductionBatchModal from './ProductionBatchModal.jsx'

const fmtQty = (n) => {
  const num = Number(n)
  if (Number.isNaN(num)) return '0'
  return num % 1 === 0 ? String(num) : num.toFixed(2)
}

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')

/**
 * Pestaña "Compras" (Operaciones) — Fase 2-4 de Compras/Lotes.
 * Aquí se registra el ingrediente EN BRUTO (la Compra = un lote con
 * cantidad restante) y, con "Producir lote", uno o más ingredientes en
 * bruto se combinan hacia un producto de Stock ya procesado (una
 * Asignación con el costo heredado congelado).
 */
const PurchasesView = ({ purchases, suppliers, inventory = [], isSaving, allocationsByPurchase, onCreatePurchase, onCreateProductionBatch, onLoadAllocations }) => {
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [batchModalOpen, setBatchModalOpen] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return purchases
    const q = search.trim().toLowerCase()
    return purchases.filter((p) => p.ingredientName.toLowerCase().includes(q))
  }, [purchases, search])

  // Los ingredientes en bruto se repiten casi siempre (salvo que se agregue
  // algo nuevo al menu) - se ofrecen para seleccionar en vez de escribir
  // cada vez el nombre.
  const knownIngredients = useMemo(
    () => [...new Set(purchases.map((p) => p.ingredientName))].sort(),
    [purchases]
  )

  const toggleExpand = (purchase) => {
    if (expandedId === purchase._id) {
      setExpandedId(null)
      return
    }
    setExpandedId(purchase._id)
    if (!allocationsByPurchase[purchase._id]) {
      onLoadAllocations(purchase._id)
    }
  }

  const unitCost = (p) => (Number(p.quantity) > 0 ? Number(p.totalCost) / Number(p.quantity) : 0)

  return (
    <div className="space-y-6 animate-fade-in min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-ui-border pb-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-ui-text">Compras</h2>
          <p className="text-xs text-ui-muted font-bold uppercase tracking-widest mt-1">Ingredientes en bruto y su transformación a Stock</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ui-muted" size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar ingrediente..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-ui-border bg-white text-xs font-bold outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setBatchModalOpen(true)}
            disabled={knownIngredients.length === 0}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-brand-blue/20 bg-brand-blue/10 text-brand-blue text-[11px] font-black uppercase tracking-widest transition-all hover:bg-brand-blue hover:text-white disabled:opacity-40"
          >
            <Beaker size={16} />
            Producir lote
          </button>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-brand-blue text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:shadow-xl transition-all"
          >
            <Plus size={16} />
            Nueva compra
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center rounded-[2rem] border border-dashed border-ui-border">
          <Package className="mx-auto text-ui-muted mb-3" size={28} />
          <p className="text-ui-muted font-bold text-sm">
            {purchases.length === 0 ? 'Aún no has registrado compras.' : 'Ninguna compra coincide con tu búsqueda.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const allocations = allocationsByPurchase[p._id]
            const isExpanded = expandedId === p._id
            return (
              <div key={p._id} className="rounded-2xl border border-ui-border bg-white overflow-hidden">
                <div className="p-4 flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-ui-text text-sm">{p.ingredientName}</p>
                      {p.isDepleted && (
                        <span className="rounded-full bg-ui-bg border border-ui-border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-ui-muted">Agotado</span>
                      )}
                    </div>
                    <p className="text-[10px] text-ui-muted font-bold uppercase tracking-widest mt-1">
                      {fmtDate(p.purchaseDate)}{p.supplier?.name ? ` · ${p.supplier.name}` : ''}{p.contactName ? ` (${p.contactName})` : ''}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 lg:gap-8 text-xs">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-ui-muted">Comprado</p>
                      <p className="font-black text-ui-text mt-0.5">{fmtQty(p.quantity)} {p.unit}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-ui-muted">Restante</p>
                      <p className="font-black text-ui-text mt-0.5">{fmtQty(p.remainingQuantity)} {p.unit}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-ui-muted">Costo</p>
                      <p className="font-black text-ui-text mt-0.5">Q{Number(p.totalCost).toFixed(2)} <span className="text-ui-muted font-bold">(Q{unitCost(p).toFixed(3)}/{p.unit})</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleExpand(p)}
                      className="inline-flex items-center gap-1 rounded-xl border border-ui-border px-3 py-2 text-[10px] font-black uppercase tracking-widest text-ui-muted transition-all hover:bg-ui-bg"
                    >
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />} Historial
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-ui-border bg-ui-bg/40 p-4">
                    {!allocations ? (
                      <p className="text-xs font-bold text-ui-muted">Cargando...</p>
                    ) : allocations.length === 0 ? (
                      <p className="text-xs font-bold text-ui-muted">Este lote aún no se ha usado en ninguna producción.</p>
                    ) : (
                      <div className="space-y-2">
                        {allocations.map((a) => {
                          const mine = a.rawInputs?.find((r) => (r.purchase?._id || r.purchase) === p._id)
                          const otherCount = (a.rawInputs?.length || 1) - 1
                          return (
                            <div key={a._id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white border border-ui-border px-3 py-2 text-xs font-bold">
                              <span className="text-ui-text">
                                {mine ? `${fmtQty(mine.quantityUsed)} ${mine.unit}` : '—'} de este lote → {fmtQty(a.producedQuantity)} {a.producedUnit} de <span className="font-black">{a.stockItemName}</span>
                                {otherCount > 0 && <span className="text-ui-muted font-medium"> (+{otherCount} ingrediente{otherCount > 1 ? 's' : ''} más)</span>}
                              </span>
                              <span className="text-ui-muted">
                                Q{Number(a.inheritedCost).toFixed(2)} total del lote (Q{Number(a.costPerProducedUnit).toFixed(3)}/{a.producedUnit}) · {fmtDate(a.allocationDate)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <PurchaseFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        suppliers={suppliers}
        knownIngredients={knownIngredients}
        isSaving={isSaving}
        onSave={onCreatePurchase}
      />

      <ProductionBatchModal
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        knownIngredients={knownIngredients}
        inventoryItems={inventory}
        isSaving={isSaving}
        onSave={onCreateProductionBatch}
      />
    </div>
  )
}

export default PurchasesView
