import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);  // Initially, there is no authenticated user

  const login = (userData) => setUser(userData);  // Method to set user data (this will be used after login)
  const logout = () => setUser(null);  // Logout method

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);  // Hook to access auth context
};
