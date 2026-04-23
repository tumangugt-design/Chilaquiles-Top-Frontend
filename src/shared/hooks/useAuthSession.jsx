
import { useEffect, useState } from 'react'
import { authStaffLogin, registerStaff, getSession, setStaffToken, clearStaffToken, getStaffToken } from '../config/api.js'

export const useAuthSession = (panelRole) => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refreshSession = async ({ showUnauthorizedAlert = false } = {}) => {
    const token = getStaffToken()
    if (!token) {
      setSession(null)
      setLoading(false)
      return null
    }

    try {
      const response = await getSession()
      const user = response?.data?.user || null

      if (!user) {
        clearStaffToken()
        setSession(null)
        setError('No se pudo validar la sesión.')
        return null
      }

      if (panelRole && user.role !== panelRole) {
        const message = 'Esta cuenta no tiene permitido acceder a este panel.'
        clearStaffToken()
        setSession(null)
        setError(message)
        if (showUnauthorizedAlert) window.alert(message)
        return null
      }

      setSession(user)
      setError('')
      return user
    } catch (sessionError) {
      clearStaffToken()
      setSession(null)
      setError('No se pudo validar la sesión.')
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshSession()
  }, [panelRole])

  const loginWithCredentials = async ({ username, password }) => {
    try {
      setLoading(true)
      setError('')
      const response = await authStaffLogin({ username, password, role: panelRole })
      setStaffToken(response.data.token)
      await refreshSession({ showUnauthorizedAlert: true })
      return true
    } catch (loginError) {
      setError(loginError.response?.data?.message || 'No se pudo iniciar sesión.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const registerStaffRequest = async ({ name, phone, username, password }) => {
    try {
      setLoading(true)
      setError('')
      const response = await registerStaff({ name, phone, username, password, role: panelRole })
      return response.data
    } catch (registerError) {
      const message = registerError.response?.data?.message || 'No se pudo crear la solicitud.'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    clearStaffToken()
    setSession(null)
    setError('')
  }

  return {
    session,
    loading,
    error,
    loginWithCredentials,
    registerStaffRequest,
    logout,
    refreshSession,
  }
}
