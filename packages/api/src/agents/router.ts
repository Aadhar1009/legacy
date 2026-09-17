import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { getRouterPrompt } from './prompts/router.v1';
import { executeMemoryAgent } from './memoryAgent';
import { executeSupplierAgent } from './supplierAgent';

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'ap-south-1' });

export interface RouterContext {
  tenantId: string;
  query: string;
  requestId: string;
}

export const routeQuery = async (context: RouterContext) => {
  const prompt = getRouterPrompt(context.query);
  
  const response = await bedrockClient.send(new InvokeModelCommand({
    modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 200,
      system: prompt,
      messages: [
        { role: 'user', content: context.query }
      ]
    })
  }));

  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  const rawText = responseBody.content[0].text;
  
  let intent;
  try {
    const jsonStr = rawText.substring(rawText.indexOf('{'), rawText.lastIndexOf('}') + 1);
    intent = JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse router output', rawText);
    intent = { intent: 'memory', entities: [] }; // fallback
  }
  
  console.log(JSON.stringify({
    level: 'info',
    message: 'Router classification',
    requestId: context.requestId,
    intent
  }));

  switch (intent.intent) {
    case 'supplier':
      return await executeSupplierAgent(context, intent.entities);
    case 'memory':
    default:
      return await executeMemoryAgent(context, intent.entities);
  }
};
