import { useState, useEffect, useRef } from 'react';
import Button from './Button';

const OTPModal = ({ isOpen, onClose, onVerify, phone, isSending }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length === 6) {
      onVerify(code);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8 animate-slide-up relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>

        <div className="text-center mb-8">
          <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Código de Seguridad</h3>
          <p className="text-gray-500">
            Enviamos un SMS con un código de 6 dígitos al número <br />
            <span className="font-bold text-gray-800">{phone}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                disabled={isSending}
              />
            ))}
          </div>

          <Button 
            type="submit" 
            className="w-full justify-center" 
            disabled={otp.join('').length !== 6 || isSending}
          >
            {isSending ? 'Verificando...' : 'Verificar Código'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          ¿No recibiste el código?{' '}
          <button onClick={onClose} className="text-brand-blue font-bold hover:underline">
            Intentar nuevamente
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPModal;
