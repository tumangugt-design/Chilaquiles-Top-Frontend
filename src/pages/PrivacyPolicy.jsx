import { ArrowLeft, Shield } from 'lucide-react'
import Logo1 from '../components/Logo1.jsx'

const PrivacyPolicy = () => {
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
            <Shield size={32} />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Política de <span className="text-brand-blue">Privacidad</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base font-semibold uppercase tracking-widest">
            Última actualización: 18 de mayo de 2026
          </p>
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="prose prose-lg text-gray-600 font-medium leading-relaxed space-y-12">
            
            <div className="bg-blue-50/30 p-8 rounded-3xl border border-brand-blue/5">
              <p className="m-0 text-brand-black text-lg">
                En <strong>Chilaquiles TOP</strong>, valoramos y respetamos tu privacidad. Esta Política de Privacidad describe cómo recopilamos, utilizamos y protegemos la información personal que nos proporcionas cuando utilizas nuestra plataforma web de pedidos en línea o interactúas con nuestros servicios.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-black flex items-center gap-3">
                <span className="text-brand-blue font-bold">1.</span> Información que Recopilamos
              </h2>
              <p>
                Recopilamos información necesaria para brindarte la mejor experiencia de usuario y procesar tus pedidos de manera eficiente. Esto incluye:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-500">
                <li><strong>Información de contacto:</strong> Nombre completo, número de teléfono (para confirmaciones y entregas vía WhatsApp o llamada) y dirección de correo electrónico.</li>
                <li><strong>Detalles de Entrega:</strong> Dirección exacta de entrega y coordenadas de geolocalización (si decides compartirlas) para asegurar que tus chilaquiles lleguen calientes y a tiempo.</li>
                <li><strong>Información de Pedidos:</strong> Tu selección y personalización de chilaquiles, complementos, hora del pedido e historial de compras.</li>
                <li><strong>Información Técnica:</strong> Dirección IP, tipo de navegador, sistema operativo y cookies utilizadas para mantener tu sesión activa y mejorar el rendimiento del sitio.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-black flex items-center gap-3">
                <span className="text-brand-blue font-bold">2.</span> Uso de la Información
              </h2>
              <p>
                Utilizamos los datos recopilados únicamente con fines operativos y de mejora del servicio, incluyendo:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-500">
                <li>Procesar, preparar y entregar tus pedidos de chilaquiles.</li>
                <li>Enviarte actualizaciones del estado de tu pedido en tiempo real a través de notificaciones y mensajes de WhatsApp.</li>
                <li>Facilitar el soporte al cliente y resolver cualquier duda o incidencia con tu entrega.</li>
                <li>Optimizar el rendimiento y la seguridad de nuestra aplicación web.</li>
                <li>Cumplir con obligaciones legales y requerimientos regulatorios.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-black flex items-center gap-3">
                <span className="text-brand-blue font-bold">3.</span> Compartido de Datos
              </h2>
              <p>
                <strong>No vendemos ni alquilamos tus datos personales a terceros.</strong> Compartimos tu información únicamente con socios estratégicos que nos ayudan a operar el servicio:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-500">
                <li><strong>Repartidores y Personal de Cocina:</strong> Únicamente la información indispensable (nombre, teléfono y dirección) para entregar tu pedido de forma exitosa.</li>
                <li><strong>Proveedores de Servicios de Infraestructura:</strong> Herramientas de base de datos y hosting de confianza (como Firebase y Vercel) que cumplen con altos estándares de seguridad tecnológica.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-black flex items-center gap-3">
                <span className="text-brand-blue font-bold">4.</span> Seguridad de los Datos
              </h2>
              <p>
                Implementamos medidas de seguridad técnicas y organizativas robustas para proteger tus datos personales contra accesos no autorizados, alteraciones, divulgación o destrucción. Esto incluye cifrado SSL en tránsito, restricciones de acceso a bases de datos y monitoreo de seguridad activo.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-black flex items-center gap-3">
                <span className="text-brand-blue font-bold">5.</span> Tus Derechos y Eliminación de Datos
              </h2>
              <p>
                Tienes derecho a acceder, rectificar o solicitar la eliminación total de tus datos personales de nuestros sistemas en cualquier momento. 
              </p>
              <p>
                Para ejercer tu derecho a la eliminación de datos, puedes visitar nuestra página dedicada a la{' '}
                <a href="/eliminacion-datos" className="text-brand-blue hover:underline font-bold transition-all">
                  Eliminación de Datos de Usuario
                </a>{' '}
                o contactarnos directamente en nuestro correo de soporte.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-black flex items-center gap-3">
                <span className="text-brand-blue font-bold">6.</span> Cambios a esta Política
              </h2>
              <p>
                Nos reservamos el derecho de actualizar esta Política de Privacidad periódicamente para reflejar cambios en nuestras prácticas comerciales o requisitos legales. Publicaremos cualquier cambio en esta misma página con una fecha de actualización revisada.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-black flex items-center gap-3">
                <span className="text-brand-blue font-bold">7.</span> Contacto
              </h2>
              <p>
                Si tienes preguntas, dudas o comentarios acerca de esta Política de Privacidad o de cómo gestionamos tus datos, por favor contáctanos en:
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

export default PrivacyPolicy
