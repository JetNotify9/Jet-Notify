// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AuthService from '../services/AuthService';

export const AuthContext = createContext({
  user: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  updateEmail: async () => {},
  updatePassword: async () => {},
  deleteAccount: async () => {},
  updateName: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      await AuthService.login(email, password);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signup = async (email, password, firstName, lastName) => {
    try {
      await AuthService.signup(email, password, firstName, lastName);
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const updateEmail = async (newEmail) => {
    try {
      await AuthService.updateEmail(newEmail);
    } catch (error) {
      console.error("Update email error:", error);
      throw error;
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      await AuthService.updatePassword(newPassword);
    } catch (error) {
      console.error("Update password error:", error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    try {
      await AuthService.deleteAccount();
    } catch (error) {
      console.error("Delete account error:", error);
      throw error;
    }
  };

  // NEW: Update name method
  const updateName = async (firstName, lastName) => {
    try {
      await AuthService.updateName(firstName, lastName);
    } catch (error) {
      console.error("Update name error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      updateEmail,
      updatePassword,
      deleteAccount,
      updateName,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
