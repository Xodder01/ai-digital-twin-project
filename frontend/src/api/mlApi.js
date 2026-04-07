import axios from 'axios';

const ML_API = 'http://localhost:5000';

export const runPredict = async (payload) => {
  const res = await axios.post(`${ML_API}/predict`, payload);
  return res.data;
};

export const runSimulate = async (payload) => {
  const res = await axios.post(`${ML_API}/simulate`, payload);
  return res.data;
};

export const sendChat = async (message, metrics) => {
  const res = await axios.post(`${ML_API}/chat`, { message, metrics });
  return res.data;
};

export const uploadSyllabus = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${ML_API}/upload_syllabus`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};
