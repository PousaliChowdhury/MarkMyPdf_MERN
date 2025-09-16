import React, { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await api.get("/auth/verify");
          setUser({ token });
        } catch {
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setLoading(false);
    }
    verify();
  }, []);

  const login = (token, user) => {
    localStorage.setItem("token", token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
