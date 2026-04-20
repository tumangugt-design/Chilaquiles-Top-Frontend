import { useEffect, useRef, useState } from 'react';
import Button from '../components/ui/Button.jsx';
import OTPModal from '../components/ui/OTPModal.jsx';
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '../shared/config/firebase.js';
import { authClientLogin, createOrder } from '../shared/config/api.js';
import toast from 'react-hot-toast';

const normalizeGtPhone = (raw = '') => {
  const digits = String(raw).replace(/\D/g, '');

  if (digits.length === 8) return `+502${digits}`;
  if (digits.startsWith('502') && digits.length === 11) return `+${digits}`;
  if (digits.startsWith('502') && digits.length === 8) return `+${digits}`;

  throw new Error('Ingresa un número de Guatemala de 8 dígitos.');
};

const toGtLocalDigits = (raw = '') => {
  let digits = String(raw).replace(/\D/g, '');
  if (digits.startsWith('502')) digits = digits.slice(3);
  return digits.slice(0, 8);
};

const CustomerPage = ({ order, updateOrder, setLastOrder, onNext, onBack }) => {
  const [localData, setLocalData] = useState({
    ...order.customer,
    phone: toGtLocalDigits(order.customer?.phone || '')
  });
  const [touched, setTouched] = useState({ name: false, phone: false, address: false });
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const recaptchaVerifierRef = useRef(null);
  const recaptchaWidgetIdRef = useRef(null);
  const isMountedRef = useRef(true);

  const initRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => {
          if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
          }
        }
      });
    }
    return window.recaptchaVerifier;
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const normalizedValue = name === 'phone' ? toGtLocalDigits(value) : value;
    const newData = { ...localData, [name]: normalizedValue };
    setLocalData(newData);
    updateOrder({ customer: { ...newData, phone: normalizedValue } });
  };

  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      toast.error('La geolocalización no es soportada por tu navegador.');
      return;
    }

    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const mapsLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        const newData = {
          ...localData,
          address: localData.address || `Ubicación compartida: ${mapsLink}`,
          location: { lat, lng }
        };
        setLocalData(newData);
        updateOrder({ customer: { ...newData, phone: localData.phone } });
        setLoadingLoc(false);
        toast.success('Ubicación obtenida');
      },
      () => {
        toast.error('No pudimos obtener tu ubicación. Por favor ingrésala manualmente.');
        setLoadingLoc(false);
      }
    );
  };

  const isValid = localData.name.trim().length > 2 && toGtLocalDigits(localData.phone).length === 8 && localData.address.trim().length > 5;

  const handleSendOTP = async () => {
    if (!isValid) return;
    setIsSendingOTP(true);

    try {
      const phoneNumber = normalizeGtPhone(localData.phone);
      const verifier = initRecaptcha();
      
      // We must render it before using it in signInWithPhoneNumber
      try {
        await verifier.render();
      } catch (renderError) {
        // If it's already rendered, it might throw, but we can safely ignore or log it
        console.log('Recaptcha already rendered or error:', renderError);
      }

      console.log('Sending OTP to:', phoneNumber);
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      console.log('OTP sent successfully, confirmation result received');

      if (!isMountedRef.current) {
        console.log('Component unmounted, skipping state updates');
        return;
      }

      setConfirmationResult(confirmation);
      setShowOTPModal(true);
      console.log('Modal state set to true');
      toast.success('Código enviado por SMS');
    } catch (error) {
      console.error('Error enviando SMS:', error);
      
      // On error, reset reCAPTCHA
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      toast.error(error?.message || 'Error al enviar el código. Revisa tu número.');
    } finally {
      if (isMountedRef.current) {
        setIsSendingOTP(false);
      }
    }
  };

  const handleVerifyOTP = async (code) => {
    if (!confirmationResult) return;
    setIsSendingOTP(true);

    try {
      await confirmationResult.confirm(code);
      const normalizedPhone = normalizeGtPhone(localData.phone);
      const payloadCustomer = { ...localData, phone: normalizedPhone };

      await authClientLogin(payloadCustomer);
      const allItems = [...order.cart, order.currentPlate];
      const response = await createOrder({
        customer: payloadCustomer,
        items: allItems.map((item) => ({
          sauce: item.sauce,
          protein: item.protein,
          complement: item.complement,
          baseRecipe: item.baseRecipe
        }))
      });
      setLastOrder(response.data.order);
      setShowOTPModal(false);
      toast.success('Pedido enviado con éxito');
      onNext();
    } catch (error) {
      console.error('Error verificando OTP o creando pedido:', error);
      toast.error(error.response?.data?.message || error?.message || 'Código incorrecto o error al crear pedido.');
    } finally {
      if (isMountedRef.current) {
        setIsSendingOTP(false);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div id="recaptcha-container"></div>
      <div className="mb-4 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-ui-text mb-2">Tus datos</h2>
        <p className="text-ui-muted">Tu sesión es invisible: solo verificamos OTP antes de guardar el pedido.</p>
      </div>

      <div className="space-y-4 sm:space-y-5">
        <div>
          <label className="block text-sm font-bold text-ui-text mb-1.5 ml-1">Nombre completo</label>
          <input type="text" name="name" value={localData.name} onChange={handleChange} onBlur={() => setTouched({ ...touched, name: true })} placeholder="Ej. Juan Pérez" className={`w-full p-3 sm:p-4 border rounded-xl bg-ui-bg text-ui-text placeholder-ui-muted focus:ring-2 focus:ring-brand-blue outline-none transition-all shadow-sm ${touched.name && localData.name.length <= 2 ? 'border-red-500' : 'border-ui-border'}`} />
        </div>
        <div>
          <label className="block text-sm font-bold text-ui-text mb-1.5 ml-1">Número de Whatsapp</label>
          <input type="tel" name="phone" value={localData.phone} onChange={handleChange} onBlur={() => setTouched({ ...touched, phone: true })} placeholder="Ej. 33662977" maxLength={8} inputMode="numeric" className={`w-full p-3 sm:p-4 border rounded-xl bg-ui-bg text-ui-text placeholder-ui-muted focus:ring-2 focus:ring-brand-blue outline-none transition-all shadow-sm ${touched.phone && toGtLocalDigits(localData.phone).length < 8 ? 'border-red-500' : 'border-ui-border'}`} />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1.5 ml-1">
            <label className="block text-sm font-bold text-ui-text">Dirección exacta</label>
            <button type="button" onClick={handleLocationClick} disabled={loadingLoc} className="text-xs font-bold text-brand-blue hover:text-blue-700 flex items-center bg-brand-blue/10 px-2 py-1 rounded-md transition-colors">
              {loadingLoc ? 'Obteniendo...' : '📍 Usar mi ubicación'}
            </button>
          </div>
          <textarea name="address" rows={3} value={localData.address} onChange={handleChange} onBlur={() => setTouched({ ...touched, address: true })} placeholder="Casa, calle, número, referencia..." className={`w-full p-3 sm:p-4 border rounded-xl bg-ui-bg text-ui-text placeholder-ui-muted focus:ring-2 focus:ring-brand-blue outline-none resize-none transition-all shadow-sm ${touched.address && localData.address.length <= 5 ? 'border-red-500' : 'border-ui-border'}`} />
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-ui-border mt-8 gap-3">
        <Button variant="secondary" onClick={onBack}>Atrás</Button>
        <Button onClick={handleSendOTP} disabled={!isValid || isSendingOTP}>{isSendingOTP ? 'Enviando...' : 'Confirmar Pedido →'}</Button>
      </div>

      <OTPModal isOpen={showOTPModal} onClose={() => setShowOTPModal(false)} onVerify={handleVerifyOTP} isSending={isSendingOTP} phone={toGtLocalDigits(localData.phone || '')} />
    </div>
  );
};

export default CustomerPage;
