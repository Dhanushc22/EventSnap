import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, setAuthToken, getAuthToken } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // For dual auth, we might not have a profile endpoint for hosts
          // So we'll use the stored user data
          const userData = JSON.parse(storedUser);
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: userData }
          });
        } catch (error) {
          console.error('Auth check error:', error);
          // Clear invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setAuthToken(null);
        }
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    checkAuth();
  }, []);



  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authAPI.login(credentials);
      // Handle both response formats: { success, token, user } and { success, data: { token, user } }
      const token = response.data.token || response.data.data?.token;
      const user = response.data.user || response.data.data?.user;

      setAuthToken(token);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user },
      });

      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };



  const logout = () => {
    setAuthToken(null);
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const setUser = (userData) => {
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { user: userData },
    });
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response.data.data.user;

      dispatch({
        type: 'UPDATE_PROFILE',
        payload: updatedUser,
      });

      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await authAPI.changePassword(passwordData);
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    ...state,
    login,
    logout,
    setUser,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;