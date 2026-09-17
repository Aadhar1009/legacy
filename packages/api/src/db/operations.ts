import { PutCommand, GetCommand, QueryCommand, UpdateCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './client';

export const putEntity = async (tenantId: string, sk: string, item: any, idempotencyKey?: string) => {
  const params: any = {
    TableName: TABLE_NAME,
    Item: {
      PK: `TENANT#${tenantId}`,
      SK: sk,
      ...item,
      updatedAt: new Date().toISOString()
    }
  };
  
  if (idempotencyKey) {
    params.ConditionExpression = 'attribute_not_exists(idempotencyKey) OR idempotencyKey <> :idempotencyKey';
    params.ExpressionAttributeValues = { ':idempotencyKey': idempotencyKey };
    params.Item.idempotencyKey = idempotencyKey;
  }

  await docClient.send(new PutCommand(params));
  return params.Item;
};

export const getEntity = async (tenantId: string, sk: string) => {
  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `TENANT#${tenantId}`,
      SK: sk
    }
  }));
  return result.Item;
};

export const queryByPrefix = async (tenantId: string, skPrefix: string, options?: { limit?: number, lastEvaluatedKey?: any }) => {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    ExpressionAttributeValues: {
      ':pk': `TENANT#${tenantId}`,
      ':skPrefix': skPrefix
    },
    Limit: options?.limit,
    ExclusiveStartKey: options?.lastEvaluatedKey
  }));
  
  return {
    items: result.Items || [],
    lastEvaluatedKey: result.LastEvaluatedKey
  };
};

export const queryGSI = async (indexName: string, pkValue: string, skPrefix?: string, options?: { limit?: number, lastEvaluatedKey?: any }) => {
  let keyCondition = 'GSI1PK = :pk';
  const values: any = { ':pk': pkValue };
  
  if (skPrefix) {
    keyCondition += ' AND begins_with(GSI1SK, :skPrefix)';
    values[':skPrefix'] = skPrefix;
  }

  // Adjust for actual GSI PK/SK names if different
  const actualPkName = indexName.includes('GSI2') ? 'GSI2PK' : 'GSI1PK';
  const actualSkName = indexName.includes('GSI2') ? 'GSI2SK' : 'GSI1SK';
  
  keyCondition = keyCondition.replace('GSI1PK', actualPkName).replace('GSI1SK', actualSkName);

  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: indexName,
    KeyConditionExpression: keyCondition,
    ExpressionAttributeValues: values,
    Limit: options?.limit,
    ExclusiveStartKey: options?.lastEvaluatedKey
  }));
  
  return {
    items: result.Items || [],
    lastEvaluatedKey: result.LastEvaluatedKey
  };
};

export const transactWrite = async (items: any[]) => {
  await docClient.send(new TransactWriteCommand({
    TransactItems: items
  }));
};

export const updateEntity = async (tenantId: string, sk: string, updates: Record<string, any>) => {
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};

  for (const [key, value] of Object.entries(updates)) {
    updateExpressions.push(`#${key} = :${key}`);
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = value;
  }
  
  updateExpressions.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();

  const result = await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `TENANT#${tenantId}`,
      SK: sk
    },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  }));
  
  return result.Attributes;
};
