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
export const registerStaff = (payload) => api.post('/auth/staff/register', payload)
export const getSession = () => api.get('/auth/session')
export const createOrder = (payload) => api.post('/orders', payload)
export const getOrders = (status) => api.get(`/orders?t=${Date.now()}${status ? `&status=${status}` : ''}`)
export const updateOrderStatus = (orderId, status) => api.patch(`/orders/${orderId}/status`, { status })
export const getPendingStaff = () => api.get('/users/pending-staff')
export const updateStaffStatus = (userId, payload) => api.patch(`/users/staff/${userId}/status`, payload)
export const getUsersByRole = (role) => api.get(`/users/role/${encodeURIComponent(role)}?t=${Date.now()}`)
export const getUserOrderHistory = (type, userId) => api.get(`/orders/history?type=${encodeURIComponent(type)}&userId=${encodeURIComponent(userId)}&t=${Date.now()}`)
export const updateProfile = (payload) => api.patch('/users/profile', payload)
export const getInventory = () => api.get(`/inventory?t=${Date.now()}`)
export const getAvailablePlates = () => api.get('/inventory/available')
export const saveInventoryItem = (payload) => api.post('/inventory', payload)
export const deleteInventoryItem = (name) => api.delete(`/inventory/${name}`)
export const adjustInventoryStock = (name, amount) => api.patch(`/inventory/${name}/stock`, { amount })

export default api

export const requestClientAuthCode = (payload) => api.post('/auth/client/request-code', payload)
export const verifyClientAuthCode = (payload) => api.post('/auth/client/verify-code', payload)
