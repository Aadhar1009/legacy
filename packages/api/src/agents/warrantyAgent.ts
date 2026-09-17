import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { RouterContext } from './router';
import { queryByPrefix } from '../db/operations';

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

export const executeWarrantyAgent = async (context: RouterContext, entities: string[]) => {
  // 1. Gather warranty and product context
  const warranties = await queryByPrefix(context.tenantId, 'ENT#WARRANTY#', { limit: 50 });
  const contextStr = JSON.stringify(warranties.items);
  
  const systemPrompt = `You are the DukaanOS Warranty Agent.
Your job is to analyze warranty data and answer questions about coverage and expiry.
Always cite your answers using the warranty ID.
Distinguish between ACTIVE and EXPIRED warranties based on the current date: ${new Date().toISOString()}.

Data Context:
<CONTEXT>
${contextStr}
</CONTEXT>
`;

  const response = await bedrockClient.send(new InvokeModelCommand({
    modelId: process.env.BEDROCK_MODEL_SONNET || 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: context.query }
      ]
    })
  }));

  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  const rawText = responseBody.content[0].text;
  
  try {
    const jsonStr = rawText.substring(rawText.indexOf('{'), rawText.lastIndexOf('}') + 1);
    return JSON.parse(jsonStr);
  } catch (e) {
    return { answer: "I couldn't process the warranty response.", claims: [], evidence: [], confidence: 0 };
  }
};
