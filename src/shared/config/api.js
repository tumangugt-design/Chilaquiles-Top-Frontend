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
export const getCustomerByPhone = (phone) => api.get(`/users/customer-by-phone/${encodeURIComponent(phone)}?t=${Date.now()}`)
export const getUserOrderHistory = (type, userId) => api.get(`/orders/history?type=${encodeURIComponent(type)}&userId=${encodeURIComponent(userId)}&t=${Date.now()}`)
export const updateProfile = (payload) => api.patch('/users/profile', payload)
export const getInventory = () => api.get(`/inventory?t=${Date.now()}`)
export const getAvailablePlates = () => api.get('/inventory/available')
export const getLastPurchases = () => api.get(`/inventory/last-purchases?t=${Date.now()}`)
export const getPublicInventoryOptions = () => api.get('/inventory/public-options')
export const getInventoryLogs = (params = {}) => {
  const qs = new URLSearchParams({ t: Date.now(), ...params }).toString()
  return api.get(`/inventory/logs?${qs}`)
}
export const saveInventoryItem = (payload) => api.post('/inventory', payload)
export const deleteInventoryItem = (name) => api.delete(`/inventory/${name}`)
export const adjustInventoryStock = (name, amount) => api.patch(`/inventory/${name}/stock`, { amount })
export const toggleInventoryStatus = (name, isActive) => api.patch(`/inventory/${name}/toggle-status`, { isActive })
export const updateInventoryPrice = (name, price) => api.patch(`/inventory/${encodeURIComponent(name)}/price`, { price })
export const updateInventoryStock = (name, stock, inputUnit) => api.patch(`/inventory/${encodeURIComponent(name)}/direct-stock`, { stock, inputUnit })
export const syncInventory = () => api.post('/inventory/sync')
export const getOperatingHours = () => api.get(`/settings/operating-hours?t=${Date.now()}`)
export const updateOperatingHours = (payload) => api.patch('/settings/operating-hours', payload)
export const getPromotions = () => api.get(`/settings/promotions?t=${Date.now()}`)
export const updatePromotions = (payload) => api.patch('/settings/promotions', payload)
export const getCalculatorCosts = () => api.get(`/settings/calculator-costs?t=${Date.now()}`)
export const updateCalculatorCosts = (payload) => api.patch('/settings/calculator-costs', payload)

export const getFinancesSummary = () => api.get(`/finances/summary?t=${Date.now()}`)
// Customer OTP
export const sendOtp = (phone) => api.post('/auth/send-otp', { phone })
export const verifyOtp = (phone, code) => api.post('/auth/verify-otp', { phone, code })

export const getPortions = () => api.get(`/inventory/portions?t=${Date.now()}`)
export const updatePortion = (name, payload) => api.put(`/inventory/portions/${encodeURIComponent(name)}`, payload)
export const createPackagingProduct = (payload) => api.post('/inventory/packaging', payload)

export const getCoupons = () => api.get(`/settings/coupons?t=${Date.now()}`)
export const updateCoupons = (payload) => api.patch('/settings/coupons', payload)
export const validateCoupon = (payload) => api.post('/settings/validate-coupon', payload)

export const sendPromotionBlast = (payload) => api.post('/settings/promotions/send-blast', payload)
export const getCampaignHistory = () => api.get(`/settings/promotions/campaigns?t=${Date.now()}`)
export const generateMarketingMessage = (payload) => api.post('/settings/promotions/generate-marketing', payload)

// Content Studio
export const generateContentDraft = (payload) => api.post('/content/generate', payload)
export const getContentDrafts = () => api.get('/content/drafts')
export const approveContentDraft = (id) => api.post(`/content/drafts/${id}/approve`)
export const scheduleContentDraft = (id, data) => api.post(`/content/drafts/${id}/schedule`, data).then(r => r.data)
export const deleteContentDraft = (id) => api.delete(`/content/drafts/${id}`).then(r => r.data)
export const publishContentDraft = (id, data) => api.post(`/content/drafts/${id}/publish`, data).then(r => r.data)
export const createManualDraft = (payload) => api.post('/content/drafts/manual', payload).then(r => r.data)
export const updateContentDraft = (id, copy) => api.put(`/content/drafts/${id}/copy`, { copy }).then(r => r.data)
// Canva
export const getCanvaStatus = () => api.get('/canva/status')
export const getCanvaAuthUrl = () => api.get('/canva/auth')
export const testCanvaIntegration = (payload) => api.post('/canva/test', payload)

export default api
