import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          name: localStorage.getItem("user_name"),
          email: localStorage.getItem("user_email"),
          picture: localStorage.getItem("user_picture"),
          role: localStorage.getItem("role"),
          ...decoded,
        });
      } catch (error) {
        console.error("Error decoding token:", error);
        logout();
      }
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user_name", userData.name);
    localStorage.setItem("user_email", userData.email);
    localStorage.setItem("user_picture", userData.picture);
    localStorage.setItem("role", userData.role);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_picture");
    localStorage.removeItem("role");
    localStorage.removeItem("google_id");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
