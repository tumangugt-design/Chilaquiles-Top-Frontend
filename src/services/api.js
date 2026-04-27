

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

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
