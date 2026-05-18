import { useState } from 'react'
import { ArrowLeft, Trash2, CheckCircle2, AlertTriangle, Send } from 'lucide-react'
import Logo1 from '../components/Logo1.jsx'

const DataDeletion = () => {
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [reason, setReason] = useState('')
  const [status, setStatus] = useState(null) // 'sending', 'success', 'error'

  const handleSubmit = (e) => {
    e.preventDefault()
    setStatus('sending')
    
    // Simulate API call to delete data
    setTimeout(() => {
      setStatus('success')
      setPhone('')
      setName('')
      setReason('')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-white font-brand text-brand-black overflow-x-hidden selection:bg-brand-blue selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl shadow-lg shadow-black/5 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 group">
              <Logo1 className="w-24 sm:w-32 h-auto cursor-pointer transition-transform group-hover:scale-105" />
            </a>
          </div>
          <a
            href="/"
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 hover:text-brand-blue transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 bg-gradient-to-b from-blue-50/50 to-white overflow-hidden">
        <div className="absolute top-20 right-[10%] w-[300px] h-[300px] rounded-full bg-brand-blue/5 blur-3xl -z-10" />
        <div className="absolute bottom-0 left-[5%] w-[150px] h-[150px] rounded-full bg-brand-blue/3 blur-2xl -z-10" />
        
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-brand-red mb-6 animate-bounce" style={{ animationDuration: '3s' }}>
            <Trash2 size={32} />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Eliminación de <span className="text-brand-red">Datos de Usuario</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base font-semibold uppercase tracking-widest">
            Cumplimiento GDPR & Leyes de Privacidad
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">
          {/* Explanation Text */}
          <div className="prose prose-lg text-gray-600 font-medium leading-relaxed space-y-8">
            <div className="bg-red-50/30 p-8 rounded-3xl border border-brand-red/5 flex items-start gap-4">
              <AlertTriangle className="text-brand-red shrink-0 mt-1" size={24} />
              <p className="m-0 text-brand-black text-base">
                <strong>Nota Importante:</strong> La eliminación de tus datos es definitiva. Una vez procesada, no podrás recuperar tu historial de pedidos ni configuraciones preferidas en nuestra plataforma.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-brand-black">¿Qué datos eliminamos?</h2>
              <p>
                Al solicitar la eliminación de tu cuenta, borraremos de forma permanente los siguientes registros de nuestras bases de datos activas:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-500">
                <li>Tu nombre y número de teléfono celular registrados.</li>
                <li>Direcciones de envío guardadas y coordenadas de GPS asociadas a tu perfil.</li>
                <li>Tus preferencias de ingredientes y platos favoritos configurados.</li>
                <li>Tu historial de navegación y cookies de sesión almacenadas.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-brand-black">¿Cómo funciona el proceso?</h2>
              <p>
                Puedes solicitar la eliminación directa rellenando el formulario de la derecha. Nuestro sistema procesará la solicitud en un plazo máximo de 24 horas hábiles.
              </p>
              <p>
                Una vez completado el proceso, recibirás una confirmación por mensaje de texto (WhatsApp/SMS) indicando que tu información ha sido eliminada con éxito de todos nuestros sistemas.
              </p>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-brand-black">¿Deseas hacerlo de forma manual?</h2>
              <p>
                Si prefieres realizar tu solicitud directamente con nuestro equipo de privacidad, puedes escribirnos a <a href="mailto:contacto@chilaquilestop.com" className="text-brand-blue hover:underline font-bold">contacto@chilaquilestop.com</a> indicando tu número de teléfono registrado y el nombre completo asociado a tu cuenta.
              </p>
            </div>
          </div>

          {/* Interactive Form */}
          <div className="bg-gray-50/80 p-8 sm:p-12 rounded-[2.5rem] border border-gray-100 shadow-xl">
            {status === 'success' ? (
              <div className="text-center py-8 space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-bold text-brand-black">¡Solicitud Recibida!</h3>
                <p className="text-gray-500 font-medium max-w-sm mx-auto">
                  Hemos registrado tu solicitud de eliminación. Procederemos a borrar todos tus datos personales de nuestros sistemas en un plazo máximo de 24 horas. Recibirás una notificación final en tu teléfono.
                </p>
                <button
                  onClick={() => setStatus(null)}
                  className="bg-brand-blue text-white px-8 py-3 rounded-full font-semibold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-blue/20"
                >
                  Nueva Solicitud
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-brand-black mb-2">Solicitar Eliminación Directa</h3>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-6">
                    Completa los datos correspondientes
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 ml-1">
                    Nombre Completo
                  </label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full p-4 bg-white rounded-2xl border-2 border-gray-200 outline-none focus:border-brand-blue transition-all font-bold placeholder:text-gray-300 text-brand-black"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 ml-1">
                    Número de Teléfono Celular
                  </label>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. +502 5555 5555"
                    className="w-full p-4 bg-white rounded-2xl border-2 border-gray-200 outline-none focus:border-brand-blue transition-all font-bold placeholder:text-gray-300 text-brand-black"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 ml-1">
                    Motivo de la baja (Opcional)
                  </label>
                  <textarea
                    rows="3"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Cuéntanos brevemente por qué deseas eliminar tus datos..."
                    className="w-full p-4 bg-white rounded-2xl border-2 border-gray-200 outline-none focus:border-brand-blue transition-all font-bold placeholder:text-gray-300 text-brand-black resize-none"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full bg-brand-red text-white py-5 rounded-2xl font-semibold text-sm uppercase tracking-[0.15em] shadow-xl shadow-brand-red/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-3"
                  >
                    {status === 'sending' ? (
                      'Procesando...'
                    ) : (
                      <>
                        Confirmar Eliminación de Datos
                        <Send size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-14 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <Logo1 className="w-24 h-auto opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
          <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-[0.2em]">
            © 2026 Chilaquiles TOP. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default DataDeletion
