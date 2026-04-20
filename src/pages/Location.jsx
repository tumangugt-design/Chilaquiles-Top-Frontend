// ============================================
// PÁGINA: Location (Pantalla de bienvenida)
// ============================================

import { useState } from 'react'
import Button from '../components/ui/Button.jsx'
import Logo from '../components/Logo.jsx'

const LocationPage = ({ onConfirm }) => {
  const [error, setError] = useState(false)

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl max-w-md w-full text-center relative overflow-hidden animate-slide-up">
      {/* Decorative top bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-blue to-brand-orange" />

      <div className="mb-8">
        <div className="w-48 h-32 mx-auto mb-2 relative group flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
          <Logo className="w-full h-full" />
        </div>

        <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
          {error ? 'Ubicación no disponible' : '¿Estás en Hacienda Real?'}
        </h2>

        <p className="text-gray-500 leading-relaxed">
          {error
            ? 'Por el momento nuestro servicio es exclusivo para residentes y visitantes dentro de Hacienda Real.'
            : 'Para asegurar que tus chilaquiles lleguen crujientes y calientes, necesitamos confirmar tu ubicación.'}
        </p>
      </div>

      {!error ? (
        <div className="space-y-4">
          <Button fullWidth onClick={onConfirm} variant="primary" className="text-lg">
            Sí, estoy aquí
          </Button>
          <button
            onClick={() => setError(true)}
            className="block w-full py-3 text-gray-400 text-sm font-semibold hover:text-gray-600 transition-colors"
          >
            No, cambiar ubicación
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-4">
            Lo sentimos, no podemos procesar tu pedido fuera del área de cobertura.
          </div>
          <Button variant="secondary" fullWidth onClick={() => setError(false)}>
            Volver a intentar
          </Button>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs font-semibold text-gray-400">Servicio activo en zona</span>
        </div>
      </div>
    </div>
  )
}

export default LocationPage
