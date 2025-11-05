import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

function normalizeError(error) {
  if (error?.response?.data) {
    return error.response.data;
  }
  if (error?.message) {
    return { error: error.message };
  }
  return { error: 'Unknown error' };
}

async function getHospitals() {
  try {
    const { data } = await client.get('/api/hospitals');
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

async function getPatients() {
  try {
    const { data } = await client.get('/api/patients');
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

async function identifyPatient(faceDescriptor) {
  try {
    const payload = { face_descriptor: faceDescriptor };
    const { data } = await client.post('/api/patients/identify', payload);
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

async function sendChatQuery(query) {
  try {
    const { data } = await client.post('/api/chat/query', { query });
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

async function translateJargon(text) {
  try {
    const { data } = await client.post('/api/jargon/translate', { text });
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

async function shareMedicalHistory(patientId, hospitalId) {
  try {
    const payload = { patient_id: patientId, hospital_id: hospitalId };
    const { data } = await client.post('/api/emergency/share-medical-history', payload);
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export default {
  getHospitals,
  getPatients,
  identifyPatient,
  sendChatQuery,
  translateJargon,
  shareMedicalHistory,
};
