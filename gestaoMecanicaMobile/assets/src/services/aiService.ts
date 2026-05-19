// services/aiService.ts
import axios from 'axios';

// IP que configuramos no ALLOWED_HOSTS do seu Django
const API_URL = 'http://192.168.0.123:8000/api/v1/ai/consultar/';

export const consultarIA = async (pergunta: string, token: string) => {
  const response = await axios.post(
    API_URL,
    { pergunta },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.resposta;
};