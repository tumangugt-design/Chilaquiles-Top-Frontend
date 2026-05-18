import { ArrowLeft, FileText } from 'lucide-react'
import Logo1 from '../components/Logo1.jsx'

const TermsOfService = () => {
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-blue/10 text-brand-blue mb-6 animate-bounce" style={{ animationDuration: '3s' }}>
            <FileText size={32} />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Condiciones del <span className="text-brand-blue">Servicio</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base font-semibold uppercase tracking-widest">
            Última actualización: 18 de mayo de 2026
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="prose prose-lg text-gray-600 font-medium leading-relaxed space-y-12">
            
            <div className="bg-blue-50/30 p-8 rounded-3xl border border-brand-blue/5">
              <p className="m-0 text-brand-black text-lg">
                Te damos la bienvenida a <strong>Chilaquiles TOP</strong>. Al acceder, navegar o realizar pedidos a través de nuestra plataforma web, aceptas quedar vinculado por las presentes Condiciones del Servicio. Por favor, léelas detenidamente antes de utilizar nuestro sitio.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-black flex items-center gap-3">
                <span className="text-brand-blue font-bold">1.</span> Aceptación de los Términos
              </h2>
              <p>
                Al utilizar la aplicación web de Chilaquiles TOP y realizar un pedido, confirmas que eres mayor de edad o cuentas con el consentimiento de tus padres o tutores legales, y que aceptas plenamente estas condiciones. Si no estás de acuerdo con alguna de las cláusulas, debes abstenerte de utilizar nuestro sitio.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-black flex items-center gap-3">
                <span className="text-brand-blue font-bold">2.</span> Pedidos y Personalización
              </h2>
              <p>
                Nuestra plataforma te permite personalizar tus platos de chilaquiles (eligiendo tamaño, salsa, proteína y complementos). 
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-500">
                <li><strong>Disponibilidad:</strong> Todos los pedidos están sujetos a la disponibilidad de ingredientes en cocina y al límite de platos diarios disponibles. El contador en la parte superior te indicará si aún quedan platos disponibles para preparar hoy.</li>
                <li><strong>Preparación al momento:</strong> Dado que preparamos tus alimentos inmediatamente después de confirmarse el pedido, no se admiten cambios en la personalización una vez que la orden ha entrado en estado de preparación.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-black flex items-center gap-3">
                <span className="text-brand-blue font-bold">3.</span> Precios y Pago
              </h2>
              <p>
                Los precios de nuestros productos se muestran en Quetzales (GTQ) e incluyen los impuestos aplicables en Guatemala.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-500">
                <li><strong>Tarifas:</strong> Nos reservamos el derecho de modificar los precios en cualquier momento sin previo aviso. Sin embargo, se te cobrará el precio vigente mostrado al momento de enviar tu pedido.</li>
                <li><strong>Métodos de Pago:</strong> Ofrecemos pago en efectivo al recibir tu pedido (contra entrega) o mediante métodos de pago digital integrados en la plataforma, según disponibilidad al momento del pago.</li>
                <li><strong>Cargos de Envío:</strong> Los costos de envío o entrega a domicilio varían de acuerdo a tu ubicación exacta y se desglosarán claramente en el resumen de tu pedido antes de finalizar la compra.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-black flex items-center gap-3">
                <span className="text-brand-blue font-bold">4.</span> Políticas de Entrega a Domicilio
              </h2>
              <p>
                Para garantizar una entrega exitosa, el usuario se compromete a:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-500">
                <li>Proporcionar una dirección de entrega exacta y completa, y/o compartir su ubicación de GPS precisa en nuestro mapa.</li>
                <li>Estar disponible en el número telefónico registrado para recibir llamadas de confirmación de nuestro equipo o de nuestros repartidores.</li>
                <li>Estar presente en el domicilio al momento de la entrega o designar a un tercero para que reciba el pedido y realice el pago en efectivo (si aplica).</li>
              </ul>
              <p>
                No nos hacemos responsables por entregas fallidas resultantes de direcciones incorrectas, falta de comunicación telefónica con el cliente o ausencia de personas autorizadas en la ubicación indicada al momento de la llegada de nuestro repartidor.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-black flex items-center gap-3">
                <span className="text-brand-blue font-bold">5.</span> Cancelaciones y Devoluciones
              </h2>
              <p>
                Debido a la naturaleza perecedera de nuestros alimentos preparados al momento:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-500">
                <li><strong>Cancelaciones:</strong> Podrás solicitar la cancelación de tu pedido únicamente dentro de los primeros 3 minutos posteriores a haberlo confirmado y siempre y cuando nuestra cocina no haya iniciado su preparación.</li>
                <li><strong>Devoluciones:</strong> Si consideras que tu pedido llegó dañado, incompleto o no coincide con tu personalización, debes contactarnos de inmediato al teléfono de soporte o enviar un mensaje detallado a nuestro WhatsApp corporativo con fotografías del plato para evaluar el reembolso o reposición de tu comida.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-black flex items-center gap-3">
                <span className="text-brand-blue font-bold">6.</span> Propiedad Intelectual
              </h2>
              <p>
                Todos los contenidos expuestos en esta plataforma web, incluyendo el logotipo de Chilaquiles TOP, marcas comerciales, imágenes, textos, diseños, ilustraciones, código de programación y bases de datos son propiedad exclusiva de Chilaquiles TOP o de sus respectivos licenciantes, y están protegidos por las leyes de propiedad intelectual internacionales y de la República de Guatemala. Queda estrictamente prohibida la reproducción, distribución o alteración no autorizada de estos materiales.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-black flex items-center gap-3">
                <span className="text-brand-blue font-bold">7.</span> Limitación de Responsabilidad
              </h2>
              <p>
                Chilaquiles TOP realiza sus mejores esfuerzos para garantizar la disponibilidad continua del servicio web y entregas puntuales. Sin embargo, no nos responsabilizamos por retrasos causados por condiciones climáticas extremas, congestionamiento vehicular severo, accidentes de tránsito, fallas de conectividad en redes móviles o interrupciones técnicas imprevistas de nuestro proveedor de servidores.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-black flex items-center gap-3">
                <span className="text-brand-blue font-bold">8.</span> Modificaciones a las Condiciones
              </h2>
              <p>
                Nos reservamos el derecho de modificar estas condiciones en cualquier momento para reflejar actualizaciones comerciales o cambios legislativos. Te recomendamos revisar esta página de manera habitual para estar al tanto de los términos vigentes.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-black flex items-center gap-3">
                <span className="text-brand-blue font-bold">9.</span> Contacto
              </h2>
              <p>
                Para cualquier duda, aclaración o sugerencia sobre estas Condiciones del Servicio, ponte en contacto con nuestro equipo:
              </p>
              <div className="bg-brand-black text-white p-6 rounded-3xl border border-white/5 space-y-2 mt-4 font-brand">
                <p className="m-0"><strong>Chilaquiles TOP Guatemala</strong></p>
                <p className="m-0 text-gray-400">Email: <a href="mailto:contacto@chilaquilestop.com" className="text-brand-blue hover:underline font-bold">contacto@chilaquilestop.com</a></p>
                <p className="m-0 text-gray-400">Villa Nueva, Guatemala</p>
              </div>
            </div>

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

export default TermsOfService
