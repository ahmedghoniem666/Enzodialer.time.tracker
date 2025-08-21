import axios from 'axios';
export const API = (process.env.VITE_API_URL) || 'http://localhost:4000';
export const post = (path, body, token) => axios.post(API + path, body, { headers: token ? { Authorization: 'Bearer ' + token } : {} }).then(r => r.data);
export const get = (path, token) => axios.get(API + path, { headers: token ? { Authorization: 'Bearer ' + token } : {} }).then(r => r.data);
