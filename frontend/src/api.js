import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const api = {
  login: async (email, password) => {
    const res = await axios.post(`${API_URL}/login`, { email, password });
    return res.data;
  },
  register: async (data) => {
    const res = await axios.post(`${API_URL}/register`, data);
    return res.data;
  },
  getUsersByRole: async (role) => {
    const res = await axios.get(`${API_URL}/users?role=${role}`);
    return res.data;
  },
  deleteUser: async (id) => {
    await axios.delete(`${API_URL}/users/${id}`);
  },
  updateProfile: async (id, data) => {
    await axios.put(`${API_URL}/users/${id}`, data);
  },
  getAppointments: async (userId, role) => {
    const res = await axios.get(
      `${API_URL}/appointments?userId=${userId}&role=${role}`
    );
    return res.data;
  },
  createAppointment: async (data) => {
    await axios.post(`${API_URL}/appointments`, data);
  },
  updateAppointmentStatus: async (id, status) => {
    await axios.put(`${API_URL}/appointments/${id}`, { status });
  },
  addSlot: async (doctorId, dateTime) => {
    await axios.post(`${API_URL}/slots`, { doctorId, dateTime });
  },
  getSlots: async (doctorId) => {
    const res = await axios.get(`${API_URL}/slots/${doctorId}`);
    return res.data;
  },
  deleteSlot: async (id) => {
    await axios.delete(`${API_URL}/slots/${id}`);
  },
};
