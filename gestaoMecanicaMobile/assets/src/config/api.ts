// O IP do servidor de produção no Render
import axios from 'axios';
const baseURL = 'https://api-mecanica-qbpx.onrender.com/api/v1';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;