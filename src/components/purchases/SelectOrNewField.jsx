import { useEffect, useState } from 'react'

const NEW_VALUE = '__new__'

/**
 * Select con opcion "+ Nuevo" para catalogos que crecen con el tiempo pero
 * que en su mayoria se repiten (ingrediente en bruto, producto de Stock
 * resultante). Arranca en modo "seleccionar de la lista"; si el valor
 * recibido no esta en `options` (por ejemplo al editar algo antiguo) arranca
 * directo en modo texto libre.
 */
const SelectOrNewField = ({
  value,
  onChange,
  options = [],
  placeholder = 'Selecciona...',
  newLabel = '+ Nuevo (no esta en la lista)',
  inputPlaceholder = 'Escribe el nombre',
  allowNew = true
}) => {
  const [mode, setMode] = useState(() => (value && !options.includes(value) ? 'new' : 'select'))

  useEffect(() => {
    if (value && !options.includes(value) && mode === 'select') {
      setMode('new')
    }
  }, [value, options, mode])

  const handleSelectChange = (e) => {
    const val = e.target.value
    if (val === NEW_VALUE) {
      setMode('new')
      onChange('')
      return
    }
    onChange(val)
  }

  if (mode === 'new') {
    return (
      <div className="space-y-1.5">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={inputPlaceholder}
          className="w-full rounded-xl border border-ui-border bg-white px-4 py-3 text-sm font-bold text-ui-text outline-none"
        />
        {options.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setMode('select')
              onChange('')
            }}
            className="text-[10px] font-black uppercase tracking-widest text-brand-blue"
          >
            ‹ Elegir de la lista
          </button>
        )}
      </div>
    )
  }

  return (
    <select
      value={options.includes(value) ? value : ''}
      onChange={handleSelectChange}
      className="w-full rounded-xl border border-ui-border bg-white px-4 py-3 text-sm font-bold text-ui-text outline-none"
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
      {allowNew && <option value={NEW_VALUE}>{newLabel}</option>}
    </select>
  )
}

export default SelectOrNewField
