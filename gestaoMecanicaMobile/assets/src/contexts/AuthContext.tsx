import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

export interface UserData {
  pk: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
}

interface AuthContextType {
  user: UserData | null;
  isAdmin: boolean;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('@app_token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      api.defaults.headers.Authorization = `Bearer ${token}`;

      const response = await api.get('/auth/user/');
      setUser(response.data);
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        console.log("Token expirado ou inválido. Usuário precisa fazer login novamente.");
      } else {
        console.error("Erro ao buscar usuário no AuthContext:", error);
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('@app_token');
    await AsyncStorage.removeItem('@app_user_login');
    setUser(null);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const isAdmin = user ? (user.is_staff || user.is_superuser) : false;

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
