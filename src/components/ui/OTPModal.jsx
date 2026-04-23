
import { useEffect, useMemo, useRef, useState } from 'react'
import Button from './Button.jsx'

const OTPModal = ({ isOpen, onClose, onVerify, onResend, isSending = false, phone = '' }) => {
  const [otp, setOtp] = useState(Array(6).fill(''))
  const inputRefs = useRef([])

  useEffect(() => {
    if (isOpen) {
      setOtp(Array(6).fill(''))
      setTimeout(() => inputRefs.current[0]?.focus(), 20)
    }
  }, [isOpen])

  const code = useMemo(() => otp.join(''), [otp])

  const handleChange = (index, value) => {
    const cleanValue = String(value).replace(/\D/g, '').slice(0, 1)
    const next = [...otp]
    next[index] = cleanValue
    setOtp(next)
    if (cleanValue && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const submit = () => {
    if (code.length === 6) onVerify(code)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[2rem] bg-ui-card border border-ui-border shadow-2xl p-6 sm:p-8 animate-fade-in">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-black text-ui-text">Ingresa tu código</h3>
            <p className="text-ui-muted mt-2 text-sm font-medium">Escribe el código enviado al {phone ? `+502 ${phone}` : 'número registrado'}.</p>
          </div>
          <button onClick={onClose} className="text-ui-muted hover:text-ui-text text-xl font-black">×</button>
        </div>

        <div className="grid grid-cols-6 gap-2 sm:gap-3 mb-6">
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
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-full h-14 rounded-2xl border border-ui-border bg-ui-bg text-center text-2xl font-black text-ui-text outline-none focus:ring-2 focus:ring-brand-blue"
              disabled={isSending}
            />
          ))}
        </div>

        <div className="space-y-3">
          <Button fullWidth onClick={submit} disabled={code.length !== 6 || isSending}>
            {isSending ? 'Validando...' : 'Confirmar código'}
          </Button>
          {onResend && (
            <Button fullWidth variant="secondary" onClick={onResend} disabled={isSending}>
              Reenviar código
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default OTPModal
