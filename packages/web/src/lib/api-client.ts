import { fetchAuthSession } from 'aws-amplify/auth';
import goldenDataset from '../../../../tests/evals/golden_dataset.json';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const OFFLINE_MODE = process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // --- OFFLINE MOCK MODE FOR USABILITY TESTING ---
  if (OFFLINE_MODE) {
    console.log(`[Offline Mode] Intercepting request to ${endpoint}`);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate latency
    
    if (endpoint.includes('/memory/query')) {
      return {
        data: {
          answer: "Based on our records, Samsung charged you ₹36,000 for the 55 inch TV on Oct 12, 2023, but the price increased to ₹37,000 on Nov 5, 2023.",
          confidence: "HIGH",
          claims: [
            { statement: "Initial price was ₹36,000", type: "FACT", evidence_ids: ["INV-1001", "P1"], confidence: "HIGH" },
            { statement: "Price increased to ₹37,000", type: "FACT", evidence_ids: ["INV-1002", "P1"], confidence: "HIGH" }
          ],
          evidence_ids: ["INV-1001", "INV-1002"]
        }
      };
    }
    
    if (endpoint.includes('/briefing')) {
      return {
        data: {
          business_profile: goldenDataset.business.name,
          top_suppliers: goldenDataset.suppliers.map(s => ({ name: s.name, latest_price: null })),
          open_alerts: [{ title: 'Samsung 55" TV Warranty Expiring Soon', severity: 'MEDIUM' }],
          known_memory_gaps: [],
          recent_changes: [{ field: 'latest_price_paise', old: '3600000', new: '3700000' }]
        }
      };
    }
    return { data: {} };
  }
  // --- END OFFLINE MODE ---

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
  queryMemory: (query: string) => fetchWithAuth('/memory/query', {
    method: 'POST',
    body: JSON.stringify({ query })
  }),
  getBriefing: () => fetchWithAuth('/briefing'),
};
