import axios from 'axios';


const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1/',
    headers: {
        'Content-Type': 'application/json',
    },
});



api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export const login = async (username, password) => {
  const response = await api.post('token/', {
    username,
    password,
  });
  localStorage.setItem('access_token', response.data.access);
  localStorage.setItem('refresh_token', response.data.refresh);
  return response.data;
};


export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
}

export const getUserData = async () => {
  const response = await api.get('sessao/');
  return response.data
};

export default api;