import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const AuthContext = createContext();

// Create axios instance for token refresh (without interceptor to avoid loops)
const refreshAxios = axios.create();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Store tokens in ref so interceptor always has latest values
  const tokensRef = useRef({ accessToken, refreshToken });

  // Update ref when tokens change
  useEffect(() => {
    tokensRef.current = { accessToken, refreshToken };
  }, [accessToken, refreshToken]);

  // Set up axios default header for access token
  useEffect(() => {
    if (accessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [accessToken]);

  // Set up interceptor once on mount
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Avoid infinite loops on certain endpoints
        if (originalRequest.url?.includes('/refresh') || originalRequest.url?.includes('/logout')) {
          return Promise.reject(error);
        }

        // If 401 and not already retried, attempt to refresh token
        if (error.response?.status === 401 && !originalRequest._retry && tokensRef.current.refreshToken) {
          originalRequest._retry = true;

          try {
            // Refresh the token using the separate axios instance
            const response = await refreshAxios.post(`${API_BASE_URL}/refresh`, {
              refresh_token: tokensRef.current.refreshToken,
            });
            const { access_token } = response.data;
            
            // Update token state
            setAccessToken(access_token);
            
            // Update the original request with new token
            originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
            
            // Retry the original request
            return axios(originalRequest);
          } catch (refreshError) {
            // Refresh failed - clear tokens and reject
            setAccessToken(null);
            setRefreshToken(null);
            setUser(null);
            delete axios.defaults.headers.common['Authorization'];
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Auto-refresh token if expiring soon
  useEffect(() => {
    if (accessToken) {
      // Set up auto-refresh before token expires (60 min - 5 min buffer)
      const refreshTimer = setTimeout(() => {
        refreshAccessToken();
      }, 55 * 60 * 1000);

      return () => clearTimeout(refreshTimer);
    }
  }, [accessToken]);

  const register = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, {
        email,
        password,
      });
      setError(null);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.detail || 'Registration failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password,
      });
      const { access_token, refresh_token } = response.data;
      
      // Set tokens first (this also updates axios headers via useEffect)
      setAccessToken(access_token);
      setRefreshToken(refresh_token);
      
      // Fetch user info with the new token
      const userResponse = await axios.get(`${API_BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      setUser(userResponse.data);
      setError(null);
      return response.data;
    } catch (err) {
      setAccessToken(null);
      setRefreshToken(null);
      const message = err.response?.data?.detail || 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAccessToken = useCallback(async () => {
    const { refreshToken: currentRefreshToken } = tokensRef.current;
    
    if (!currentRefreshToken) {
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
      return;
    }

    try {
      const response = await refreshAxios.post(`${API_BASE_URL}/refresh`, {
        refresh_token: currentRefreshToken,
      });
      const { access_token } = response.data;
      setAccessToken(access_token);
      return access_token;
    } catch (err) {
      // Refresh failed, clear tokens
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    const { refreshToken: currentRefreshToken } = tokensRef.current;
    
    if (currentRefreshToken) {
      try {
        await refreshAxios.post(`${API_BASE_URL}/logout`, {
          refresh_token: currentRefreshToken,
        });
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setError(null);
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const isAuthenticated = !!accessToken;

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        refreshAccessToken,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
