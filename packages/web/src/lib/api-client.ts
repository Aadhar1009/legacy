import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export type LoreConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export interface LoreEvent {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  actor: string;
}

export interface LoreEntity {
  id: string;
  name: string;
  type: 'PERSON' | 'COMPANY' | 'PRODUCT' | 'POLICY' | 'DOCUMENT';
  relation?: string;
  isConcentratedRisk?: boolean;
}

export interface LoreSource {
  id: string;
  documentName: string;
  excerpt: string;
  confidence: LoreConfidence;
  date: string;
  type: 'WHATSAPP' | 'VOICE_NOTE' | 'INVOICE' | 'SOP';
}

export interface LoreResponse {
  answer: string;
  entities: LoreEntity[];
  events: LoreEvent[];
  sources: LoreSource[];
  busFactorAlert?: {
    level: 'CRITICAL' | 'WARNING' | 'SAFE';
    message: string;
  };
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  if (!API_URL) {
    throw new Error('API_URL is not configured. Backend is blocked until deployed.');
  }

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
      throw new Error(`API Request failed with status ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export const apiClient = {
  getStats: () => fetchWithAuth('/stats'),
  queryLoreEngine: async (query: string): Promise<LoreResponse> => {
    // REAL CALL to Hono backend
    const res = await fetchWithAuth('/api/v1/memory/query', {
      method: 'POST',
      body: JSON.stringify({ query })
    });
    return res.data;
  },
  uploadDocument: async (fileBuffer: Buffer, filename: string) => {
    // Stub definition for local sync daemon payload.
    // In a real browser context, this would use FormData.
    const res = await fetchWithAuth('/api/v1/documents', {
      method: 'POST',
      body: JSON.stringify({ filename, content: fileBuffer.toString('base64') })
    });
    return res.data;
  }
};
