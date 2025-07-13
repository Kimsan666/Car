
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;



// Save Brand and Model
export const saveBrandAndModel = async (token, form) => 
  await axios.post(`${API_URL}/brandandmodel`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// List all Brand and Models
export const listBrandAndModels = async () => 
  await axios.get(`${API_URL}/brandandmodels`);

// Read single Brand and Model
export const readBrandAndModel = async (token, id) => 
  await axios.get(`${API_URL}/brandandmodel/` + id, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Update Brand and Model
export const updateBrandAndModel = async (token, id, form) => 
  await axios.put(`${API_URL}/brandandmodel/` + id, form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Delete Brand and Model
export const deleteBrandAndModel = async (token, id) => 
  await axios.delete(`${API_URL}/brandandmodel/` + id, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
