import axios from 'axios'

let API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api'
if (API_URL.startsWith('http://') && !API_URL.includes('localhost') && !API_URL.includes('127.0.0.1')) {
  API_URL = API_URL.replace('http://', 'https://')
}

export const STAFF_TOKEN_KEY = 'chila_staff_token'

export const setStaffToken = (token) => {
  if (token) localStorage.setItem(STAFF_TOKEN_KEY, token)
}

export const clearStaffToken = () => localStorage.removeItem(STAFF_TOKEN_KEY)
export const getStaffToken = () => localStorage.getItem(STAFF_TOKEN_KEY)

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getStaffToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authStaffLogin = (payload) => api.post('/auth/staff/login', payload)
export const getSession = () => api.get('/auth/session')
export const createOrder = (payload) => api.post('/orders', payload)
export const getOrders = (status) => api.get(`/orders?t=${Date.now()}${status ? `&status=${status}` : ''}`)
export const updateOrderStatus = (orderId, status) => api.patch(`/orders/${orderId}/status`, { status })
export const clearDeliveredOrders = () => api.post('/orders/clear-delivered')
export const createStaffUser = (payload) => api.post('/users/staff', payload)
export const updateStaffUser = (userId, payload) => api.patch(`/users/staff/${userId}`, payload)
export const deleteUser = (userId) => api.delete(`/users/staff/${userId}`)
export const getUsersByRole = (role) => api.get(`/users/role/${encodeURIComponent(role)}?t=${Date.now()}`)
export const getUserOrderHistory = (type, userId) => api.get(`/orders/history?type=${encodeURIComponent(type)}&userId=${encodeURIComponent(userId)}&t=${Date.now()}`)
export const updateProfile = (payload) => api.patch('/users/profile', payload)
export const getInventory = () => api.get(`/inventory?t=${Date.now()}`)
export const getAvailablePlates = () => api.get('/inventory/available')
export const getPublicInventoryOptions = () => api.get('/inventory/public-options')
export const saveInventoryItem = (payload) => api.post('/inventory', payload)
export const deleteInventoryItem = (name) => api.delete(`/inventory/${name}`)
export const adjustInventoryStock = (name, amount) => api.patch(`/inventory/${name}/stock`, { amount })
export const toggleInventoryStatus = (name, isActive) => api.patch(`/inventory/${name}/toggle-status`, { isActive })
export const syncInventory = () => api.post('/inventory/sync')
export const getOperatingHours = () => api.get(`/settings/operating-hours?t=${Date.now()}`)
export const updateOperatingHours = (payload) => api.patch('/settings/operating-hours', payload)

export const getFinancesSummary = () => api.get(`/finances/summary?t=${Date.now()}`)
// Customer OTP
export const sendOtp = (phone) => api.post('/auth/send-otp', { phone })
export const verifyOtp = (phone, code) => api.post('/auth/verify-otp', { phone, code })

export default api

