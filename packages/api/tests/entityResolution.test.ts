import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveSupplier } from '../src/services/entityResolution';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Mock the AWS SDK
vi.mock('@aws-sdk/lib-dynamodb', () => {
  return {
    DynamoDBDocumentClient: {
      from: vi.fn(),
    },
    QueryCommand: class QueryCommandMock {
      constructor(public input: any) {}
    },
  };
});

describe('Entity Resolution Pipeline', () => {
  let mockDdb: any;

  beforeEach(() => {
    mockDdb = {
      send: vi.fn(),
    };
  });

  it('should return EXACT_GSTIN match with 1.0 confidence when GSTIN matches', async () => {
    mockDdb.send.mockResolvedValueOnce({
      Items: [
        { entity_id: 'ENT#1', name: 'Sharma Electronics', attributes: { gstin: '27AADCS' } },
        { entity_id: 'ENT#2', name: 'Other Store', attributes: { gstin: '99XYZ' } }
      ]
    });

    const result = await resolveSupplier(mockDdb, 'TestTable', 'TENANT1', {
      name: 'Sharma Elec', // Different name
      gstin: '27AADCS'     // Same GSTIN
    });

    expect(result.match_type).toBe('EXACT_GSTIN');
    expect(result.entity_id).toBe('ENT#1');
    expect(result.confidence).toBe(1.0);
  });

  it('should return FUZZY_NAME match with 0.8 confidence when name is contained', async () => {
    mockDdb.send.mockResolvedValueOnce({
      Items: [
        { entity_id: 'ENT#1', name: 'Sharma Electronics', attributes: { gstin: '27AADCS' } }
      ]
    });

    const result = await resolveSupplier(mockDdb, 'TestTable', 'TENANT1', {
      name: 'Sharma Electronic', // substring
    });

    expect(result.match_type).toBe('FUZZY_NAME');
    expect(result.entity_id).toBe('ENT#1');
    expect(result.confidence).toBe(0.8);
  });

  it('should generate NEW entity when no match is found', async () => {
    mockDdb.send.mockResolvedValueOnce({
      Items: [
        { entity_id: 'ENT#1', name: 'Completely Different Store', attributes: { gstin: '99XYZ' } }
      ]
    });

    const result = await resolveSupplier(mockDdb, 'TestTable', 'TENANT1', {
      name: 'New Supplier Inc'
    });

    expect(result.match_type).toBe('NEW');
    expect(result.entity_id).toContain('ENT#SUPPLIER#');
    expect(result.confidence).toBe(1.0);
  });
});
