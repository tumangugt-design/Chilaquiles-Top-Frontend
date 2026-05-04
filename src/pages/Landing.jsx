import { useState, useEffect, useRef } from 'react'
import { Mail, MapPin, ArrowRight, ChevronDown } from 'lucide-react'
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
  const formRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-black/5 py-3' : 'bg-transparent py-5'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo className="w-36 sm:w-44 h-auto cursor-pointer transition-transform hover:scale-105" />
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
            className="bg-brand-blue text-white px-8 py-3.5 rounded-full font-semibold text-xs uppercase tracking-[0.15em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-blue/25"
          >
            Pedir Ahora
          </a>
        </div>
      </nav>

      <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute top-0 right-0 w-[55%] h-full bg-blue-50/60 rounded-bl-[6rem] -z-10 hidden lg:block" />
        <div className="absolute top-20 right-[15%] w-[400px] h-[400px] rounded-full bg-brand-blue/5 blur-3xl -z-10" />
        <div className="absolute bottom-10 left-[5%] w-[200px] h-[200px] rounded-full bg-brand-blue/3 blur-2xl -z-10" />

        <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 items-center pt-32 pb-20 lg:pt-40 lg:pb-0">
          <div className="animate-fade-in z-10">
            <h1 className="text-[2.6rem] sm:text-[3.5rem] lg:text-[4.2rem] font-bold leading-[0.95] tracking-[-0.03em] mb-8">
              Los <span className="text-brand-blue">primeros y mejores</span> chilaquiles de{' '}
              <span className="text-brand-blue">Guatemala</span>
            </h1>

            <p className="text-gray-400 text-lg sm:text-xl font-medium mb-12 max-w-md leading-relaxed">
              Personaliza tus chilaquiles favoritos y vive una experiencia de sabor sin igual.
            </p>

            <a
              href="https://pedidos.chilaquilestop.com/clientes"
              className="inline-flex items-center gap-3 bg-brand-blue text-white px-12 py-5 rounded-full font-semibold text-sm uppercase tracking-[0.15em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-blue/30 group"
            >
              Ordenar Ahora
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
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

      <section id="historia" className="py-28 lg:py-40 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white -z-10" />
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-brand-blue/10 text-brand-blue px-5 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] mb-6">
              Nuestra Historia
            </div>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1]">
              Aquí
              <br />
              TODO es <span className="text-brand-blue">TOP</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {[
              {
                num: '01',
                title: 'Comida',
                desc: 'Ingredientes frescos seleccionados diariamente: salsas artesanales, proteínas premium y complementos de primera para el plato perfecto.',
              },
              {
                num: '02',
                title: 'Experiencia',
                desc: 'Arma tu plato ideal desde tu celular en segundos. Seguimiento en tiempo real desde la cocina hasta tu puerta, sin complicaciones.',
              },
              {
                num: '03',
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
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="inline-block bg-white/10 text-white px-5 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] mb-8">
                Contáctanos
              </div>
              <h2 className="text-5xl sm:text-7xl font-bold tracking-tighter mb-8 leading-[0.95]">
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

            <form ref={formRef} onSubmit={handleSubmit} className="bg-white p-10 sm:p-12 rounded-[3rem] text-brand-black shadow-2xl">
              <h3 className="text-2xl font-bold mb-8">Envíanos un mensaje</h3>

              <div className="grid grid-cols-2 gap-5 mb-5">
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
          <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-[0.2em]">
            © 2026 Chilaquiles TOP. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage