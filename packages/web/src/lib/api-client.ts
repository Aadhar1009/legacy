import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error('API Request failed');
    }

    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export const apiClient = {
  getStats: () => fetchWithAuth('/stats'),
  // Add other endpoints as needed
};
