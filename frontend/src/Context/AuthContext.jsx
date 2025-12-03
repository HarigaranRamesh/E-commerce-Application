import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user from localStorage on refresh
  useEffect(() => {
    const loggedInUser = localStorage.getItem("currentUser"); // use "currentUser" as key
    if (loggedInUser) {
      try {
        setUser(JSON.parse(loggedInUser));
      } catch {
        setUser(loggedInUser);
      }
    }
  }, []);

  // Login function
  const login = (userData) => {
    localStorage.setItem("currentUser", JSON.stringify(userData));
    setUser(userData);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    // Cart and wishlist will be cleared in their own contexts
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
