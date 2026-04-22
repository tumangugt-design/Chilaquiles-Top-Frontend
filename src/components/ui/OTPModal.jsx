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
    const cleanValue = String(value).replace(/\D/g, '').slice(0, 1)

    const newOtp = [...otp]
    newOtp[index] = cleanValue
    setOtp(newOtp)

    if (cleanValue !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus()
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ui-bg/60 backdrop-blur-md animate-fade-in">
      <div className="bg-ui-card rounded-[2rem] shadow-2xl w-full max-w-md p-8 sm:p-10 animate-slide-up relative border border-ui-border">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-ui-muted hover:text-ui-text transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-2xl font-black text-ui-text mb-2 tracking-tighter">Verificación OTP</h3>
          <p className="text-ui-muted font-medium">
            Ingresa el código enviado a <br />
            <span className="font-bold text-ui-text">{phone}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-black text-ui-text bg-ui-bg border border-ui-border rounded-2xl focus:bg-ui-card focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all shadow-sm"
                disabled={isSending}
              />
            ))}
          </div>

          <Button
            type="submit"
            className="w-full !py-5 text-base shadow-xl shadow-brand-blue/20"
            disabled={otp.join('').length !== 6 || isSending}
          >
            {isSending ? 'Verificando...' : 'Confirmar Acceso'}
          </Button>
        </form>

        <div className="mt-8 text-center text-xs sm:text-sm text-ui-muted font-medium uppercase tracking-widest opacity-80">
          ¿No recibiste el código?{' '}
          <button onClick={onClose} className="text-brand-blue font-black hover:underline ml-1">
            Reenviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPModal;
