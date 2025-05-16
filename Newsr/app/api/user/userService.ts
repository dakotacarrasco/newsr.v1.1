// src/services/api.js
import axios, { AxiosResponse } from 'axios';

const API_URL = 'http://localhost:8000/api';

// Type definitions
export interface UserRegistrationData {
  fullName: string;
  email: string;
  password: string;
  preferences?: {
    dailyNewsletter?: boolean;
    breakingNews?: boolean;
    weeklyDigest?: boolean;
    personalizedContent?: boolean;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  preferences?: {
    dailyNewsletter?: boolean;
    breakingNews?: boolean;
    weeklyDigest?: boolean;
    personalizedContent?: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Session {
  access_token: string;
  expires_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Create axios instance with auth header
const authAxios = axios.create({
  baseURL: API_URL
});

// Add token to requests automatically
authAxios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = async (userData: UserRegistrationData): Promise<ApiResponse<{ user: User }>> => {
  const response = await axios.post<ApiResponse<{ user: User }>>(`${API_URL}/users/register`, userData);
  return response.data;
};

export const loginUser = async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; session: Session }>> => {
  const response = await axios.post<ApiResponse<{ user: User; session: Session }>>(`${API_URL}/users/login`, credentials);
  // Store token and user data
  localStorage.setItem('token', response.data.data.session.access_token);
  localStorage.setItem('user', JSON.stringify(response.data.data.user));
  return response.data;
};

export const getUserProfile = async (): Promise<AxiosResponse<ApiResponse<{ user: User }>>> => {
  return authAxios.get<ApiResponse<{ user: User }>>(`${API_URL}/users/profile`);
};

export const updateUserProfile = async (data: Partial<User>): Promise<AxiosResponse<ApiResponse<{ user: User }>>> => {
  return authAxios.patch<ApiResponse<{ user: User }>>(`${API_URL}/users/profile`, data);
};

export const logoutUser = async (): Promise<void> => {
  await authAxios.post(`${API_URL}/users/logout`);
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};