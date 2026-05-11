import { useState } from 'react'
import Button from './Button.jsx'
import Logo from '../Logo.jsx'
import { LockKeyhole, UserRound } from 'lucide-react'

const StaffAccessCard = ({
  title,
  subtitle,
  accentClass = '!bg-brand-blue',
  authSession
}) => {
  const [loginData, setLoginData] = useState({ username: '', password: '' })

  const handleLogin = async (event) => {
    event.preventDefault()
    await authSession.loginWithCredentials(loginData)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-ui-bg via-white to-blue-50/70 relative overflow-hidden">
      <div className="absolute -top-28 -right-28 h-80 w-80 rounded-full bg-brand-blue/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-brand-orange/10 blur-3xl" />

      <div className="w-full max-w-5xl grid lg:grid-cols-[1fr_430px] gap-8 items-center relative z-10">
        <div className="hidden lg:block space-y-8">
          <div className="inline-flex rounded-[2rem] bg-white/80 border border-ui-border p-6 shadow-xl shadow-black/5">
            <Logo className="w-56 h-32" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.35em] text-brand-blue mb-4">Chilaquiles TOP</p>
            <h1 className="text-5xl font-black tracking-tight text-ui-text leading-tight">Panel operativo moderno</h1>
            <p className="text-ui-muted font-bold mt-5 max-w-md">Acceso privado para administración, cocina y reparto.</p>
          </div>
        </div>

        <div className="bg-ui-card/95 backdrop-blur-xl rounded-[2.5rem] border border-ui-border shadow-2xl p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="lg:hidden flex justify-center mb-5">
              <Logo className="w-36 h-20" />
            </div>
            <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <LockKeyhole className="text-brand-blue" size={30} />
            </div>
            <h3 className="text-3xl font-black text-ui-text tracking-tight mb-2">{title}</h3>
            <p className="text-ui-muted font-bold text-sm max-w-sm mx-auto">{subtitle}</p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="relative">
              <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted" size={18} />
              <input className="w-full p-4 pl-12 rounded-2xl border border-ui-border bg-ui-bg font-bold outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" placeholder="Usuario" value={loginData.username} onChange={(e) => setLoginData({ ...loginData, username: e.target.value })} />
            </div>
            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted" size={18} />
              <input type="password" className="w-full p-4 pl-12 rounded-2xl border border-ui-border bg-ui-bg font-bold outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" placeholder="Contraseña" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />
            </div>
            <Button type="submit" className={`w-full !py-4 shadow-xl ${accentClass}`} disabled={authSession.loading}>
              {authSession.loading ? 'Validando...' : 'Ingresar'}
            </Button>
          </form>

          {authSession.error && (
            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-600">
              {authSession.error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StaffAccessCard
