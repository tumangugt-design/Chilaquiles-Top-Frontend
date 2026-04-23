
import { useState } from 'react'
import Button from './Button.jsx'

const normalizeGtPhone = (raw = '') => {
  const digits = String(raw).replace(/\D/g, '')
  if (!digits) return ''
  if (digits.length === 8) return `+502${digits}`
  if (digits.startsWith('502') && digits.length === 11) return `+${digits}`
  return raw
}

const StaffAccessCard = ({
  title,
  subtitle,
  accentClass = '!bg-brand-blue',
  authSession,
  allowRequest = false,
}) => {
  const [mode, setMode] = useState('login')
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  const [requestData, setRequestData] = useState({ name: '', phone: '', username: '', password: '' })
  const [message, setMessage] = useState('')

  const handleLogin = async (event) => {
    event.preventDefault()
    const ok = await authSession.loginWithCredentials(loginData)
    if (ok) setMessage('')
  }

  const handleRequest = async (event) => {
    event.preventDefault()
    try {
      await authSession.registerStaffRequest({
        ...requestData,
        phone: normalizeGtPhone(requestData.phone),
      })
      setMessage('Solicitud enviada. Un administrador debe aprobar tu acceso.')
      setMode('login')
      setRequestData({ name: '', phone: '', username: '', password: '' })
    } catch {
      // handled in hook
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8" />
        </svg>
      </div>
      <h3 className="text-2xl font-black text-ui-text mb-2">{title}</h3>
      <p className="text-ui-muted max-w-sm mb-8">{subtitle}</p>

      {allowRequest && (
        <div className="mb-5 flex gap-2 rounded-2xl bg-ui-bg p-1 border border-ui-border">
          <button type="button" className={`px-4 py-2 rounded-xl text-sm font-black ${mode === 'login' ? 'bg-ui-card text-ui-text' : 'text-ui-muted'}`} onClick={() => setMode('login')}>Ingresar</button>
          <button type="button" className={`px-4 py-2 rounded-xl text-sm font-black ${mode === 'request' ? 'bg-ui-card text-ui-text' : 'text-ui-muted'}`} onClick={() => setMode('request')}>Solicitar acceso</button>
        </div>
      )}

      {mode === 'login' ? (
        <form className="w-full max-w-sm space-y-4" onSubmit={handleLogin}>
          <input className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg font-bold" placeholder="Usuario" value={loginData.username} onChange={(e) => setLoginData({ ...loginData, username: e.target.value })} />
          <input type="password" className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg font-bold" placeholder="Contraseña" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />
          <Button type="submit" className={`w-full !py-4 shadow-xl ${accentClass}`} disabled={authSession.loading}>
            {authSession.loading ? 'Validando...' : 'Ingresar'}
          </Button>
        </form>
      ) : (
        <form className="w-full max-w-sm space-y-4" onSubmit={handleRequest}>
          <input className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg font-bold" placeholder="Nombre completo" value={requestData.name} onChange={(e) => setRequestData({ ...requestData, name: e.target.value })} />
          <input className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg font-bold" placeholder="Teléfono" value={requestData.phone} onChange={(e) => setRequestData({ ...requestData, phone: e.target.value })} />
          <input className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg font-bold" placeholder="Usuario" value={requestData.username} onChange={(e) => setRequestData({ ...requestData, username: e.target.value.toLowerCase() })} />
          <input type="password" className="w-full p-4 rounded-2xl border border-ui-border bg-ui-bg font-bold" placeholder="Contraseña" value={requestData.password} onChange={(e) => setRequestData({ ...requestData, password: e.target.value })} />
          <Button type="submit" className={`w-full !py-4 shadow-xl ${accentClass}`} disabled={authSession.loading}>
            {authSession.loading ? 'Enviando...' : 'Enviar solicitud'}
          </Button>
        </form>
      )}

      {(message || authSession.error) && (
        <div className="mt-6 w-full max-w-sm rounded-2xl border border-ui-border bg-ui-bg/60 p-4 text-sm font-bold text-ui-text">
          {message || authSession.error}
        </div>
      )}
    </div>
  )
}

export default StaffAccessCard
