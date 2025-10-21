// API Configuration
const getApiBaseUrl = () => {
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    return 'http://localhost:8080';
  }
  
  // For production, use environment variable or fallback to AWS server
  return import.meta.env.VITE_API_BASE_URL || 'http://16.170.210.109:8080';
};

export const API_BASE_URL = getApiBaseUrl();

// API endpoints
export const API_ENDPOINTS = {
  // Employee endpoints
  EMPLOYEE_REGISTER: `${API_BASE_URL}/api/employees/register`,
  EMPLOYEE_LOGIN: `${API_BASE_URL}/api/employees/login`,
  
  // Leave endpoints
  LEAVES_SUBMIT: `${API_BASE_URL}/api/leaves/submit`,
  LEAVES_BY_EMPLOYEE: (employeeId) => `${API_BASE_URL}/api/leaves/by-employee/${employeeId}`,
  LEAVES_ALL: `${API_BASE_URL}/api/leaves/all`,
  LEAVES_UPDATE_STATUS: (id, status) => `${API_BASE_URL}/api/leaves/update-status/${id}?status=${status}`,
  
  // Department Head endpoints
  HEADS_LOGIN: `${API_BASE_URL}/api/heads/login`,
  HEADS_ALL: `${API_BASE_URL}/api/heads/all-heads`,
  HEADS_CREATE: `${API_BASE_URL}/api/heads/create`,
};

// Default axios configuration
export const axiosConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};