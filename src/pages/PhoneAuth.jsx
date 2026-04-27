import { useState } from 'react'
import Button from '../components/ui/Button.jsx'
import toast from 'react-hot-toast'
import { requestClientAuthCode, verifyClientAuthCode } from '../shared/config/api.js'

export default function PhoneAuthPage({ onNext, onBack }) {
  const [step, setStep] = useState('PHONE')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const formatPhone = (val) => {
    let digits = val.replace(/\D/g, '')
    if (digits.startsWith('502')) digits = digits.slice(3)
    return digits.slice(0, 8)
  }

  const handleRequestCode = async () => {
    const formatted = formatPhone(phone)
    if (formatted.length !== 8) {
      toast.error('Ingresa un número válido de 8 dígitos')
      return
    }
    
    setLoading(true)
    try {
      await requestClientAuthCode({ phone: '+502' + formatted })
      toast.success('Código enviado por WhatsApp')
      setStep('CODE')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error enviando el código')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (code.length !== 4) {
      toast.error('El código debe tener 4 dígitos')
      return
    }

    setLoading(true)
    const formatted = formatPhone(phone)
    try {
      const response = await verifyClientAuthCode({ phone: '+502' + formatted, code })
      
      sessionStorage.setItem('chilaquiles_verified_phone', '+502' + formatted)
      sessionStorage.setItem('chilaquiles_verified_phone_local', formatted)
      
      if (response.data?.token) {
        localStorage.setItem('chila_client_token', response.data.token)
      }

      toast.success('Verificación exitosa')
      onNext()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Código incorrecto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="mb-4 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-ui-text mb-2">
          {step === 'PHONE' ? 'Verifica tu número' : 'Ingresa tu código'}
        </h2>
        <p className="text-ui-muted">
          {step === 'PHONE' 
            ? 'Te enviaremos un código por WhatsApp para validar tu pedido.' 
            : `Te enviamos un mensaje por WhatsApp al +502 ${formatPhone(phone)}`}
        </p>
      </div>

      <div className="space-y-4">
        {step === 'PHONE' ? (
          <div>
            <label className="block text-sm font-bold text-ui-text mb-1.5 ml-1">Número de teléfono</label>
            <div className="flex gap-2">
              <div className="flex items-center justify-center px-4 bg-ui-bg border border-ui-border rounded-xl font-bold text-ui-text">
                +502
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="0000 0000"
                maxLength={8}
                className="w-full p-3 sm:p-4 border border-ui-border rounded-xl bg-ui-bg text-ui-text placeholder-ui-muted focus:ring-2 focus:ring-brand-blue outline-none transition-all shadow-sm font-bold text-lg"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-bold text-ui-text mb-1.5 ml-1">Código de 4 dígitos</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="1234"
              maxLength={4}
              className="w-full p-4 border border-ui-border rounded-xl bg-ui-bg text-ui-text text-center tracking-[1em] focus:ring-2 focus:ring-brand-blue outline-none transition-all shadow-sm font-bold text-2xl"
            />
          </div>
        )}
      </div>

      <div className="flex justify-between pt-6 border-t border-ui-border mt-8 gap-3">
        <Button variant="secondary" onClick={() => step === 'CODE' ? setStep('PHONE') : onBack()}>
          Atrás
        </Button>
        <Button 
          onClick={step === 'PHONE' ? handleRequestCode : handleVerifyCode} 
          disabled={loading || (step === 'PHONE' ? phone.length !== 8 : code.length !== 4)}
        >
          {loading ? 'Procesando...' : (step === 'PHONE' ? 'Enviar código' : 'Verificar')}
        </Button>
      </div>
    </div>
  )
}
