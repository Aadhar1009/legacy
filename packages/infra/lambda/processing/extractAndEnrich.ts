import { TextractClient, AnalyzeExpenseCommand } from '@aws-sdk/client-textract';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, TransactWriteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import * as crypto from 'crypto';

const textract = new TextractClient({});
const bedrock = new BedrockRuntimeClient({});
const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

async function resolveSupplier(tenantId: string, name: string, gstin?: string, phone?: string) {
  const normalizedName = name.trim().toLowerCase();
  
  const response = await ddb.send(new QueryCommand({
    TableName: process.env.TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    ExpressionAttributeValues: {
      ':pk': `TENANT#${tenantId}`,
      ':skPrefix': 'ENT#SUPPLIER#'
    }
  }));

  const suppliers = response.Items || [];

  for (const sup of suppliers) {
    const attrs = sup.attributes || {};
    if (gstin && attrs.gstin === gstin) return { entity: sup, match_type: 'EXACT_GSTIN' };
    if (phone && attrs.phone === phone) return { entity: sup, match_type: 'EXACT_PHONE' };
    if (sup.name.trim().toLowerCase() === normalizedName) return { entity: sup, match_type: 'EXACT_NAME' };
  }

  for (const sup of suppliers) {
    const existingNormalized = sup.name.trim().toLowerCase();
    if (existingNormalized.includes(normalizedName) || normalizedName.includes(existingNormalized)) {
      if (normalizedName.length > 5 && existingNormalized.length > 5) {
         return { entity: sup, match_type: 'FUZZY_NAME' };
      }
    }
  }

  return { 
    entity: {
      PK: `TENANT#${tenantId}`,
      SK: `ENT#SUPPLIER#${crypto.randomUUID()}`,
      entity_id: `ENT#SUPPLIER#${crypto.randomUUID()}`,
      tenant_id: tenantId,
      entity_type: 'SUPPLIER',
      name: name,
      attributes: {},
      temporal_status: 'CURRENT'
    },
    match_type: 'NEW' 
  };
}

export const handler = async (event: any) => {
  console.log('Event:', JSON.stringify(event));
  const { bucket, key, tenant_id, docId } = event;

  try {
    // 1. Textract
    const textractResponse = await textract.send(new AnalyzeExpenseCommand({
      Document: { S3Object: { Bucket: bucket, Name: key } }
    }));
    const rawText = textractResponse.ExpenseDocuments?.map(d => JSON.stringify(d)).join(' ') || '';

    // 2. Bedrock Structured Extraction
    const schema = {
      type: "object",
      properties: {
        supplier: {
          type: "object",
          properties: {
            name: { type: "string" },
            gstin: { type: "string" },
            phone: { type: "string" },
          },
          required: ["name"]
        },
        invoice: {
          type: "object",
          properties: {
            invoice_number: { type: "string" },
            date: { type: "string" },
            total_paise: { type: "number" },
            eway_bill: { type: "string", description: "Indian E-Way Bill Number for logistics tracking" },
            bilty_number: { type: "string", description: "Indian Transport LR/Bilty Number" },
            credit_days: { type: "number", description: "Khata/Credit terms in days" }
          },
          required: ["date", "total_paise"]
        },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              product_name: { type: "string" },
              unit_price_paise: { type: "number" },
              quantity: { type: "number" }
            },
            required: ["product_name", "unit_price_paise"]
          }
        }
      },
      required: ["supplier", "invoice", "items"]
    };

    const bedrockReq = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 1000,
      system: "You are an expert OCR JSON extractor. Extract invoice details exactly matching the provided JSON schema. Do NOT wrap in markdown.",
      messages: [
        {
          role: 'user',
          content: `Schema: ${JSON.stringify(schema)}\n\nText:\n${rawText}`
        }
      ]
    };

    const bedrockResponse = await bedrock.send(new InvokeModelCommand({
      modelId: 'anthropic.claude-3-5-sonnet-20240620-v1:0', // upgraded to 3.5 Sonnet
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(bedrockReq)
    }));

    const responseBody = JSON.parse(new TextDecoder().decode(bedrockResponse.body));
    const extractedData = JSON.parse(responseBody.content?.[0]?.text || "{}");
    
    const timestamp = new Date().toISOString();
    const transactItems: any[] = [];
    
    // 3. Entity Resolution & Memory Evolution
    const { entity: supplier, match_type } = await resolveSupplier(tenant_id, extractedData.supplier.name, extractedData.supplier.gstin, extractedData.supplier.phone);
    
    let isSupplierUpdated = false;
    
    // Update supplier info if missing
    if (extractedData.supplier.gstin && !supplier.attributes.gstin) {
      supplier.attributes.gstin = extractedData.supplier.gstin;
      isSupplierUpdated = true;
    }
    
    // Gap Detection: Missing GSTIN
    if (!supplier.attributes.gstin) {
      transactItems.push({
        Put: {
          TableName: process.env.TABLE_NAME,
          Item: {
            PK: `TENANT#${tenant_id}`,
            SK: `GAP#${crypto.randomUUID()}`,
            gap_id: `GAP#${crypto.randomUUID()}`,
            tenant_id,
            entity_id: supplier.entity_id,
            gap_type: 'MISSING_FIELD',
            description: 'Supplier is missing a GSTIN.',
            severity: 'MEDIUM',
            evidence_ids: [docId],
            status: 'OPEN',
            created_at: timestamp
          }
        }
      });
    }

    // Gap Detection: Ghost Inventory (Missing Bilty)
    if (!extractedData.invoice?.bilty_number) {
      transactItems.push({
        Put: {
          TableName: process.env.TABLE_NAME,
          Item: {
            PK: `TENANT#${tenant_id}`,
            SK: `GAP#${crypto.randomUUID()}`,
            gap_id: `GAP#${crypto.randomUUID()}`,
            tenant_id,
            entity_id: docId,
            gap_type: 'LOGISTICS_RISK',
            description: 'Potential Ghost Inventory: Missing Bilty/LR Transport Number on Invoice.',
            severity: 'HIGH',
            evidence_ids: [docId],
            status: 'OPEN',
            created_at: timestamp
          }
        }
      });
    }

    // Memory Evolution (Price Changes)
    if (extractedData.items && extractedData.items.length > 0) {
      // Very basic example: take the first item's price and track it
      const topItem = extractedData.items[0];
      const oldPrice = supplier.attributes.latest_price_paise;
      const newPrice = topItem.unit_price_paise;
      
      supplier.attributes.latest_price_paise = newPrice;
      supplier.attributes.latest_product = topItem.product_name;
      isSupplierUpdated = true;

      if (oldPrice && oldPrice !== newPrice) {
        // Price changed! Create a Memory Event
        transactItems.push({
          Put: {
            TableName: process.env.TABLE_NAME,
            Item: {
              PK: `TENANT#${tenant_id}`,
              SK: `EVT#${crypto.randomUUID()}`,
              memory_event_id: `EVT#${crypto.randomUUID()}`,
              tenant_id,
              entity_id: supplier.entity_id,
              entity_type: 'SUPPLIER',
              attribute: 'latest_price_paise',
              old_value: String(oldPrice),
              new_value: String(newPrice),
              change_type: 'UPDATED',
              source_ids: [docId],
              actor_type: 'SYSTEM',
              actor_id: 'ExtractLambda',
              timestamp,
              confidence: 'HIGH',
              status: 'ACTIVE'
            }
          }
        });
      } else if (!oldPrice) {
        // Initial price recorded
        transactItems.push({
          Put: {
            TableName: process.env.TABLE_NAME,
            Item: {
              PK: `TENANT#${tenant_id}`,
              SK: `EVT#${crypto.randomUUID()}`,
              memory_event_id: `EVT#${crypto.randomUUID()}`,
              tenant_id,
              entity_id: supplier.entity_id,
              entity_type: 'SUPPLIER',
              attribute: 'latest_price_paise',
              old_value: null,
              new_value: String(newPrice),
              change_type: 'CREATED',
              source_ids: [docId],
              actor_type: 'SYSTEM',
              actor_id: 'ExtractLambda',
              timestamp,
              confidence: 'HIGH',
              status: 'ACTIVE'
            }
          }
        });
      }
    }

    // Save Supplier
    if (match_type === 'NEW' || isSupplierUpdated) {
      transactItems.push({
        Put: {
          TableName: process.env.TABLE_NAME,
          Item: {
            ...supplier,
            updated_at: timestamp,
            createdAt: supplier.createdAt || timestamp
          }
        }
      });
    }

    // Save Graph Edge (SUPPLIES)
    transactItems.push({
      Put: {
        TableName: process.env.TABLE_NAME,
        Item: {
          PK: `TENANT#${tenant_id}`,
          SK: `EDGE#${docId}#EVIDENCES#${supplier.entity_id}`,
          relationship_id: `EDGE#${crypto.randomUUID()}`,
          tenant_id,
          source_entity_id: docId,
          source_entity_type: 'DOCUMENT',
          target_entity_id: supplier.entity_id,
          target_entity_type: 'SUPPLIER',
          relationship_type: 'EVIDENCES',
          attributes: {},
          temporal_status: 'CURRENT',
          created_at: timestamp,
          GSI1PK: `TENANT#${tenant_id}`,
          GSI1SK: `EDGE#${supplier.entity_id}#EVIDENCED_BY#${docId}`
        }
      }
    });

    // Update Document Status
    transactItems.push({
      Update: {
        TableName: process.env.TABLE_NAME,
        Key: { PK: `TENANT#${tenant_id}`, SK: docId },
        UpdateExpression: "SET #st = :s, updatedAt = :u, extraction_result = :r",
        ExpressionAttributeNames: { "#st": "status" },
        ExpressionAttributeValues: { ":s": "COMPLETED", ":u": timestamp, ":r": extractedData }
      }
    });

    await ddb.send(new TransactWriteCommand({ TransactItems: transactItems }));
    return { status: 'SUCCESS' };
  } catch (error) {
    console.error('Extraction failed:', error);
    await ddb.send(new TransactWriteCommand({
      TransactItems: [{
        Update: {
          TableName: process.env.TABLE_NAME,
          Key: { PK: `TENANT#${tenant_id}`, SK: docId },
          UpdateExpression: "SET #st = :s, error = :e",
          ExpressionAttributeNames: { "#st": "status" },
          ExpressionAttributeValues: { ":s": "FAILED", ":e": String(error) }
        }
      }]
    }));
    throw error;
  }
};
