import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';
import { STORAGE_KEYS } from '../constants';
import { auth } from '../../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

// Initial State
const initialState = {
  user: null,
  token: null,
  loading: true,
  error: null,
};

// Auth Reducer
function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
}

// Create Context
const AuthContext = createContext(undefined);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get Firebase ID token
          const token = await firebaseUser.getIdToken();
          
          // Save token to AsyncStorage
          await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
          
          // Get user info from backend
          const userInfo = await apiService.getCurrentUser();
          
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: userInfo, token },
          });
        } catch (error) {
          console.error('Error getting user info:', error);
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } else {
        // User is signed out
        await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    });

    return () => unsubscribe();
  }, []);

  // Save user data to storage when user changes
  useEffect(() => {
    const saveUserData = async () => {
      if (state.user) {
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(state.user));
        } catch (error) {
          console.error('Error saving user data:', error);
        }
      }
    };

    saveUserData();
  }, [state.user]);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      const firebaseUser = userCredential.user;
      
      // Get Firebase ID token
      const token = await firebaseUser.getIdToken();
      
      // Save token to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      
      // Get user info from backend
      const userInfo = await apiService.getCurrentUser();
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: userInfo,
          token: token,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      // Create user with Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const firebaseUser = userCredential.user;
      
      // Register user with backend
      const response = await apiService.register({
        ...userData,
        uid: firebaseUser.uid
      });

      if (response.success) {
        // Registration successful, but user needs to login
        dispatch({ type: 'AUTH_LOGOUT' });
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Send OTP function
  const sendOTP = async (phoneNumber) => {
    try {
      const response = await apiService.sendOTP(phoneNumber);

      if (!response.success) {
        throw new Error(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
      throw new Error(errorMessage);
    }
  };

  // Login with OTP function
  const loginWithOTP = async (otpData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await apiService.loginWithOTP(otpData);

      if (response.success && response.data) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.user,
            token: response.data.access_token,
          },
        });
      } else {
        throw new Error(response.message || 'OTP login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'OTP login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Sign out from Firebase
      await auth.signOut();
      
      // Clear AsyncStorage
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      console.error('Error during logout:', error);
      // Still logout even if API call fails
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Update user function
  const updateUser = (user) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  // Context value
  const contextValue = {
    ...state,
    login,
    register,
    loginWithOTP,
    sendOTP,
    logout,
    clearError,
    updateUser,
    isAuthenticated: !!state.user && !!state.token,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 