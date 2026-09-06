import { X } from 'lucide-react'

/**
 * Modal genérico reutilizable para formularios de edición/creación.
 * Reemplaza los patrones de edición inline usados antes en Inventario.
 */
const Modal = ({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-lg' }) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start sm:items-center justify-center p-4 pt-24 sm:pt-4 bg-ui-bg/60 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`bg-ui-card rounded-[2rem] shadow-2xl w-full ${maxWidth} p-6 sm:p-8 animate-slide-up relative border border-ui-border max-h-[calc(100vh-7rem)] sm:max-h-[92vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="sticky top-0 ml-auto -mr-1 -mt-1 z-10 w-10 h-10 rounded-full bg-ui-bg border border-ui-border text-ui-muted hover:text-ui-text transition-colors flex items-center justify-center shadow-sm"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        {(title || subtitle) && (
          <div className="mb-6 -mt-6">
            {title && <h3 className="text-2xl font-black text-ui-text tracking-tighter">{title}</h3>}
            {subtitle && <p className="text-ui-muted font-medium text-sm mt-1">{subtitle}</p>}
          </div>
        )}

        {children}
      </div>
    </div>
  )
}

export default Modal
