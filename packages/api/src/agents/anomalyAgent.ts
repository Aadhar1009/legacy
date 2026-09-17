import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { RouterContext } from './router';

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

export const executeAnomalyAgent = async (context: RouterContext, documentData: any) => {
  const systemPrompt = `You are the DukaanOS Anomaly Agent.
Your job is to asynchronously review newly processed document data against historical norms to detect anomalies.
Look for:
1. Drastic price changes (e.g. >10% jump)
2. Duplicate invoices or conflicting dates
3. Unusually high quantities or totals
If an anomaly is found, return an ALERT payload.

Document Data to Analyze:
<DATA>
${JSON.stringify(documentData)}
</DATA>
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
        { role: 'user', content: "Analyze the provided document data for any business anomalies." }
      ]
    })
  }));

  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  const rawText = responseBody.content[0].text;
  
  try {
    const jsonStr = rawText.substring(rawText.indexOf('{'), rawText.lastIndexOf('}') + 1);
    return JSON.parse(jsonStr);
  } catch (e) {
    return null; // No parseable anomaly found
  }
};
