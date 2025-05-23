// src/services/api.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },
  
  register: async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    return response.json();
  }
};

export const investmentAPI = {
  getAll: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/investments`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },
  
  importFile: async (platformId: string, file: File, token: string) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/import/${platformId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    return response.json();
  }
};