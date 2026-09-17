# DynamoDB Data Model

DukaanOS uses a Single-Table Design pattern to store its entire Knowledge Graph. This provides zero-idle costs, extreme scale, and fast relational lookups without JOINs.

## Table Details
- **Table Name:** `DukaanOS-BusinessMemory`
- **Billing Mode:** PAY_PER_REQUEST (On-Demand)
- **Partition Key (PK):** String
- **Sort Key (SK):** String
- **Global Secondary Indexes:**
  - `GSI1`: Inverted Index (Target → Source Graph Traversal)
  - `GSI2`: Temporal Index (Entity Type + Timestamp)

## Primary Access Patterns

| Access Pattern | PK | SK | GSI | Notes |
|----------------|----|----|-----|-------|
| **Get Tenant Config** | `TENANT#<tenant_id>` | `METADATA` | - | Fetches core business details. |
| **Get Document** | `TENANT#<tenant_id>` | `DOC#<doc_id>` | - | Gets specific document record. |
| **List Documents by Date** | - | - | **GSI2** `PK=TENANT#<id>#TYPE#DOCUMENT`, `SK=DATE#<iso>` | Chronological document history. |
| **Get Entity** | `TENANT#<tenant_id>` | `ENT#<type>#<entity_id>` | - | Gets Supplier, Customer, Product, etc. |
| **List Entities by Type** | - | - | **GSI2** `PK=TENANT#<id>#TYPE#<type>`, `SK=DATE#<iso>` | E.g. List all suppliers. |
| **Get Outgoing Edges** | `TENANT#<tenant_id>` | `EDGE#<source_id>#<relation>#<target_id>` | - | Finds what an entity is connected to. |
| **Get Incoming Edges** | - | - | **GSI1** `PK=TENANT#<id>#<target_id>`, `SK=EDGE#<relation>#<source_id>` | Inverted graph traversal. |
| **Price History** | `TENANT#<tenant_id>` | `PRICE#<supplier_id>#<product_id>#<date>` | - | Tracks unit price changes over time. |
| **Get Alert** | `TENANT#<tenant_id>` | `ALERT#<iso>#<alert_id>` | - | Alert logs sorted by date. |
| **Audit Logs** | `TENANT#<tenant_id>` | `AUDIT#<iso>#<event_id>` | - | Immutable action history. |

## Knowledge Graph (Adjacency List)

Instead of a dedicated graph database, relationships are modeled as Edges (`EDGE#...`) in the table. 

**Example: A Supplier supplying a Product**
- **Node A (Supplier):** `PK: TENANT#123`, `SK: ENT#SUPPLIER#SUP001`
- **Node B (Product):** `PK: TENANT#123`, `SK: ENT#PRODUCT#PRD001`
- **Edge (A → B):** `PK: TENANT#123`, `SK: EDGE#SUP001#SUPPLIES#PRD001`
  - `GSI1PK: TENANT#123#PRD001`
  - `GSI1SK: EDGE#SUPPLIED_BY#SUP001`

By querying `GSI1`, we can instantly find all suppliers that supply `PRD001`.

## Temporal Modeling
Prices, warranties, and relationships change over time. 
DukaanOS uses an **append-only** model for historical records (like `PRICE#...`). The most recent state is computed or stored in the main Entity record.
