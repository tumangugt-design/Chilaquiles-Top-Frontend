// ============================================
// PÁGINA: Location (Pantalla de bienvenida + Verificación OTP)
// ============================================

import { useState, useRef, useEffect } from 'react'
import Button from '../components/ui/Button.jsx'
import Logo from '../components/Logo.jsx'
import OTPModal from '../components/ui/OTPModal.jsx'
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '../shared/config/firebase.js'
import toast from 'react-hot-toast'

const normalizeGtPhone = (raw = '') => {
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length === 8) return `+502${digits}`;
  if (digits.startsWith('502') && digits.length === 11) return `+${digits}`;
  throw new Error('Ingresa un número de Guatemala de 8 dígitos.');
};

const toGtLocalDigits = (raw = '') => {
  let digits = String(raw).replace(/\D/g, '');
  if (digits.startsWith('502')) digits = digits.slice(3);
  return digits.slice(0, 8);
};

const LocationPage = ({ onConfirm }) => {
  const [error, setError] = useState(false)
  const [step, setStep] = useState('welcome') // 'welcome' | 'phone' | 'verified'
  const [phone, setPhone] = useState('')
  const [isSendingOTP, setIsSendingOTP] = useState(false)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState(null)
  const isMountedRef = useRef(true)

  const initRecaptcha = () => {
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container-location', {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA resolved');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
          }
        }
      });
      return window.recaptchaVerifier;
    } catch (err) {
      console.error('Error initializing reCAPTCHA:', err);
      return null;
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    // Inicializamos el reCAPTCHA una sola vez al cargar la página
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container-location', {
        size: 'invisible',
        callback: () => console.log('reCAPTCHA listo'),
      });
    }

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSendOTP = async () => {
    const digits = toGtLocalDigits(phone);
    if (digits.length !== 8) {
      toast.error('Ingresa un número de 8 dígitos.');
      return;
    }

    setIsSendingOTP(true);
    try {
      const phoneNumber = normalizeGtPhone(phone);

      const verifier = window.recaptchaVerifier;
      if (!verifier) throw new Error('Seguridad no inicializada. Recarga la página.');

      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);

      if (!isMountedRef.current) return;
      setConfirmationResult(confirmation);
      setShowOTPModal(true);
      toast.success('Código enviado por SMS');
    } catch (error) {
      console.error('Error enviando SMS:', error);
      toast.error('Error de seguridad o demasiados intentos. Espera unos minutos.');
    } finally {
      if (isMountedRef.current) setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async (code) => {
    if (!confirmationResult) return;
    setIsSendingOTP(true);

    try {
      await confirmationResult.confirm(code);
      const normalizedPhone = normalizeGtPhone(phone);

      setShowOTPModal(false);
      toast.success('¡Verificado! Vamos a armar tus chilaquiles 🌮');
      onConfirm(normalizedPhone);
    } catch (error) {
      console.error('Error verificando OTP:', error);
      toast.error('Código incorrecto. Intenta de nuevo.');
    } finally {
      if (isMountedRef.current) {
        setIsSendingOTP(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl max-w-md w-full text-center relative overflow-hidden animate-slide-up">
      <div id="recaptcha-container-location"></div>
      {/* Decorative top bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-blue to-brand-orange" />

      <div className="mb-8">
        <div className="w-48 h-32 mx-auto mb-2 relative group flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
          <Logo className="w-full h-full" />
        </div>

        {step === 'welcome' && (
          <>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
              {error ? 'Ubicación no disponible' : '¿Estás en Villa Nueva?'}
            </h2>
            <p className="text-gray-500 leading-relaxed">
              {error
                ? 'Por el momento nuestro servicio es exclusivo para residentes y visitantes dentro de Villa Nueva.'
                : 'Para asegurar que tus chilaquiles lleguen crujientes y calientes, necesitamos confirmar tu ubicación.'}
            </p>
          </>
        )}

        {step === 'phone' && (
          <>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
              Verifica tu número
            </h2>
            <p className="text-gray-500 leading-relaxed">
              Te enviaremos un código SMS para confirmar tu identidad antes de iniciar.
            </p>
          </>
        )}
      </div>

      {step === 'welcome' && !error && (
        <div className="space-y-4">
          <Button fullWidth onClick={() => setStep('phone')} variant="primary" className="text-lg">
            Sí, estoy aquí
          </Button>
          <button
            onClick={() => setError(true)}
            className="block w-full py-3 text-gray-400 text-sm font-semibold hover:text-gray-600 transition-colors"
          >
            No, cambiar ubicación
          </button>
        </div>
      )}

      {step === 'welcome' && error && (
        <div className="space-y-4">
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-4">
            Lo sentimos, no podemos procesar tu pedido fuera del área de cobertura.
          </div>
          <Button variant="secondary" fullWidth onClick={() => setError(false)}>
            Volver a intentar
          </Button>
        </div>
      )}

      {step === 'phone' && (
        <div className="space-y-5">
          <div className="text-left">
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Número de WhatsApp</label>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-100 px-3 py-3.5 rounded-xl border border-gray-200">
                <span className="text-sm font-bold text-gray-600">🇬🇹 +502</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(toGtLocalDigits(e.target.value))}
                placeholder="33662977"
                maxLength={8}
                inputMode="numeric"
                autoFocus
                className="flex-1 p-3.5 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-blue outline-none transition-all shadow-sm text-lg font-bold tracking-wider"
              />
            </div>
          </div>

          <Button
            fullWidth
            onClick={handleSendOTP}
            disabled={toGtLocalDigits(phone).length !== 8 || isSendingOTP}
            className="text-lg"
          >
            {isSendingOTP ? 'Enviando código...' : 'Verificar número →'}
          </Button>

          <button
            onClick={() => { setStep('welcome'); setPhone(''); }}
            className="block w-full py-2 text-gray-400 text-sm font-semibold hover:text-gray-600 transition-colors"
          >
            ← Volver
          </button>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs font-semibold text-gray-400">Servicio activo en zona</span>
        </div>
      </div>

      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerify={handleVerifyOTP}
        isSending={isSendingOTP}
        phone={toGtLocalDigits(phone)}
      />
    </div>
  )
}

export default LocationPage
