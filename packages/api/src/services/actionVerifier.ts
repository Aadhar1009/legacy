import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

/**
 * ActionVerifier
 * 
 * Implements the "Read-after-write verification" pattern.
 * Agents cannot declare their own success. After an action is supposedly executed,
 * this verifier independently reads the database to confirm the state change.
 */
export async function verifyActionExecution(
  ddb: DynamoDBDocumentClient,
  tableName: string,
  tenantId: string,
  actionId: string,
  expectedTargetEntityId: string,
  expectedChange: { field: string; expectedValue: any }
): Promise<boolean> {
  console.log(`[ActionVerifier] Starting verification for Action ${actionId}`);
  
  try {
    // 1. Independent Read of the Target Entity
    const response = await ddb.send(new GetCommand({
      TableName: tableName,
      Key: {
        PK: `TENANT#${tenantId}`,
        SK: expectedTargetEntityId
      }
    }));

    const entity = response.Item;
    if (!entity) {
      console.warn(`[ActionVerifier] FAILED: Target entity ${expectedTargetEntityId} does not exist.`);
      await markActionFailed(ddb, tableName, tenantId, actionId, 'Target entity missing');
      return false;
    }

    // 2. Verify State Change
    const actualValue = entity.attributes?.[expectedChange.field] || entity[expectedChange.field];
    if (actualValue !== expectedChange.expectedValue) {
      console.warn(`[ActionVerifier] FAILED: Field ${expectedChange.field} was ${actualValue}, expected ${expectedChange.expectedValue}`);
      await markActionFailed(ddb, tableName, tenantId, actionId, 'State change mismatch');
      return false;
    }

    // 3. Mark Verified
    console.log(`[ActionVerifier] SUCCESS: Action ${actionId} independently verified.`);
    await ddb.send(new UpdateCommand({
      TableName: tableName,
      Key: { PK: `TENANT#${tenantId}`, SK: actionId },
      UpdateExpression: "SET #st = :s, verification_timestamp = :t",
      ExpressionAttributeNames: { "#st": "status" },
      ExpressionAttributeValues: { ":s": "VERIFIED_COMPLETED", ":t": new Date().toISOString() }
    }));

    return true;

  } catch (err) {
    console.error(`[ActionVerifier] Exception during verification`, err);
    return false;
  }
}

async function markActionFailed(ddb: DynamoDBDocumentClient, tableName: string, tenantId: string, actionId: string, reason: string) {
  await ddb.send(new UpdateCommand({
    TableName: tableName,
    Key: { PK: `TENANT#${tenantId}`, SK: actionId },
    UpdateExpression: "SET #st = :s, verification_error = :e",
    ExpressionAttributeNames: { "#st": "status" },
    ExpressionAttributeValues: { ":s": "VERIFICATION_FAILED", ":e": reason }
  }));
}
