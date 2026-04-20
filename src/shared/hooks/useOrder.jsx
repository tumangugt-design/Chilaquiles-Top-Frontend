import { useState } from 'react';

const generateId = () => Math.random().toString(36).slice(2, 11);

const createInitialPlate = () => ({
  id: generateId(),
  sauce: null,
  protein: null,
  complement: null,
  baseRecipe: {
    onion: true,
    cilantro: true,
    cream: true
  }
});

const createInitialOrder = () => ({
  cart: [],
  currentPlate: createInitialPlate(),
  customer: {
    name: '',
    phone: '',
    address: '',
    location: null
  },
  lastOrder: null
});

export const useOrder = () => {
  const [order, setOrder] = useState(createInitialOrder());
  const [availablePlates] = useState(25);

  const updateOrder = (updates) => {
    setOrder((prev) => ({ ...prev, ...updates }));
  };

  const updateCurrentPlate = (updates) => {
    setOrder((prev) => ({
      ...prev,
      currentPlate: { ...prev.currentPlate, ...updates }
    }));
  };

  const addCurrentPlateToCart = () => {
    setOrder((prev) => ({
      ...prev,
      cart: [...prev.cart, prev.currentPlate],
      currentPlate: createInitialPlate()
    }));
  };

  const setLastOrder = (backendOrder) => {
    setOrder((prev) => ({ ...prev, lastOrder: backendOrder }));
  };

  const resetOrder = () => {
    setOrder(createInitialOrder());
  };

  return {
    order,
    availablePlates,
    updateOrder,
    updateCurrentPlate,
    addCurrentPlateToCart,
    setLastOrder,
    resetOrder
  };
};
