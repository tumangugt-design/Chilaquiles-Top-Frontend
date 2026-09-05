import { useState, useEffect, useRef } from 'react'
import { Mail, MapPin, ArrowRight, ChevronDown, MessageCircle, X } from 'lucide-react'
import Logo from '../components/Logo1.jsx'
import heroPlate from '../assets/hero_transparent.png'

const SauceSplash = ({ className, color = '#0000FF' }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="80" fill={color} opacity="0.06" />
    <circle cx="100" cy="100" r="60" fill={color} opacity="0.04" />
    <circle cx="30" cy="40" r="12" fill={color} opacity="0.15" />
    <circle cx="170" cy="150" r="8" fill={color} opacity="0.12" />
    <circle cx="160" cy="30" r="6" fill={color} opacity="0.1" />
    <circle cx="40" cy="160" r="10" fill={color} opacity="0.08" />
  </svg>
)

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false)
  const [formStatus, setFormStatus] = useState(null)
  const [paymentCancelled, setPaymentCancelled] = useState(false)
  const formRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('payment') === 'cancelled') {
      setPaymentCancelled(true)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormStatus('sending')
    setTimeout(() => {
      setFormStatus('sent')
      formRef.current?.reset()
      setTimeout(() => setFormStatus(null), 3000)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-white font-brand text-brand-black overflow-x-hidden selection:bg-brand-blue selection:text-white">
      {paymentCancelled && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-10 text-center shadow-2xl relative">
            <button
              onClick={() => setPaymentCancelled(false)}
              className="absolute top-6 right-6 text-gray-300 hover:text-brand-black transition-colors"
              aria-label="Cerrar"
            >
              <X size={22} />
            </button>
            <div className="inline-block bg-gray-100 text-gray-500 px-5 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] mb-4">
              Pago no completado
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-3">Tu pago fue cancelado</h3>
            <p className="text-gray-400 font-medium mb-8 leading-relaxed">
              No te preocupes, puedes intentar de nuevo cuando quieras.
            </p>
            <a
              href="https://pedidos.chilaquilestop.com/clientes"
              className="w-full inline-block bg-brand-blue text-white py-4 rounded-2xl font-semibold text-sm uppercase tracking-[0.15em] shadow-xl shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Volver a intentar
            </a>
          </div>
        </div>
      )}

      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-black/5 py-3' : 'bg-transparent py-5'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo className="w-32 sm:w-44 h-auto cursor-pointer transition-transform hover:scale-105" />
          </div>

          <div className="hidden md:flex items-center gap-12">
            {[
              ['inicio', 'Inicio'],
              ['historia', 'Nosotros'],
              ['contacto', 'Contacto'],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="text-[13px] font-medium tracking-widest hover:text-brand-blue transition-colors uppercase relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-brand-blue after:transition-all hover:after:w-full"
              >
                {label}
              </button>
            ))}
          </div>

          <a
            href="https://pedidos.chilaquilestop.com/clientes"
            className="bg-brand-blue text-white px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-full font-semibold text-[10px] sm:text-xs uppercase tracking-[0.15em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-blue/25"
          >
            Pedir Ahora
          </a>
        </div>
      </nav>

      <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute top-0 right-0 w-[55%] h-full bg-blue-50/60 rounded-bl-[6rem] -z-10 hidden lg:block" />
        <div className="absolute top-20 right-[15%] w-[400px] h-[400px] rounded-full bg-brand-blue/5 blur-3xl -z-10" />
        <div className="absolute bottom-10 left-[5%] w-[200px] h-[200px] rounded-full bg-brand-blue/3 blur-2xl -z-10" />

        <div className="max-w-7xl mx-auto px-5 sm:px-6 w-full grid lg:grid-cols-2 gap-16 lg:gap-12 items-center pt-28 pb-20 lg:pt-40 lg:pb-0">
          <div className="animate-fade-in z-10 text-center lg:text-left">
            <h1 className="text-[2.8rem] sm:text-[3.5rem] lg:text-[4.2rem] font-bold leading-[1.1] lg:leading-[0.95] tracking-[-0.03em] mb-8">
              Los <span className="text-brand-blue">primeros y mejores</span> chilaquiles de{' '}
              <span className="text-brand-blue">Guatemala</span>
            </h1>

            <p className="text-gray-400 text-lg sm:text-xl font-medium mb-12 max-w-md mx-auto lg:mx-0 leading-relaxed">
              Personaliza tus chilaquiles favoritos y vive una experiencia de sabor sin igual.
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
              <a
                href="https://pedidos.chilaquilestop.com/clientes"
                className="inline-flex items-center gap-3 bg-brand-blue text-white px-12 py-5 rounded-full font-semibold text-sm uppercase tracking-[0.15em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-blue/30 group"
              >
                Ordenar Ahora
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="https://api.whatsapp.com/send/?phone=50233019938&text&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#25D366] text-white px-10 py-5 rounded-full font-semibold text-sm uppercase tracking-[0.15em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#25D366]/30 group"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Escríbenos
              </a>
            </div>
          </div>

          <div className="relative flex justify-center items-center animate-slide-up lg:min-h-[600px]">
            <SauceSplash className="absolute w-[120%] h-[120%] -top-[10%] -left-[10%] -z-10 pointer-events-none" />
            <div
              className="absolute w-[85%] aspect-square rounded-full border-[3px] border-dashed border-brand-blue/10 animate-spin"
              style={{ animationDuration: '40s' }}
            />
            <div className="absolute w-[70%] aspect-square rounded-full bg-gradient-to-br from-brand-blue/6 to-transparent" />
            <div className="absolute top-8 left-2 w-5 h-5 rounded-full bg-brand-blue/20 animate-bounce" style={{ animationDuration: '3s' }} />
            <div
              className="absolute bottom-20 right-6 w-4 h-4 rounded-full bg-brand-blue/25 animate-bounce"
              style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}
            />
            <div className="absolute top-1/4 -left-4 w-8 h-8 rounded-full border-2 border-brand-blue/15" />
            <div className="absolute bottom-28 left-8 w-6 h-6 rounded-full border-2 border-brand-blue/10" />

            <div className="relative w-[90%] max-w-[520px] z-10">
              <img
                src={heroPlate}
                alt="Plato de Chilaquiles TOP"
                className="w-full h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => scrollTo('historia')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden lg:block"
        >
          <ChevronDown size={28} className="text-gray-300" />
        </button>
      </section>

      <section id="historia" className="py-20 lg:py-40 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white -z-10" />
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-brand-blue/10 text-brand-blue px-5 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] mb-6">
              Nuestra Historia
            </div>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] lg:leading-[1]">
              Aquí
              <br />
              TODO es <span className="text-brand-blue">TOP</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                title: 'Comida',
                desc: 'Ingredientes frescos seleccionados diariamente: salsas artesanales, proteínas premium y complementos de primera para el plato perfecto.',
              },
              {
                title: 'Experiencia',
                desc: 'Arma tu plato ideal desde tu celular en segundos. Seguimiento en tiempo real desde la cocina hasta tu puerta, sin complicaciones.',
              },
              {
                title: 'Precios',
                desc: 'Calidad premium a precios accesibles. Desde Q50 por plato individual y promociones especiales en combos de 3 por Q120.',
              },
            ].map((item) => (
              <div key={item.num} className="group">
                <div className="text-5xl font-bold text-brand-blue/10 mb-4 group-hover:text-brand-blue/30 transition-colors">
                  {item.num}
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-brand-blue transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-400 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contacto" className="py-24 lg:py-32 bg-brand-black text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-blue via-blue-400 to-brand-blue" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-brand-blue/5 blur-3xl" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <div>
              <div className="inline-block bg-white/10 text-white px-5 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] mb-8">
                Contáctanos
              </div>
              <h2 className="text-6xl sm:text-7xl font-bold tracking-tighter mb-8 leading-[0.95]">
                Hablemos<span className="text-brand-blue">.</span>
              </h2>
              <p className="text-gray-400 text-lg font-medium mb-14 max-w-md leading-relaxed">
                ¿Tienes dudas, sugerencias o quieres saber más? Estamos a un clic de distancia.
              </p>

              <div className="space-y-8">
                <a href="mailto:contacto@chilaquilestop.com" className="flex items-center gap-5 group">
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:bg-brand-blue group-hover:border-brand-blue transition-all">
                    <Mail size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-1.5">Email</p>
                    <p className="text-lg font-bold group-hover:text-brand-blue transition-colors">
                      contacto@chilaquilestop.com
                    </p>
                  </div>
                </a>

                <a href="https://api.whatsapp.com/send/?phone=50233019938&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" className="flex items-center gap-5 group">
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:bg-[#25D366] group-hover:border-[#25D366] transition-all">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[22px] h-[22px] text-white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-1.5">WhatsApp</p>
                    <p className="text-lg font-bold group-hover:text-[#25D366] transition-colors">+502 3301 9938</p>
                  </div>
                </a>

                <a href="https://www.instagram.com/chilaquiles_top?igsh=bzR4bmdjMXI2MDJm" target="_blank" rel="noopener noreferrer" className="flex items-center gap-5 group">
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:bg-gradient-to-tr group-hover:from-[#f09433] group-hover:via-[#e6683c] group-hover:to-[#bc1888] group-hover:border-transparent transition-all">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[22px] h-[22px] text-white">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-1.5">Instagram</p>
                    <p className="text-lg font-bold group-hover:text-[#E1306C] transition-colors">@chilaquiles_top</p>
                  </div>
                </a>

                <a href="https://www.tiktok.com/@chilaquiles.top?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="flex items-center gap-5 group">
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:bg-[#000000] group-hover:border-[#000000] transition-all">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[22px] h-[22px] text-white">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.96-.5 3.9-1.48 5.6-1.39 2.4-3.79 4.12-6.55 4.54-2.53.38-5.18-.08-7.24-1.55C-.14 22.09-.59 19.14.7 16.51c1.1-2.26 3.32-3.88 5.8-4.25 1.05-.15 2.12-.08 3.14.18v4.06c-.66-.1-1.33-.1-2.02-.03-1.02.1-1.95.66-2.52 1.49-.66.97-.73 2.24-.26 3.28.47 1.05 1.41 1.79 2.55 2.06 1.3.31 2.7-.04 3.65-.96 1.05-.98 1.56-2.4 1.56-3.83v-18.5Z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-1.5">TikTok</p>
                    <p className="text-lg font-bold group-hover:text-[#FFFFFF] transition-colors">@chilaquiles.top</p>
                  </div>
                </a>

                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                    <MapPin size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-1.5">Ubicación</p>
                    <p className="text-lg font-bold">Villa Nueva, Guatemala</p>
                  </div>
                </div>
              </div>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="bg-white p-7 sm:p-12 rounded-[2.5rem] sm:rounded-[3rem] text-brand-black shadow-2xl">
              <h3 className="text-2xl font-bold mb-8">Envíanos un mensaje</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 ml-1">Nombre</label>
                  <input
                    required
                    type="text"
                    placeholder="Tu nombre"
                    className="w-full p-4 rounded-2xl border-2 border-gray-100 outline-none focus:border-brand-blue transition-all font-bold placeholder:text-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 ml-1">Email</label>
                  <input
                    required
                    type="email"
                    placeholder="hola@ejemplo.com"
                    className="w-full p-4 rounded-2xl border-2 border-gray-100 outline-none focus:border-brand-blue transition-all font-bold placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 ml-1">Mensaje</label>
                <textarea
                  required
                  rows="4"
                  placeholder="¿En qué podemos ayudarte?"
                  className="w-full p-4 rounded-2xl border-2 border-gray-100 outline-none focus:border-brand-blue transition-all font-bold resize-none placeholder:text-gray-300"
                />
              </div>

              <button
                type="submit"
                disabled={formStatus === 'sending'}
                className="w-full bg-brand-blue text-white py-5 rounded-2xl font-semibold text-sm uppercase tracking-[0.15em] shadow-xl shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60"
              >
                {formStatus === 'sending' ? 'Enviando...' : formStatus === 'sent' ? '¡Mensaje enviado!' : 'Enviar mensaje'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="py-14 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <Logo className="w-32 h-auto opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
          
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
            <a href="/privacidad" className="hover:text-brand-blue transition-colors">
              Política de Privacidad
            </a>
            <span className="hidden md:inline text-gray-200">|</span>
            <a href="/terminos" className="hover:text-brand-blue transition-colors">
              Condiciones del Servicio
            </a>
            <span className="hidden md:inline text-gray-200">|</span>
            <a href="/eliminacion-datos" className="hover:text-brand-blue transition-colors">
              Eliminación de Datos
            </a>
          </div>

          <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-[0.2em] text-center md:text-right">
            © 2026 Chilaquiles TOP. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://api.whatsapp.com/send/?phone=50233019938&text&type=phone_number&app_absent=0"
        target="_blank"
        rel="noopener noreferrer"
        id="whatsapp-floating-btn"
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl shadow-[#25D366]/40 hover:scale-110 active:scale-95 transition-all group"
        aria-label="Contáctanos por WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        {/* Pulse ring animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 pointer-events-none" />
      </a>
    </div>
  )
}

export default LandingPage