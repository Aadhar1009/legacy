import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { RouterContext } from './router';
import { getMemoryPrompt } from './prompts/memory.v1';
import { queryByPrefix } from '../db/operations';
import { z } from 'zod';

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'ap-south-1' });

// Strict Evidence Ledger & Answer Schema
const MemoryResponseSchema = z.object({
  answer: z.string(),
  confidence: z.enum(['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN']),
  claims: z.array(z.object({
    statement: z.string(),
    type: z.enum(['FACT', 'INFERENCE', 'MISSING_DATA', 'USER_PROVIDED']),
    evidence_ids: z.array(z.string()),
    confidence: z.enum(['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'])
  })),
  evidence_ids: z.array(z.string()),
  related_entities: z.array(z.object({
    entity_id: z.string(),
    entity_type: z.enum(['BUSINESS', 'SUPPLIER', 'CUSTOMER', 'PRODUCT', 'INVOICE']),
    name: z.string(),
    relevance: z.enum(['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'])
  })),
  warnings: z.array(z.string()).optional()
});

export const executeMemoryAgent = async (context: RouterContext, entities: any[]) => {
  // 1. Context retrieval pipeline (Entities, Edges, Memory Events)
  const [entityData, eventData] = await Promise.all([
    queryByPrefix(context.tenantId, 'ENT#', { limit: 50 }),
    queryByPrefix(context.tenantId, 'EVT#', { limit: 50 })
  ]);
  
  const contextStr = JSON.stringify({
    entities: entityData.items,
    history: eventData.items
  });
  
  const systemPrompt = getMemoryPrompt(contextStr);

  const response = await bedrockClient.send(new InvokeModelCommand({
    modelId: 'anthropic.claude-3-5-sonnet-20240620-v1:0', // upgraded model
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        { role: 'user', content: context.query }
      ]
    })
  }));

  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  const rawText = responseBody.content[0].text;
  
  let agentResponse;
  try {
    const jsonStr = rawText.substring(rawText.indexOf('{'), rawText.lastIndexOf('}') + 1);
    const parsed = JSON.parse(jsonStr);
    
    // Zod schema verification (Evidence Gate)
    agentResponse = MemoryResponseSchema.parse(parsed);

    // Read-after-generation verification: Check if all cited evidence_ids actually exist in the context
    // This implements the strict verification required by DukaanOS 2.0
    const providedEvidenceIds = new Set(agentResponse.claims.flatMap(c => c.evidence_ids));
    const validEvidenceIds = new Set([...entityData.items.map(i => i.SK), ...eventData.items.map(i => i.SK)]);
    
    const invalidIds = Array.from(providedEvidenceIds).filter(id => !validEvidenceIds.has(id));
    if (invalidIds.length > 0) {
       console.warn(`[ActionVerifier] AI Hallucinated evidence IDs: ${invalidIds.join(', ')}`);
       agentResponse.warnings = [...(agentResponse.warnings || []), `Warning: AI cited untraceable evidence IDs: ${invalidIds.join(', ')}`];
    }
  } catch (e) {
    console.error('Failed MemoryAgent Validation:', e);
    agentResponse = { 
      answer: "I couldn't process the response reliably. Please ensure your query is specific.", 
      claims: [], 
      evidence_ids: [], 
      related_entities: [],
      confidence: 'LOW' 
    };
  }

  return {
    agent_id: 'MEMORY_AGENT',
    agent_version: 'v2.0',
    model_id: 'claude-3-5-sonnet',
    prompt_version: 'v2',
    request_id: context.requestId,
    tenant_id: context.tenantId,
    ...agentResponse
  };
};
