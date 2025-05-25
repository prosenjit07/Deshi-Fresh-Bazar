// Remove server-side imports
// import { cookies } from 'next/headers';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  id: string;
  name: string;
  email: string;
  token: string;
  role: 'USER' | 'ADMIN'; 
}

// Helper function to set cookie
function setCookie(name: string, value: string, days: number) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

// Helper function to get cookie
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await fetch('/api/users', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const result = await response.json();
  
  // Store token in localStorage
  localStorage.setItem('token', result.token);
  
  return result;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  const result = await response.json();
  
  // Store token in localStorage
  localStorage.setItem('token', result.token);
  
  return result;
}

export async function logout() {
  // Remove token from localStorage
  localStorage.removeItem('token');
}

export async function getCurrentUser() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return null;
  }

  const response = await fetch('/api/users/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      return null; // Not logged in
    }
    const error = await response.json();
    throw new Error(error.message || 'Failed to get user profile');
  }

  return response.json();
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
} 