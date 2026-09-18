import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ulid } from 'ulid';

export interface ResolutionCandidate {
  entity_id: string;
  name: string;
  confidence: number;
  match_type: 'EXACT_GSTIN' | 'EXACT_PHONE' | 'EXACT_NAME' | 'FUZZY_NAME' | 'NEW';
  existing_attributes?: Record<string, any>;
}

export async function resolveSupplier(
  ddb: DynamoDBDocumentClient,
  tableName: string,
  tenantId: string,
  supplierData: { name: string; gstin?: string; phone?: string }
): Promise<ResolutionCandidate> {
  const normalizedName = supplierData.name.trim().toLowerCase();

  // 1. Fetch all suppliers for this tenant
  const response = await ddb.send(new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    ExpressionAttributeValues: {
      ':pk': `TENANT#${tenantId}`,
      ':skPrefix': 'ENT#SUPPLIER#'
    }
  }));

  const suppliers = response.Items || [];

  // 2. Deterministic Matches
  for (const sup of suppliers) {
    const attrs = sup.attributes || {};
    
    if (supplierData.gstin && attrs.gstin === supplierData.gstin) {
      return { entity_id: sup.entity_id, name: sup.name, confidence: 1.0, match_type: 'EXACT_GSTIN', existing_attributes: attrs };
    }
    
    if (supplierData.phone && attrs.phone === supplierData.phone) {
      return { entity_id: sup.entity_id, name: sup.name, confidence: 1.0, match_type: 'EXACT_PHONE', existing_attributes: attrs };
    }

    if (sup.name.trim().toLowerCase() === normalizedName) {
      return { entity_id: sup.entity_id, name: sup.name, confidence: 0.95, match_type: 'EXACT_NAME', existing_attributes: attrs };
    }
  }

  // 3. Simple Fuzzy Matching
  for (const sup of suppliers) {
    const existingNormalized = sup.name.trim().toLowerCase();
    const attrs = sup.attributes || {};
    
    if (existingNormalized.includes(normalizedName) || normalizedName.includes(existingNormalized)) {
      if (normalizedName.length > 5 && existingNormalized.length > 5) {
         return { entity_id: sup.entity_id, name: sup.name, confidence: 0.8, match_type: 'FUZZY_NAME', existing_attributes: attrs };
      }
    }
  }

  // 4. No Match - New entity
  return {
    entity_id: `ENT#SUPPLIER#${ulid()}`,
    name: supplierData.name,
    confidence: 1.0,
    match_type: 'NEW',
    existing_attributes: {}
  };
}
