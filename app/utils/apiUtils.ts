import { Alert } from 'react-native';
import { getAuthData, clearAuthData } from './authUtils';

export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * Makes an authenticated API call with proper error handling
 */
export const makeAuthenticatedRequest = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const { token } = await getAuthData();
    
    if (!token) {
      return {
        data: null,
        error: 'No authentication token available',
        status: 401
      };
    }

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });

    const status = response.status;
    
    // Handle authentication errors
    if (status === 401) {
      await clearAuthData();
      return {
        data: null,
        error: 'Authentication failed',
        status
      };
    }

    // Handle network errors
    if (!response.ok) {
      const errorText = await response.text();
      return {
        data: null,
        error: errorText || `HTTP Error ${status}`,
        status
      };
    }

    const data = await response.json();
    return {
      data,
      error: null,
      status
    };

  } catch (error) {
    console.error('API request failed:', error);
    
    // Handle network connectivity issues
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      return {
        data: null,
        error: 'Network connection failed. Please check your internet connection.',
        status: 0
      };
    }

    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 500
    };
  }
};

/**
 * Shows user-friendly error messages
 */
export const handleApiError = (error: string, showAlert: boolean = true) => {
  console.error('API Error:', error);
  
  if (showAlert) {
    let userMessage = 'Something went wrong. Please try again.';
    
    if (error.includes('Network')) {
      userMessage = 'Please check your internet connection and try again.';
    } else if (error.includes('Authentication')) {
      userMessage = 'Your session has expired. Please log in again.';
    } else if (error.includes('Server')) {
      userMessage = 'Server is temporarily unavailable. Please try again later.';
    }
    
    Alert.alert('Error', userMessage);
  }
};