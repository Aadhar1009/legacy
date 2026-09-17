import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { RouterContext } from './router';
import { getMemoryPrompt } from './prompts/memory.v1';
import { queryByPrefix } from '../db/operations';

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'ap-south-1' });

export const executeMemoryAgent = async (context: RouterContext, entities: string[]) => {
  // 1. Gather context from DB
  const data = await queryByPrefix(context.tenantId, 'ENTITY#', { limit: 20 });
  const contextStr = JSON.stringify(data.items);
  
  const systemPrompt = getMemoryPrompt(contextStr);

  const response = await bedrockClient.send(new InvokeModelCommand({
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
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
  
  let agentResponse;
  try {
    const jsonStr = rawText.substring(rawText.indexOf('{'), rawText.lastIndexOf('}') + 1);
    agentResponse = JSON.parse(jsonStr);
  } catch (e) {
    agentResponse = { answer: "I couldn't process the response.", claims: [], evidence: [], confidence: 0 };
  }

  return agentResponse;
};
