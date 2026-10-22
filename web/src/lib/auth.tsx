import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@nctprop/shared';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loginWithPhone: (phone: string, name?: string, role?: 'user' | 'admin') => void;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loginWithPhone: () => {},
  logout: () => {},
  getAuthHeaders: () => ({})
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nctprop_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('nctprop_token');
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('nctprop_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nctprop_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('nctprop_token', token);
    } else {
      localStorage.removeItem('nctprop_token');
    }
  }, [token]);

  const loginWithPhone = (phone: string, name: string = 'User', role: 'user' | 'admin' = 'user') => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      phone: formattedPhone,
      role,
      user_type: 'owner',
      created_at: Math.floor(Date.now() / 1000)
    };
    setUser(newUser);
    setToken(`dev_token_${newUser.id}`);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const getAuthHeaders = (): Record<string, string> => {
    if (!user) return {};
    return {
      'X-User-Id': user.id,
      'X-User-Name': user.name,
      'X-User-Phone': user.phone,
      'X-User-Role': user.role
    };
  };

  return (
    <AuthContext.Provider value={{ user, token, loginWithPhone, logout, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
