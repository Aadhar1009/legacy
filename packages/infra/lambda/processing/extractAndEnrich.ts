import { TextractClient, AnalyzeExpenseCommand } from '@aws-sdk/client-textract';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import * as crypto from 'crypto';

const textract = new TextractClient({});
const bedrock = new BedrockRuntimeClient({});
const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

export const handler = async (event: any) => {
  console.log('Event:', JSON.stringify(event));

  const { bucket, key, tenant_id, docId } = event;

  try {
    const textractResponse = await textract.send(new AnalyzeExpenseCommand({
      Document: {
        S3Object: {
          Bucket: bucket,
          Name: key
        }
      }
    }));
    
    // Simplistic extraction mapping
    const rawText = textractResponse.ExpenseDocuments?.map(d => JSON.stringify(d)).join(' ') || '';

    const bedrockReq = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `Extract structured data (supplier, products) from this document text:\n${rawText}`
        }
      ]
    };

    const bedrockResponse = await bedrock.send(new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(bedrockReq)
    }));

    const responseBody = JSON.parse(new TextDecoder().decode(bedrockResponse.body));
    const extractedData = responseBody.content?.[0]?.text || "{}";
    
    // Build TransactWriteItems
    const timestamp = new Date().toISOString();
    const supplierId = `SUP#${crypto.randomUUID()}`;
    
    await ddb.send(new TransactWriteCommand({
      TransactItems: [
        {
          Update: {
            TableName: process.env.TABLE_NAME,
            Key: {
              PK: `TENANT#${tenant_id}`,
              SK: docId
            },
            UpdateExpression: "SET #st = :s, updatedAt = :u",
            ExpressionAttributeNames: { "#st": "status" },
            ExpressionAttributeValues: { ":s": "COMPLETED", ":u": timestamp }
          }
        },
        {
          Put: {
            TableName: process.env.TABLE_NAME,
            Item: {
              PK: `TENANT#${tenant_id}`,
              SK: supplierId,
              type: 'Supplier',
              data: extractedData,
              createdAt: timestamp
            }
          }
        }
      ]
    }));

    return { status: 'SUCCESS' };
  } catch (error) {
    console.error('Extraction failed:', error);
    
    await ddb.send(new TransactWriteCommand({
      TransactItems: [
        {
          Update: {
            TableName: process.env.TABLE_NAME,
            Key: {
              PK: `TENANT#${tenant_id}`,
              SK: docId
            },
            UpdateExpression: "SET #st = :s, error = :e",
            ExpressionAttributeNames: { "#st": "status" },
            ExpressionAttributeValues: { ":s": "FAILED", ":e": String(error) }
          }
        }
      ]
    }));

    throw error;
  }
};
