// src/api/Car.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Save Car
export const saveSaleCar = async (token, form) =>
  await axios.post(`${API_URL}/salecar`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// List all Cars
export const listSaleCars = async (token) =>
  await axios.get(`${API_URL}/salecars`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Read single Car
export const readSaleCar = async (token, id) =>
  await axios.get(`${API_URL}/salecar/` + id, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Update Car
export const updateSaleCar = async (token, id, form) =>
  await axios.put(`${API_URL}/salecar/` + id, form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Delete Car
export const removeSaleCar = async (token, id) =>
  await axios.delete(`${API_URL}/salecar/` + id, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

