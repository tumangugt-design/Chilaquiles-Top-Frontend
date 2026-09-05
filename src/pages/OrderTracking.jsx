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

            <div className="bg-blue-50/60 rounded-2xl p-6 text-center">
              <p className="text-gray-500 font-medium text-sm leading-relaxed">
                Te avisaremos por WhatsApp en cuanto tu pedido salga del restaurante. Guarda este link para ver el
                estado de tu pedido cuando quieras.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderTrackingPage
