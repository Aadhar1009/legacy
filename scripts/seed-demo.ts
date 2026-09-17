import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables (fallback to local defaults)
const REGION = process.env.AWS_REGION || 'us-east-1';
const TABLE_NAME = process.env.TABLE_NAME || 'DukaanOS-BusinessMemory';
const TENANT_ID = 'tenant_sharma_001';

const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

async function seedData() {
  console.log(`🌱 Seeding demo data to table: ${TABLE_NAME} (Tenant: ${TENANT_ID})`);
  
  try {
    // 1. Read golden dataset
    const dataPath = path.join(__dirname, '../tests/evals/golden_dataset.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const dataset = JSON.parse(rawData);
    
    // 2. Insert Business Metadata
    console.log('Inserting business metadata...');
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `TENANT#${TENANT_ID}`,
        SK: 'METADATA',
        Name: dataset.business.name,
        Type: dataset.business.type,
        Owner: dataset.business.owner,
        Location: dataset.business.location,
        Established: dataset.business.established,
        CreatedAt: new Date().toISOString()
      }
    }));

    // 3. Insert Suppliers
    console.log(`Inserting ${dataset.suppliers.length} suppliers...`);
    for (const supplier of dataset.suppliers) {
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `TENANT#${TENANT_ID}`,
          SK: `ENT#SUPPLIER#${supplier.id}`,
          EntityType: 'SUPPLIER',
          Name: supplier.name,
          Contact: supplier.contact,
          Phone: supplier.phone,
          Location: supplier.location,
          GSI2PK: `TENANT#${TENANT_ID}#TYPE#SUPPLIER`,
          GSI2SK: `DATE#${new Date().toISOString()}`
        }
      }));
    }

    // 4. Insert Customers
    console.log(`Inserting ${dataset.customers.length} customers...`);
    for (const customer of dataset.customers) {
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `TENANT#${TENANT_ID}`,
          SK: `ENT#CUSTOMER#${customer.id}`,
          EntityType: 'CUSTOMER',
          Name: customer.name,
          Phone: customer.phone,
          Location: customer.location,
          GSI2PK: `TENANT#${TENANT_ID}#TYPE#CUSTOMER`,
          GSI2SK: `DATE#${new Date().toISOString()}`
        }
      }));
    }

    // 5. Insert Products
    console.log(`Inserting ${dataset.products.length} products...`);
    for (const product of dataset.products) {
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `TENANT#${TENANT_ID}`,
          SK: `ENT#PRODUCT#${product.id}`,
          EntityType: 'PRODUCT',
          Name: product.name,
          Category: product.category,
          HSN: product.hsn,
          GSI2PK: `TENANT#${TENANT_ID}#TYPE#PRODUCT`,
          GSI2SK: `DATE#${new Date().toISOString()}`
        }
      }));
    }

    // 6. Insert Invoices (with mock extraction results)
    console.log(`Inserting ${dataset.invoices.length} invoices...`);
    for (const invoice of dataset.invoices) {
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `TENANT#${TENANT_ID}`,
          SK: `DOC#${invoice.id}`,
          EntityType: 'INVOICE',
          DocumentId: invoice.id,
          SupplierId: invoice.supplier_id,
          Date: invoice.date,
          TotalPaise: invoice.total_paise,
          Status: 'COMPLETED',
          Items: invoice.items,
          GSI2PK: `TENANT#${TENANT_ID}#TYPE#DOCUMENT`,
          GSI2SK: `DATE#${invoice.date}T00:00:00Z`
        }
      }));
      
      // Insert Price Records (Edges) for each item
      for (const item of invoice.items) {
        await docClient.send(new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `TENANT#${TENANT_ID}`,
            SK: `PRICE#${invoice.supplier_id}#${item.product_id}#${invoice.date}`,
            SupplierId: invoice.supplier_id,
            ProductId: item.product_id,
            UnitPricePaise: item.unit_price_paise,
            Quantity: item.quantity,
            Date: invoice.date,
            SourceDocId: invoice.id
          }
        }));
      }
    }

    // 7. Insert Warranties
    console.log(`Inserting ${dataset.warranties.length} warranties...`);
    for (const warranty of dataset.warranties) {
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `TENANT#${TENANT_ID}`,
          SK: `ENT#WARRANTY#${warranty.id}`,
          EntityType: 'WARRANTY',
          ProductId: warranty.product_id,
          CustomerId: warranty.customer_id,
          StartDate: warranty.start_date,
          EndDate: warranty.end_date,
          Serial: warranty.serial,
          GSI2PK: `TENANT#${TENANT_ID}#TYPE#WARRANTY`,
          GSI2SK: `DATE#${warranty.end_date}T00:00:00Z`
        }
      }));
    }

    console.log('✅ Seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
