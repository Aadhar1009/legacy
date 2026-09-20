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

export async function queryLoreEngine(query: string): Promise<LoreResponse> {
  // Simulate network traversal
  await new Promise(resolve => setTimeout(resolve, 1500));

  const lowerQuery = query.toLowerCase();

  // The "Holy Shit" Demo Route
  if (lowerQuery.includes('gupta') || lowerQuery.includes('returns') || lowerQuery.includes('rakesh')) {
    return {
      answer: "The official SOP states a 15-day return window for Gupta Traders. However, based on a WhatsApp Voice Note from October 4th, Rakesh verbally authorized an indefinite return window for defective units specifically for Gupta Traders. Rakesh is the sole employee aware of this operational exception.",
      entities: [
        { id: 'e1', name: 'Gupta Traders', type: 'COMPANY', relation: 'Target Supplier' },
        { id: 'e2', name: 'Rakesh', type: 'PERSON', relation: 'Sole Knowledge Owner', isConcentratedRisk: true },
        { id: 'e3', name: 'Return Policy', type: 'POLICY', relation: 'Verbal Exception Applied' }
      ],
      events: [
        { id: 'ev1', type: 'SOP_OVERRIDE', description: 'Verbal exception granted to Gupta Traders', timestamp: '2026-10-04T14:30:00Z', actor: 'Rakesh' }
      ],
      sources: [
        {
          id: 's1',
          documentName: 'VoiceNote_041026_Rakesh.mp3',
          excerpt: "Yeah, for Gupta Ji, ignore the 15-day rule on those defectives. Take them back whenever, I already cleared it.",
          confidence: 'HIGH',
          date: 'Oct 4, 2026',
          type: 'VOICE_NOTE'
        },
        {
          id: 's2',
          documentName: 'Supplier_SOP_v2.pdf',
          excerpt: "All standard suppliers are subject to a strict 15-day return window from the date of invoice.",
          confidence: 'MEDIUM',
          date: 'Jan 12, 2026',
          type: 'SOP'
        }
      ],
      busFactorAlert: {
        level: 'CRITICAL',
        message: 'Operational Concentration Risk: Rakesh is a single point of failure for the undocumented Gupta Traders return policy.'
      }
    };
  }

  // Fallback Route
  return {
    answer: "I found records related to your query. The information is scattered across 2 invoices and 1 informal Khata entry.",
    entities: [
      { id: 'e4', name: 'Unknown Supplier', type: 'COMPANY' },
      { id: 'e5', name: 'Sales Register', type: 'DOCUMENT' }
    ],
    events: [],
    sources: [
      {
        id: 's3',
        documentName: 'Khata_Entry_Sept.jpg',
        excerpt: "Pending payment of 12,000",
        confidence: 'LOW',
        date: 'Sep 28, 2026',
        type: 'INVOICE'
      }
    ]
  };
}
