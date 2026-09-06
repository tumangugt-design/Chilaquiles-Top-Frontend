import { useMemo, useState } from 'react'
import { Filter, Search, ChevronUp, ChevronDown, AlertTriangle, PackagePlus, Settings2, Trash2 } from 'lucide-react'
import Button from '../ui/Button.jsx'
import ConfirmReasonModal from '../ui/ConfirmReasonModal.jsx'
import StockEditModal from './StockEditModal.jsx'
import ProductDetailsModal from './ProductDetailsModal.jsx'
import { INVENTORY_PRODUCT_MAP } from '../../shared/constants/index.jsx'

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'Todas las categorías' },
  { value: 'Ingredientes fijos', label: 'Ingredientes fijos' },
  { value: 'Base', label: 'Bases' },
  { value: 'Salsas', label: 'Salsas' },
  { value: 'Proteínas', label: 'Proteínas' },
  { value: 'Complementos', label: 'Complementos' },
  { value: 'Empaque', label: 'Empaque' },
]

const SortHeader = ({ label, sortKey, activeKey, dir, onSort, align = 'left' }) => (
  <th
    className={`py-4 px-6 cursor-pointer select-none whitespace-nowrap ${align === 'right' ? 'text-right' : 'text-left'}`}
    onClick={() => onSort(sortKey)}
  >
    <span className="inline-flex items-center gap-1">
      {label}
      {activeKey === sortKey && (dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
    </span>
  </th>
)

/**
 * Pestaña "Stock": tabla ordenable de alta densidad en laptop, tarjetas
 * táctiles en iPad/móvil, con búsqueda, filtro de categoría y de proveedor,
 * y acciones de edición de stock, detalles (proveedor/origen/umbral) y
 * eliminación — todas con motivo obligatorio.
 */
const InventoryStockView = ({
  inventory,
  suppliers,
  inventoryCategoryFilter,
  setInventoryCategoryFilter,
  getProductPortionConfig,
  getPlatesByIngredient,
  isSaving,
  onSaveStock,
  onToggleStatus,
  onUpdateDetails,
  onRename,
  onDelete,
  onSync,
  onRequestCreateProduct,
}) => {
  const [search, setSearch] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [supplierFilter, setSupplierFilter] = useState('ALL')
  const [sortKey, setSortKey] = useState('label')
  const [sortDir, setSortDir] = useState('asc')
  const [editingItem, setEditingItem] = useState(null)
  const [detailsItem, setDetailsItem] = useState(null)
  const [deletingItem, setDeletingItem] = useState(null)

  const supplierById = useMemo(() => Object.fromEntries(suppliers.map((s) => [s._id, s])), [suppliers])

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const rows = useMemo(() => {
    return inventory
      .map((item) => {
        const meta = getProductPortionConfig(item.name)
        const isPackaging = meta?.category === 'Empaque'
        const isActive = isPackaging ? true : item.isActive !== false
        const isLow = item.minimumStock != null && Number(item.stock) <= Number(item.minimumStock)
        const plates = getPlatesByIngredient(item)
        const isCatalogItem = !!INVENTORY_PRODUCT_MAP[item.name]
        const supplierName = item.sourceType === 'preparado_interno'
          ? 'Preparación interna'
          : (item.supplierId ? supplierById[item.supplierId]?.name || 'Proveedor eliminado' : 'Sin proveedor')
        return { item, meta, isPackaging, isActive, isLow, plates, isCatalogItem, supplierName }
      })
      .filter((row) => inventoryCategoryFilter === 'ALL' || row.meta?.category === inventoryCategoryFilter)
      .filter((row) => !lowStockOnly || row.isLow)
      .filter((row) => {
        if (supplierFilter === 'ALL') return true
        if (supplierFilter === 'INTERNAL') return row.item.sourceType === 'preparado_interno'
        return row.item.supplierId === supplierFilter
      })
      .filter((row) => {
        if (!search.trim()) return true
        const q = search.trim().toLowerCase()
        return (row.meta?.label || row.item.name).toLowerCase().includes(q) || (row.meta?.category || '').toLowerCase().includes(q)
      })
  }, [inventory, inventoryCategoryFilter, lowStockOnly, supplierFilter, search, getProductPortionConfig, getPlatesByIngredient, supplierById])

  const sortedRows = useMemo(() => {
    const copy = [...rows]
    copy.sort((a, b) => {
      let av
      let bv
      if (sortKey === 'stock') {
        av = Number(a.item.stock)
        bv = Number(b.item.stock)
        return sortDir === 'asc' ? av - bv : bv - av
      }
      if (sortKey === 'category') {
        av = a.meta?.category || ''
        bv = b.meta?.category || ''
      } else {
        av = a.meta?.label || a.item.name
        bv = b.meta?.label || b.item.name
      }
      const cmp = av.localeCompare(bv)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [rows, sortKey, sortDir])

  const lowStockCount = useMemo(() => rows.filter((r) => r.isLow).length, [rows])

  return (
    <div className="space-y-6 animate-fade-in min-w-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-ui-border pb-4 min-w-0">
        <div>
          <h2 className="text-xl font-black tracking-tight text-ui-text">Inventario</h2>
          <p className="text-xs text-ui-muted font-bold uppercase tracking-widest mt-1">
            {sortedRows.length} producto{sortedRows.length === 1 ? '' : 's'}
            {lowStockCount > 0 && <span className="text-brand-red"> · {lowStockCount} con bajo stock</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="relative w-full sm:w-52">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ui-muted" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-ui-border bg-white text-[11px] font-bold outline-none"
            />
          </div>

          <div className="relative w-full sm:w-52">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted" size={16} />
            <select
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-ui-border bg-white font-black text-[10px] uppercase tracking-widest outline-none"
              value={inventoryCategoryFilter}
              onChange={(e) => setInventoryCategoryFilter(e.target.value)}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-48">
            <select
              className="w-full px-4 py-2.5 rounded-xl border border-ui-border bg-white font-black text-[10px] uppercase tracking-widest outline-none"
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
            >
              <option value="ALL">Todos los proveedores</option>
              <option value="INTERNAL">Preparación interna</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setLowStockOnly((v) => !v)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              lowStockOnly ? 'bg-brand-red text-white border-brand-red' : 'bg-white text-brand-red border-brand-red/30 hover:bg-brand-red/10'
            }`}
          >
            <AlertTriangle size={14} /> Bajo stock
          </button>

          <button
            type="button"
            onClick={onRequestCreateProduct}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-brand-orange/30 bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/20 transition-all"
          >
            <PackagePlus size={14} /> Crear Producto
          </button>

          <Button variant="secondary" className="w-full sm:w-auto !bg-brand-blue/10 !text-brand-blue !border-brand-blue/20 !py-2.5 !px-4" onClick={onSync}>
            Actualizar catálogo
          </Button>
        </div>
      </div>

      {sortedRows.length === 0 ? (
        <div className="py-16 text-center rounded-[2rem] border border-dashed border-ui-border bg-ui-bg/20">
          <p className="text-ui-muted font-bold text-sm">Ningún producto coincide con los filtros actuales.</p>
        </div>
      ) : (
        <>
          {/* Tabla — laptop (xl+) */}
          <div className="hidden xl:block rounded-[2rem] border border-ui-border bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-ui-bg/60 border-b border-ui-border text-[10px] font-black uppercase tracking-wider text-ui-muted">
                    <SortHeader label="Producto" sortKey="label" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                    <SortHeader label="Categoría" sortKey="category" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                    <th className="py-4 px-6 whitespace-nowrap">Proveedor</th>
                    <SortHeader label="Stock" sortKey="stock" activeKey={sortKey} dir={sortDir} onSort={handleSort} align="right" />
                    <th className="py-4 px-6 text-right whitespace-nowrap">Platos</th>
                    <th className="py-4 px-6 text-center whitespace-nowrap">Estado</th>
                    <th className="py-4 px-6 text-right whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ui-border/60 text-xs font-bold text-ui-text">
                  {sortedRows.map((row) => (
                    <tr key={row.item._id} className={`hover:bg-ui-bg/10 transition-colors ${row.isLow ? 'bg-brand-red/5' : !row.isActive ? 'opacity-60' : ''}`}>
                      <td className="py-4 px-6">
                        <p className="font-black text-sm text-ui-text capitalize">{row.item.displayLabel || row.meta?.label || row.item.name}</p>
                      </td>
                      <td className="py-4 px-6 text-ui-muted uppercase tracking-wide text-[10px] font-black">{row.meta?.category || 'Inventario'}</td>
                      <td className="py-4 px-6 text-ui-muted text-[11px] font-bold">{row.supplierName}</td>
                      <td className={`py-4 px-6 text-right font-black text-sm ${row.isLow ? 'text-brand-red' : 'text-brand-blue'}`}>
                        {Number(row.item.stock).toFixed(2)} <span className="text-[10px] text-ui-muted font-bold uppercase">{row.item.unit}</span>
                      </td>
                      <td className="py-4 px-6 text-right text-ui-muted">{row.plates !== null ? row.plates : '—'}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex text-[10px] font-black uppercase px-3 py-1 rounded-full ${!row.isActive ? 'bg-ui-muted/20 text-ui-muted' : 'bg-green-500/10 text-green-600'}`}>
                          {!row.isActive ? 'Inactivo' : 'Activo'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingItem(row.item)}
                            title="Editar stock"
                            className="text-[10px] font-black uppercase tracking-widest py-2 px-2.5 rounded-xl transition-all border border-brand-blue/30 text-brand-blue hover:bg-brand-blue/10"
                          >
                            Stock
                          </button>
                          <button
                            type="button"
                            onClick={() => setDetailsItem(row.item)}
                            title="Editar detalles"
                            className="p-2 rounded-xl transition-all border border-ui-border text-ui-muted hover:bg-ui-bg"
                          >
                            <Settings2 size={14} />
                          </button>
                          {row.isPackaging ? (
                            <span className="text-[10px] font-black uppercase tracking-widest py-2 px-2.5 rounded-xl border border-green-500/20 bg-green-500/10 text-green-700">
                              Fijo
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onToggleStatus(row.item.name, row.item.isActive ?? true)}
                              className={`text-[10px] font-black uppercase tracking-widest py-2 px-2.5 rounded-xl transition-all border ${
                                row.item.isActive === false
                                  ? 'border-brand-blue text-brand-blue hover:bg-brand-blue/10'
                                  : 'border-brand-red text-brand-red hover:bg-brand-red/10'
                              }`}
                            >
                              {row.item.isActive === false ? 'Activar' : 'Desactivar'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setDeletingItem(row.item)}
                            title="Eliminar producto"
                            className="p-2 rounded-xl transition-all border border-brand-red/20 text-brand-red hover:bg-brand-red/10"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tarjetas — iPad / móvil (< xl) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:hidden gap-4 min-w-0">
            {sortedRows.map((row) => (
              <div
                key={row.item._id}
                className={`w-full min-w-0 overflow-hidden rounded-[1.75rem] border border-ui-border p-4 sm:p-5 transition-all ${
                  !row.isActive ? 'bg-black/5 opacity-70 grayscale' : row.isLow ? 'bg-brand-red/5 border-brand-red/20' : 'bg-ui-bg/40'
                }`}
              >
                <div className="flex flex-row items-start justify-between gap-3 mb-3 min-w-0">
                  <div className="min-w-0 max-w-full">
                    <h3 className="font-black text-ui-text capitalize leading-tight break-words">{row.item.displayLabel || row.meta?.label || row.item.name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-ui-muted mt-1 break-words">{row.meta?.category || 'Inventario'}</p>
                    <p className="text-[10px] text-ui-muted font-bold mt-0.5 break-words">{row.supplierName}</p>
                  </div>
                  <div className="text-right shrink-0 max-w-[45%]">
                    <p className={`text-xl font-black break-words ${row.isLow ? 'text-brand-red' : 'text-brand-blue'}`}>
                      {Number(row.item.stock).toFixed(2)}
                    </p>
                    <p className="text-[10px] font-bold text-ui-muted uppercase break-words">{row.item.unit}</p>
                    {row.plates !== null && (
                      <p className="mt-1 rounded-full bg-brand-blue/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-brand-blue">
                        {row.plates} platos
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 gap-3 border-t border-ui-border/60 min-w-0">
                  <div className={`w-fit text-[10px] font-black uppercase px-3 py-1 rounded-full ${!row.isActive ? 'bg-ui-muted/20 text-ui-muted' : 'bg-green-500/10 text-green-600'}`}>
                    {!row.isActive ? 'Inactivo' : 'Activo'}
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto min-w-0">
                    <button
                      type="button"
                      onClick={() => setEditingItem(row.item)}
                      className="flex-1 sm:flex-none text-[10px] font-black uppercase tracking-widest py-2 px-3 rounded-xl transition-all border border-brand-blue/30 text-brand-blue hover:bg-brand-blue/10"
                    >
                      Stock
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailsItem(row.item)}
                      className="flex-1 sm:flex-none text-[10px] font-black uppercase tracking-widest py-2 px-3 rounded-xl transition-all border border-ui-border text-ui-muted hover:bg-ui-bg"
                    >
                      Detalles
                    </button>
                    {row.isPackaging ? (
                      <div className="text-center text-[10px] font-black uppercase tracking-widest py-2 px-3 rounded-xl border border-green-500/20 bg-green-500/10 text-green-700">
                        Fijo
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(row.item.name, row.item.isActive ?? true)}
                        className={`flex-1 sm:flex-none text-[10px] font-black uppercase tracking-widest py-2 px-3 rounded-xl transition-all border ${
                          row.item.isActive === false ? 'border-brand-blue text-brand-blue hover:bg-brand-blue/10' : 'border-brand-red text-brand-red hover:bg-brand-red/10'
                        }`}
                      >
                        {row.item.isActive === false ? 'Activar' : 'Desactivar'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setDeletingItem(row.item)}
                      className="p-2 rounded-xl transition-all border border-brand-red/20 text-brand-red hover:bg-brand-red/10"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <StockEditModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        item={editingItem}
        meta={editingItem ? getProductPortionConfig(editingItem.name) : null}
        isSaving={isSaving}
        onSave={onSaveStock}
      />

      <ProductDetailsModal
        isOpen={!!detailsItem}
        onClose={() => setDetailsItem(null)}
        item={detailsItem}
        meta={detailsItem ? getProductPortionConfig(detailsItem.name) : null}
        suppliers={suppliers}
        isCatalogItem={detailsItem ? !!INVENTORY_PRODUCT_MAP[detailsItem.name] : true}
        isSaving={isSaving}
        onSave={onUpdateDetails}
        onRename={onRename}
      />

      <ConfirmReasonModal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        title="Eliminar producto"
        subtitle={deletingItem ? (getProductPortionConfig(deletingItem.name)?.label || deletingItem.name) : ''}
        confirmLabel="Eliminar"
        danger
        reasonPlaceholder="Ej. producto descontinuado"
        isSaving={isSaving}
        onConfirm={(reason) => onDelete(deletingItem.name, reason)}
      />
    </div>
  )
}

export default InventoryStockView
