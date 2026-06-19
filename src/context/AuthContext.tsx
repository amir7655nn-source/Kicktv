import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface KickUser {
  id: number;
  username: string;
  profile_pic: string;
}

interface AuthContextType {
  token: string | null;
  user: KickUser | null;
  setToken: (t: string | null) => Promise<void>;
  setUser: (u: KickUser | null) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUserState] = useState<KickUser | null>(null);

  useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem('kick_token');
      const u = await AsyncStorage.getItem('kick_user');
      if (t) setTokenState(t);
      if (u) setUserState(JSON.parse(u));
    })();
  }, []);

  const setToken = async (t: string | null) => {
    setTokenState(t);
    t ? await AsyncStorage.setItem('kick_token', t) : await AsyncStorage.removeItem('kick_token');
  };
  const setUser = async (u: KickUser | null) => {
    setUserState(u);
    u ? await AsyncStorage.setItem('kick_user', JSON.stringify(u)) : await AsyncStorage.removeItem('kick_user');
  };
  const logout = async () => { await setToken(null); await setUser(null); };

  return (
    <AuthContext.Provider value={{ token, user, setToken, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be within AuthProvider');
  return ctx;
}
