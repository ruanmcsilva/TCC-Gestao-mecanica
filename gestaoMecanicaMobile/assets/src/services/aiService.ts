import api from '../config/api';

export const consultarIA = async (pergunta: string, token: string) => {
  const response = await api.post(
    '/ai/consultar/',
    { pergunta },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.resposta;
};