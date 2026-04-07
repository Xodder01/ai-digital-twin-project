import axios from 'axios';

const NODE_API = 'http://localhost:3001';

const getToken = () => localStorage.getItem('ai_twin_token');

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
});

export const signup = async (data) => {
  const res = await axios.post(`${NODE_API}/auth/signup`, data);
  return res.data;
};

export const signin = async (data) => {
  const res = await axios.post(`${NODE_API}/auth/signin`, data);
  return res.data;
};

export const getMe = async () => {
  const res = await axios.get(`${NODE_API}/auth/me`, authHeaders());
  return res.data;
};

export const saveHistory = async (type, inputs, outputs) => {
  try {
    const res = await axios.post(`${NODE_API}/history`, { type, inputs, outputs }, authHeaders());
    return res.data;
  } catch (err) {
    console.warn('Failed to save history:', err.message);
  }
};

export const getHistory = async (page = 1, limit = 20) => {
  const res = await axios.get(`${NODE_API}/history?page=${page}&limit=${limit}`, authHeaders());
  return res.data;
};

export const deleteHistory = async (id) => {
  const res = await axios.delete(`${NODE_API}/history/${id}`, authHeaders());
  return res.data;
};
