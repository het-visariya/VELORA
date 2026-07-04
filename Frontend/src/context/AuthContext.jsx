import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({ name: '', email: '', profileImage: '' });

  useEffect(() => {
    const savedAuth = localStorage.getItem('velora_authenticated');
    const savedUser = localStorage.getItem('velora_user');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      if (savedUser) {
        try { setUser(JSON.parse(savedUser)); } catch {}
      }
    }
  }, []);

  const login = (name, email) => {
    setIsAuthenticated(true);
    const newUser = { name: name || 'Member', email: email || '', profileImage: '' };
    setUser(newUser);
    localStorage.setItem('velora_authenticated', 'true');
    localStorage.setItem('velora_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser({ name: '', email: '', profileImage: '' });
    localStorage.removeItem('velora_token');
    localStorage.removeItem('velora_authenticated');
    localStorage.removeItem('velora_view');
    localStorage.removeItem('velora_user');
  };

  const updateUser = (updated) => {
    const newUser = { ...user, ...updated };
    setUser(newUser);
    localStorage.setItem('velora_user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
