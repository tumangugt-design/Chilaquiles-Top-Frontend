import axios from 'axios';
import { auth } from './firebase.js';

let API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
if (API_URL.startsWith('http://') && !API_URL.includes('localhost') && !API_URL.includes('127.0.0.1')) {
  API_URL = API_URL.replace('http://', 'https://');
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authClientLogin = (payload) => api.post('/auth/client', payload);
export const authStaffLogin = (payload) => api.post('/auth/staff', payload);
export const getSession = () => api.get('/auth/session');
export const createOrder = (payload) => api.post('/orders', payload);
export const getOrders = () => api.get(`/orders?t=${Date.now()}`);
export const updateOrderStatus = (orderId, status) => api.patch(`/orders/${orderId}/status`, { status });
export const getPendingStaff = () => api.get('/users/pending-staff');
export const updateStaffStatus = (userId, payload) => api.patch(`/users/staff/${userId}/status`, payload);
export const getInventory = () => api.get(`/inventory?t=${Date.now()}`);
export const saveInventoryItem = (payload) => api.post('/inventory', payload);

export const deleteInventoryItem = (name) => api.delete(`/inventory/${name}`);
export const adjustInventoryStock = (name, amount) => api.patch(`/inventory/${name}/stock`, { amount });

export default api;
