import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { executeMemoryAgent } from './memoryAgent';
import { executeSupplierAgent } from './supplierAgent';
import { z } from 'zod';

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'ap-south-1' });

export interface RouterContext {
  tenantId: string;
  query: string;
  requestId: string;
}

const RouterSchema = z.object({
  intent: z.enum([
    'memory_query', 
    'supplier_price_comparison', 
    'supplier_analysis', 
    'warranty_check', 
    'inventory_query', 
    'customer_query', 
    'action_proposal'
  ]),
  target_agent: z.enum(['MEMORY', 'SUPPLIER', 'WARRANTY', 'WORKFLOW', 'REVIEW']),
  entities: z.array(z.object({
    type: z.string(),
    name: z.string()
  })),
  confidence: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  requires_write: z.boolean(),
  policy_gate: z.enum([
    'READ_ONLY', 
    'LOW_RISK_WRITE', 
    'MEDIUM_RISK_WRITE', 
    'EXTERNAL_COMMUNICATION', 
    'FINANCIAL', 
    'DESTRUCTIVE'
  ])
});

export const routeQuery = async (context: RouterContext) => {
  const systemPrompt = `You are the DukaanOS Router Agent. You triage incoming requests and strictly enforce policy gates.
  
Determine the intent and required agent.
CRITICAL SECURITY RULES:
- If a user asks to delete records, set policy_gate to DESTRUCTIVE.
- If a user asks to draft an email/message, set policy_gate to EXTERNAL_COMMUNICATION.
- If a user just asks a question, set requires_write to false and policy_gate to READ_ONLY.
- NEVER allow FINANCIAL transactions automatically.

Output strictly valid JSON matching this schema:
{
  "intent": "memory_query",
  "target_agent": "MEMORY",
  "entities": [{"type": "PRODUCT", "name": "TV"}],
  "confidence": "HIGH",
  "requires_write": false,
  "policy_gate": "READ_ONLY"
}`;
  
  const response = await bedrockClient.send(new InvokeModelCommand({
    modelId: 'anthropic.claude-3-haiku-20240307-v1:0', // Fast model for routing
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 300,
      system: systemPrompt,
      messages: [
        { role: 'user', content: context.query }
      ]
    })
  }));

  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  const rawText = responseBody.content[0].text;
  
  let routingDecision;
  try {
    const jsonStr = rawText.substring(rawText.indexOf('{'), rawText.lastIndexOf('}') + 1);
    routingDecision = RouterSchema.parse(JSON.parse(jsonStr));
  } catch (e) {
    console.error('Failed to parse or validate router output. Defaulting to safe READ_ONLY memory route.', rawText);
    routingDecision = { 
      intent: 'memory_query', target_agent: 'MEMORY', entities: [], 
      confidence: 'LOW', requires_write: false, policy_gate: 'READ_ONLY' 
    };
  }
  
  console.log(JSON.stringify({
    level: 'info',
    message: 'Router classification complete',
    requestId: context.requestId,
    routingDecision
  }));

  // Enforcement of Policy Gates
  if (routingDecision.policy_gate === 'DESTRUCTIVE' || routingDecision.policy_gate === 'FINANCIAL') {
    return {
      answer: "I am restricted from executing destructive or direct financial transactions.",
      confidence: "HIGH",
      claims: [],
      evidence_ids: [],
      related_entities: [],
      warnings: ["Action blocked by router policy gate: " + routingDecision.policy_gate]
    };
  }

  switch (routingDecision.target_agent) {
    case 'SUPPLIER':
      return await executeSupplierAgent(context, routingDecision.entities.map((e: any) => e.name));
    case 'MEMORY':
    default:
      return await executeMemoryAgent(context, routingDecision.entities);
  }
};
