import { describe, it, expect } from 'vitest';
import { queryLoreEngine } from '../src/lib/mock-lore-engine';

describe('Mock LORE Engine', () => {
  it('should return critical bus factor alert for Gupta Traders query', async () => {
    const query = 'Who knows how we handle returns from Gupta Traders?';
    const response = await queryLoreEngine(query);
    
    expect(response).toBeDefined();
    expect(response.busFactorAlert).toBeDefined();
    expect(response.busFactorAlert?.level).toBe('CRITICAL');
    expect(response.entities.length).toBeGreaterThan(0);
    
    // Check if Rakesh is identified as a risk
    const rakesh = response.entities.find(e => e.name === 'Rakesh');
    expect(rakesh).toBeDefined();
    expect(rakesh?.isConcentratedRisk).toBe(true);
  });

  it('should return default fallback for unrelated queries', async () => {
    const query = 'What is the weather today?';
    const response = await queryLoreEngine(query);
    
    expect(response.busFactorAlert).toBeUndefined();
    expect(response.entities[0]?.name).toBe('DukaanOS Agent');
  });
});
