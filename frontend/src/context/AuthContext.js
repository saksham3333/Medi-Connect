import React, { createContext, useContext, useState, useEffect } from 'react';
import userService from '@/services/userService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState('');

  const checkLoginStatus = async () => {
    try {
      const response = await userService.checkAuth();
      console.log('Setting userId:', response.user._id);
      setIsLoggedIn(true);
      setFirstName(response.user.firstName);
      setUserId(response.user._id);
      setRole(response.user.role);
    } catch (error) {
      console.log('Error during login check:', error);
      setIsLoggedIn(false);
      setFirstName('');
      setUserId(null);
      setRole('');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password, userData) => {
    try {
      const response = await userService.registerUser({
        email,
        password,
        ...userData
      });
      console.log('Registration successful:', response);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        firstName,
        setFirstName,
        userId,
        role,
        isLoading,
        checkLoginStatus,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
