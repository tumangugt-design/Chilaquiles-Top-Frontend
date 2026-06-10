import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Orders
export const createOrder = async (orderData) => {
  return await apiClient.post('/orders', orderData)
}

export const getAvailableCount = async () => {
  return await apiClient.get('/orders/available')
}

export const getOrders = async () => {
  return await apiClient.get('/orders')
}

export const getMenu = async () => {
  return await apiClient.get('/menu')
}

// Auth
export const login = async (credentials) => {
  return await apiClient.post('/auth/staff/login', credentials)
}

export const getSession = async () => {
  return await apiClient.get('/auth/session')
}

// Users (Staff Management)
export const getStaffUsers = async (role) => {
  return await apiClient.get(`/users/role/${role}`)
}

export const createStaffUser = async (userData) => {
  return await apiClient.post('/users/staff', userData)
}

export const updateStaffUser = async (id, userData) => {
  return await apiClient.patch(`/users/staff/${id}`, userData)
}

export const deleteStaffUser = async (id) => {
  return await apiClient.delete(`/users/staff/${id}`)
}

// Inventory
export const getInventory = async () => {
  return await apiClient.get('/inventory')
}

export const adjustStock = async (name, data) => {
  return await apiClient.patch(`/inventory/${name}/stock`, data)
}

export const toggleInventoryStatus = async (name, isActive) => {
  return await apiClient.patch(`/inventory/${name}/toggle-status`, { isActive })
}

export const getInventoryLogs = async () => {
  return await apiClient.get('/inventory/logs')
}

export const syncInventory = async () => {
  return await apiClient.post('/inventory/sync')
}

// Settings / Promotions
export const sendPromotionBlast = async (data) => {
  return await apiClient.post('/settings/promotions/send-blast', data)
}

export const getCampaignHistory = async () => {
  return await apiClient.get('/settings/promotions/campaigns')
}
