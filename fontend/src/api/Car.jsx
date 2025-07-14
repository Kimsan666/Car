// src/api/Car.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;


// Save Car
export const saveCar = async (token, form) => 
  await axios.post(`${API_URL}/car`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// List all Cars
export const listCars = async (token) => 
  await axios.get(`${API_URL}/cars`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Read single Car
export const readCar = async (token, id) => 
  await axios.get(`${API_URL}/car/` + id, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Update Car
export const updateCar = async (token, id, form) => 
  await axios.put(`${API_URL}/car/` + id, form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Delete Car
export const removeCar = async (token, id) => 
  await axios.delete(`${API_URL}/car/` + id, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Image upload functions
export const uploadCarImage = async (token, imageData) => 
  await axios.post(`${API_URL}/images`, imageData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const removeCarImage = async (token, public_id) => 
  await axios.post(`${API_URL}/removeimage`, { public_id }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const uploadCarImaged = async (token, imageData) => 
  await axios.post(`${API_URL}/imaged`, imageData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });