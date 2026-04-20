// ============================================
// SERVICIO API - CHILAQUILES TOP
// Preparado para conectarse al backend
// ============================================

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ============================================
// PEDIDOS (Órdenes)
// ============================================

/**
 * Enviar un nuevo pedido al backend
 * @param {Object} orderData - Datos completos de la orden
 */
export const createOrder = async (orderData) => {
  return await apiClient.post('/orders', orderData)
}

/**
 * Obtener el conteo de platos disponibles desde el servidor
 */
export const getAvailableCount = async () => {
  return await apiClient.get('/orders/available')
}

/**
 * Obtener historial de órdenes (para admin)
 */
export const getOrders = async () => {
  return await apiClient.get('/orders')
}

// ============================================
// MENÚ
// ============================================

/**
 * Obtener el menú dinámico (para cuando se conecte a BD)
 */
export const getMenu = async () => {
  return await apiClient.get('/menu')
}
