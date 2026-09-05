import { useState, useEffect, useRef } from 'react'
import { CheckCircle2, Clock, MessageCircle } from 'lucide-react'
import Logo from '../components/Logo1.jsx'
import { trackOrder } from '../shared/config/api.js'

const STAGES = [
  { key: 'recibido', label: 'Pedido recibido', statuses: ['recibido'] },
  { key: 'preparando', label: 'Preparando tu pedido', statuses: ['en_proceso'] },
  { key: 'camino', label: 'En camino', statuses: ['listo_para_despacho', 'recolectado', 'en_camino'] },
  { key: 'entregado', label: 'Entregado', statuses: ['entregado'] },
]

const getStageIndex = (status) => STAGES.findIndex((stage) => stage.statuses.includes(status))

const OrderTrackingPage = ({ orderNumber }) => {
  const [order, setOrder] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)
  const pollRef = useRef(null)

  useEffect(() => {
    let mounted = true

    const fetchStatus = async () => {
      try {
        const { data } = await trackOrder(orderNumber)
        if (!mounted) return
        setOrder(data)
        setNotFound(false)
        setLoading(false)
        if (data.status === 'entregado' && pollRef.current) {
          clearInterval(pollRef.current)
        }
      } catch (error) {
        if (!mounted) return
        if (error?.response?.status === 404) {
          setNotFound(true)
        }
        setLoading(false)
      }
    }

    fetchStatus()
    pollRef.current = setInterval(fetchStatus, 8000)

    return () => {
      mounted = false
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [orderNumber])

  const stageIndex = order ? getStageIndex(order.status) : -1

  return (
    <div className="min-h-screen bg-white font-brand text-brand-black flex flex-col items-center px-5 sm:px-6 py-10 sm:py-16">
      <a href="/" className="mb-10 sm:mb-14">
        <Logo className="w-32 sm:w-40 h-auto" />
      </a>

      <div className="w-full max-w-lg">
        {loading && (
          <div className="text-center py-20">
            <div className="w-10 h-10 mx-auto rounded-full border-4 border-brand-blue/20 border-t-brand-blue animate-spin mb-6" />
            <p className="text-gray-400 font-medium">Consultando tu pedido...</p>
          </div>
        )}

        {!loading && notFound && (
          <div className="text-center py-16">
            <div className="inline-block bg-gray-100 text-gray-500 px-5 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] mb-6">
              No encontrado
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">No encontramos ese pedido</h2>
            <p className="text-gray-400 font-medium mb-8 leading-relaxed">
              Verifica el link que recibiste o contáctanos por WhatsApp si necesitas ayuda.
            </p>
            <a
              href="https://api.whatsapp.com/send/?phone=50233019938&text&type=phone_number&app_absent=0"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-full font-semibold text-sm uppercase tracking-[0.15em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#25D366]/25"
            >
              <MessageCircle size={18} />
              Escríbenos
            </a>
          </div>
        )}

        {!loading && !notFound && order && (
          <>
            <div className="text-center mb-12">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-brand-blue/10 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-brand-blue" />
              </div>
              <div className="inline-block bg-brand-blue/10 text-brand-blue px-5 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] mb-4">
                Pago Confirmado
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">¡Gracias por tu pedido!</h1>
              <p className="text-gray-400 font-medium">
                Orden #{order.orderNumber} &middot; Q{Number(order.total).toFixed(2)}
              </p>
            </div>

            <div className="bg-white border-2 border-gray-100 rounded-[2rem] p-8 sm:p-10 shadow-sm mb-8">
              <div className="space-y-8">
                {STAGES.map((stage, index) => {
                  const isDone = stageIndex > index || (stageIndex === STAGES.length - 1 && index === STAGES.length - 1)
                  const isCurrent = index === stageIndex
                  const isPending = index > stageIndex

                  return (
                    <div key={stage.key} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            isCurrent
                              ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30'
                              : isDone
                              ? 'bg-brand-blue/15 text-brand-blue'
                              : 'bg-gray-100 text-gray-300'
                          }`}
                        >
                          {isDone && !isCurrent ? <CheckCircle2 size={18} /> : <Clock size={16} />}
                        </div>
                        {index < STAGES.length - 1 && (
                          <div className={`w-[2px] h-10 mt-1 ${isDone ? 'bg-brand-blue/20' : 'bg-gray-100'}`} />
                        )}
                      </div>
                      <div className="pt-1.5">
                        <p
                          className={`font-bold text-lg ${
                            isCurrent ? 'text-brand-black' : isPending ? 'text-gray-300' : 'text-gray-400'
                          }`}
                        >
                          {stage.label}
                        </p>
                        {isCurrent && (
                          <p className="text-brand-blue text-sm font-semibold mt-0.5">En este momento</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-blue-50/60 rounded-2xl p-6 text-center mb-8">
              <p className="text-gray-500 font-medium text-sm leading-relaxed">
                Te avisaremos por WhatsApp en cuanto tu pedido salga del restaurante.
              </p>
            </div>

            <div className="bg-gradient-to-br from-brand-blue/[0.06] to-brand-orange/[0.06] border border-brand-blue/10 rounded-[1.75rem] p-6 sm:p-7 text-center">
              <p className="text-brand-black font-black text-lg mb-1.5">👀 ¿Qué hacer mientras esperas?</p>
              <p className="text-gray-500 font-medium text-sm leading-relaxed mb-5 max-w-xs mx-auto">
                Échale un ojo a lo último que subimos — contenido, antojos y sorpresas que no vas a ver en otro lado.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3">
                <a
                  href="https://www.instagram.com/chilaquiles_top?igsh=bzR4bmdjMXI2MDJm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2.5 bg-white border border-gray-200 rounded-2xl px-5 py-3.5 font-bold text-sm text-brand-black hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888] hover:text-white hover:border-transparent transition-all shadow-sm active:scale-95"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                  @chilaquiles_top
                </a>
                <a
                  href="https://www.tiktok.com/@chilaquiles.top?is_from_webapp=1&sender_device=pc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2.5 bg-white border border-gray-200 rounded-2xl px-5 py-3.5 font-bold text-sm text-brand-black hover:bg-black hover:text-white hover:border-black transition-all shadow-sm active:scale-95"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.96-.5 3.9-1.48 5.6-1.39 2.4-3.79 4.12-6.55 4.54-2.53.38-5.18-.08-7.24-1.55C-.14 22.09-.59 19.14.7 16.51c1.1-2.26 3.32-3.88 5.8-4.25 1.05-.15 2.12-.08 3.14.18v4.06c-.66-.1-1.33-.1-2.02-.03-1.02.1-1.95.66-2.52 1.49-.66.97-.73 2.24-.26 3.28.47 1.05 1.41 1.79 2.55 2.06 1.3.31 2.7-.04 3.65-.96 1.05-.98 1.56-2.4 1.56-3.83v-18.5Z"/>
                  </svg>
                  @chilaquiles.top
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderTrackingPage
