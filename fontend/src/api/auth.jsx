import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const login = async (form) => {
  return await axios.post(`${API_URL}/login`, form);
};
export const register = async (token, form) => {
  return await axios.post(`${API_URL}/register`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const currentUser = async (token) =>
  await axios.post(
    `${API_URL}/current-user`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const currentAdmin = async (token) => {
  return await axios.post(
    `${API_URL}/current-admin`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
