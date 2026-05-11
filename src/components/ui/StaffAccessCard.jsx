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
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-6 bg-ui-bg overflow-hidden">
      <div className="w-full max-w-[420px] bg-ui-card rounded-[2rem] border border-ui-border shadow-2xl shadow-brand-blue/10 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-blue to-brand-orange" />

        <div className="text-center mb-7">
          <div className="flex justify-center mb-5">
            <Logo className="w-44 h-28 object-contain drop-shadow-md" />
          </div>
          <div className="w-14 h-14 bg-brand-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LockKeyhole className="text-brand-blue" size={26} />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-ui-text tracking-tight mb-1">{title}</h3>
          <p className="text-ui-muted font-bold text-sm">{subtitle}</p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="relative">
            <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted" size={18} />
            <input
              className="w-full p-4 pl-12 rounded-2xl border border-ui-border bg-ui-bg font-bold outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
              placeholder="Usuario"
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
            />
          </div>
          <div className="relative">
            <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted" size={18} />
            <input
              type="password"
              className="w-full p-4 pl-12 rounded-2xl border border-ui-border bg-ui-bg font-bold outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
              placeholder="Contraseña"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            />
          </div>
          <Button type="submit" className={`w-full !py-4 shadow-xl ${accentClass}`} disabled={authSession.loading}>
            {authSession.loading ? 'Validando...' : 'Ingresar'}
          </Button>
        </form>

        {authSession.error && (
          <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-600">
            {authSession.error}
          </div>
        )}
      </div>
    </div>
  )
}

export default StaffAccessCard
