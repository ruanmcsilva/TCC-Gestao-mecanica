
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'; 
import Notification from '../components/Notification';

interface NotificationState {
  message: string;
  type: 'success' | 'error';
  id: number;
}

interface NotificationContextType {
  showNotification: (message: string, type: 'success' | 'error') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  
  const removeNotification = useCallback((idToRemove: number) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== idToRemove));
  }, []); 

  
  const showNotification = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now(); 
    const newNotification = { message, type, id };
    setNotifications((prev) => [...prev, newNotification]);

   
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, [removeNotification]); 

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notifications.map((notif) => (
        <Notification
          key={notif.id}
          message={notif.message}
          type={notif.type}
         
          onClose={() => removeNotification(notif.id)} 
        />
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
