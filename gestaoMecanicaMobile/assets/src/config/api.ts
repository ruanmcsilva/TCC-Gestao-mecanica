// O IP do servidor de produção no Render
import axios from 'axios';
const baseURL = 'http://192.168.0.162:8000/api/v1';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;