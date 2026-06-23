import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const getNotices = () => axios.get(`${API_URL}/notices`);
export const createNotice = (data) => axios.post(`${API_URL}/notices`, data);
export const updateNotice = (id, data) => axios.put(`${API_URL}/notices/${id}`, data);
export const deleteNotice = (id) => axios.delete(`${API_URL}/notices/${id}`);

export const getContests = () => axios.get(`${API_URL}/contests`);
export const createContest = (data) => axios.post(`${API_URL}/contests`, data);
export const updateContest = (id, data) => axios.put(`${API_URL}/contests/${id}`, data);
export const deleteContest = (id) => axios.delete(`${API_URL}/contests/${id}`);
