// O IP que o seu celular (Wi-Fi) usa para falar com o seu Dell (Cabo)
import axios from 'axios';
const baseURL = 'http://192.168.0.123:8000/api/v1';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;