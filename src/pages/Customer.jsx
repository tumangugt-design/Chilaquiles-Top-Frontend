import { useState } from 'react';
import Button from '../components/ui/Button.jsx';
import { authClientLogin, createOrder } from '../shared/config/api.js';
import toast from 'react-hot-toast';

const toGtLocalDigits = (raw = '') => {
  let digits = String(raw).replace(/\D/g, '');
  if (digits.startsWith('502')) digits = digits.slice(3);
  return digits.slice(0, 8);
};

const CustomerPage = ({ order, updateOrder, setLastOrder, onNext, onBack, phoneVerified }) => {
  const [localData, setLocalData] = useState({
    name: order.customer?.name || '',
    address: order.customer?.address || '',
    location: order.customer?.location || null
  });
  const [touched, setTouched] = useState({ name: false, address: false });
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...localData, [name]: value };
    setLocalData(newData);
    updateOrder({ customer: { ...order.customer, ...newData } });
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
        updateOrder({ customer: { ...order.customer, ...newData } });
        setLoadingLoc(false);
        toast.success('Ubicación obtenida');
      },
      () => {
        toast.error('No pudimos obtener tu ubicación. Por favor ingrésala manualmente.');
        setLoadingLoc(false);
      }
    );
  };

  const isValid = localData.name.trim().length > 2 && localData.address.trim().length > 5;

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsSubmitting(true);

    try {
      const payloadCustomer = {
        ...order.customer,
        name: localData.name,
        address: localData.address,
        location: localData.location
      };

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
      toast.success('¡Pedido enviado con éxito! 🌮');
      onNext();
    } catch (error) {
      console.error('Error creando pedido:', error);
      toast.error(error.response?.data?.message || error?.message || 'Error al crear pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="mb-4 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-ui-text mb-2">Tus datos</h2>
        <p className="text-ui-muted">
          {phoneVerified
            ? `Número verificado: ${toGtLocalDigits(order.customer?.phone || '')} ✅`
            : 'Completa tus datos para finalizar el pedido.'}
        </p>
      </div>

      <div className="space-y-4 sm:space-y-5">
        {/* Verified phone badge */}
        {phoneVerified && order.customer?.phone && (
          <div className="flex items-center space-x-3 bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase">WhatsApp Verificado</p>
              <p className="text-sm font-black text-green-800 dark:text-green-300">+502 {toGtLocalDigits(order.customer.phone)}</p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-ui-text mb-1.5 ml-1">Nombre completo</label>
          <input type="text" name="name" value={localData.name} onChange={handleChange} onBlur={() => setTouched({ ...touched, name: true })} placeholder="Ej. Juan Pérez" className={`w-full p-3 sm:p-4 border rounded-xl bg-ui-bg text-ui-text placeholder-ui-muted focus:ring-2 focus:ring-brand-blue outline-none transition-all shadow-sm ${touched.name && localData.name.length <= 2 ? 'border-red-500' : 'border-ui-border'}`} />
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
        <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>{isSubmitting ? 'Enviando...' : 'Confirmar Pedido →'}</Button>
      </div>
    </div>
  );
};

export default CustomerPage;
