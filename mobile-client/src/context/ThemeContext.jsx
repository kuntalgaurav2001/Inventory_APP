import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, DARK_COLORS, STORAGE_KEYS } from '../constants';

// Initial State
const initialState = {
  isDark: false,
  colors: COLORS,
};

// Theme Reducer
function themeReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_THEME':
      return {
        isDark: !state.isDark,
        colors: !state.isDark ? DARK_COLORS : COLORS,
      };
    case 'SET_THEME':
      return {
        isDark: action.payload,
        colors: action.payload ? DARK_COLORS : COLORS,
      };
    default:
      return state;
  }
}

// Create Context
const ThemeContext = createContext(undefined);

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Load theme preference on app start
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
        if (savedTheme !== null) {
          const isDark = savedTheme === 'dark';
          dispatch({ type: 'SET_THEME', payload: isDark });
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };

    loadTheme();
  }, []);

  // Save theme preference when it changes
  useEffect(() => {
    const saveTheme = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.THEME, state.isDark ? 'dark' : 'light');
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    };

    saveTheme();
  }, [state.isDark]);

  // Toggle theme function
  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  // Set theme function
  const setTheme = (isDark) => {
    dispatch({ type: 'SET_THEME', payload: isDark });
  };

  // Context value
  const contextValue = {
    ...state,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 
