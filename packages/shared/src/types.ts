// DukaanOS Shared Types
// These types are used across API, processing, and frontend packages.
// All financial amounts are stored in paise (1 rupee = 100 paise) to avoid floating-point issues.

// ─── Entity Types ───────────────────────────────────────────────────────────

export type EntityType =
  | 'BUSINESS'
  | 'OWNER'
  | 'EMPLOYEE'
  | 'CUSTOMER'
  | 'SUPPLIER'
  | 'PRODUCT'
  | 'PRODUCT_CATEGORY'
  | 'INVOICE'
  | 'PURCHASE'
  | 'SALE'
  | 'PAYMENT'
  | 'WARRANTY'
  | 'SERVICE_CASE'
  | 'DOCUMENT'
  | 'MESSAGE'
  | 'TASK'
  | 'ALERT'
  | 'EVENT'
  | 'DECISION'
  | 'PRICE_RECORD'
  | 'CONTACT'
  | 'LOCATION';

export type RelationshipType =
  | 'HAS_CUSTOMER'
  | 'HAS_SUPPLIER'
  | 'SUPPLIES'
  | 'PURCHASED'
  | 'REFERENCES'
  | 'HAS_WARRANTY'
  | 'HAS_SERVICE_CASE'
  | 'EVIDENCES'
  | 'DERIVED_FROM'
  | 'OFFERED_PRICE'
  | 'ABOUT'
  | 'CREATED_FROM'
  | 'SUPERSEDES'
  | 'RELATED_TO';

// ─── Temporal Status ────────────────────────────────────────────────────────

export type TemporalStatus = 'CURRENT' | 'HISTORICAL' | 'EXPIRED' | 'SUPERSEDED' | 'UNKNOWN';

// ─── Confidence ─────────────────────────────────────────────────────────────

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

// ─── Claim Types ────────────────────────────────────────────────────────────

export type ClaimType = 'FACT' | 'INFERENCE' | 'MISSING_DATA' | 'USER_PROVIDED';

// ─── Document Types ─────────────────────────────────────────────────────────

export type DocumentType =
  | 'SUPPLIER_INVOICE'
  | 'CUSTOMER_INVOICE'
  | 'WARRANTY_CARD'
  | 'RECEIPT'
  | 'QUOTATION'
  | 'PRODUCT_DOCUMENT'
  | 'SPREADSHEET'
  | 'OTHER';

export type DocumentStatus =
  | 'UPLOADING'
  | 'UPLOADED'
  | 'PROCESSING'
  | 'PENDING_REVIEW'
  | 'COMPLETED'
  | 'FAILED'
  | 'RETRY';

// ─── User Roles ─────────────────────────────────────────────────────────────

export type UserRole = 'OWNER' | 'MANAGER' | 'STAFF' | 'VIEWER';

// ─── Policy Categories ──────────────────────────────────────────────────────

export type PolicyCategory =
  | 'READ_ONLY'
  | 'LOW_RISK_WRITE'
  | 'HIGH_RISK_WRITE'
  | 'EXTERNAL_COMMUNICATION'
  | 'FINANCIAL_ACTION'
  | 'DESTRUCTIVE_ACTION';

// ─── Alert Severity ─────────────────────────────────────────────────────────

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

// ─── Action Status ──────────────────────────────────────────────────────────

export type ActionStatus = 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'FAILED';

// ─── Core Interfaces ────────────────────────────────────────────────────────

export interface Provenance {
  source_document_id: string;
  page_number?: number;
  bounding_region?: { x: number; y: number; width: number; height: number };
  extraction_method: 'TEXTRACT' | 'BEDROCK' | 'MANUAL' | 'SYSTEM';
  extraction_confidence: ConfidenceLevel;
  timestamp: string;
  model_version?: string;
  human_correction?: {
    corrected_by: string;
    corrected_at: string;
    original_value: string;
    corrected_value: string;
  };
}

export interface Entity {
  entity_id: string;
  tenant_id: string;
  entity_type: EntityType;
  name: string;
  attributes: Record<string, unknown>;
  temporal_status: TemporalStatus;
  provenance: Provenance[];
  created_at: string;
  updated_at: string;
}

export interface Relationship {
  relationship_id: string;
  tenant_id: string;
  source_entity_id: string;
  source_entity_type: EntityType;
  target_entity_id: string;
  target_entity_type: EntityType;
  relationship_type: RelationshipType;
  attributes: Record<string, unknown>;
  temporal_status: TemporalStatus;
  provenance: Provenance[];
  created_at: string;
}

export interface TimelineEvent {
  event_id: string;
  tenant_id: string;
  entity_id: string;
  event_type: string;
  title: string;
  description: string;
  timestamp: string;
  evidence_ids: string[];
  metadata: Record<string, unknown>;
}

// ─── Document Interfaces ────────────────────────────────────────────────────

export interface DocumentRecord {
  document_id: string;
  tenant_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  s3_key: string;
  document_type: DocumentType;
  status: DocumentStatus;
  uploaded_by: string;
  uploaded_at: string;
  processed_at?: string;
  document_hash: string;
  extraction_result?: ExtractionResult;
}

export interface ExtractionResult {
  supplier_name?: string;
  invoice_number?: string;
  invoice_date?: string;
  due_date?: string;
  line_items: LineItem[];
  subtotal_paise?: number;
  tax_paise?: number;
  total_paise?: number;
  currency: string;
  payment_terms?: string;
  confidence_scores: Record<string, number>;
  requires_human_review: boolean;
  raw_textract_fields?: Record<string, unknown>;
}

export interface LineItem {
  item_index: number;
  description: string;
  quantity?: number;
  unit_price_paise?: number;
  total_price_paise?: number;
  product_code?: string;
  hsn_code?: string;
}

// ─── Agent Contracts ────────────────────────────────────────────────────────

export type AgentIntent =
  | 'memory_query'
  | 'supplier_price_comparison'
  | 'supplier_analysis'
  | 'warranty_check'
  | 'inventory_query'
  | 'customer_query'
  | 'anomaly_detection'
  | 'action_proposal'
  | 'unknown';

export interface AgentRequest {
  request_id: string;
  tenant_id: string;
  user_id: string;
  query: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

export interface AgentResponse {
  agent_id: string;
  agent_version: string;
  model_id: string;
  prompt_version: string;
  timestamp: string;
  request_id: string;
  tenant_id: string;

  intent: AgentIntent;
  entities: EntityReference[];
  claims: Claim[];
  evidence_ids: string[];
  confidence: ConfidenceLevel;

  answer: string;
  recommended_action: ProposedAction | null;
  warnings: string[];

  token_usage?: { input: number; output: number };
  latency_ms: number;
}

export interface EntityReference {
  entity_id: string;
  entity_type: EntityType;
  name: string;
  relevance: ConfidenceLevel;
}

export interface Claim {
  statement: string;
  type: ClaimType;
  evidence_ids: string[];
  confidence: ConfidenceLevel;
}

export interface Evidence {
  evidence_id: string;
  source_document_id: string;
  source_type: 'DOCUMENT' | 'EXTRACTION' | 'USER_INPUT' | 'SYSTEM';
  excerpt: string;
  page_number?: number;
  entity_id?: string;
  timestamp: string;
  extraction_confidence: ConfidenceLevel;
}

// ─── Action / Workflow ──────────────────────────────────────────────────────

export interface ProposedAction {
  action_id: string;
  action_type: 'SUPPLIER_FOLLOWUP' | 'CUSTOMER_REMINDER' | 'INTERNAL_TASK' | 'DRAFT_MESSAGE' | 'WARRANTY_FOLLOWUP' | 'INVENTORY_REVIEW';
  title: string;
  description: string;
  reason: string;
  evidence_ids: string[];
  policy_category: PolicyCategory;
  proposed_by: 'SYSTEM' | string;
  proposed_at: string;
  status: ActionStatus;
  approved_by?: string;
  approved_at?: string;
  executed_at?: string;
  payload: Record<string, unknown>;
}

// ─── Alert ──────────────────────────────────────────────────────────────────

export interface Alert {
  alert_id: string;
  tenant_id: string;
  title: string;
  severity: AlertSeverity;
  what_changed: string;
  why_it_matters: string;
  evidence_ids: string[];
  recommended_action?: string;
  entity_ids: string[];
  created_at: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
}

// ─── Audit Log ──────────────────────────────────────────────────────────────

export type AuditEventType =
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_PROCESSED'
  | 'ENTITY_CREATED'
  | 'ENTITY_UPDATED'
  | 'AI_QUERY'
  | 'AI_ANSWER_GENERATED'
  | 'EVIDENCE_RETRIEVED'
  | 'ALERT_CREATED'
  | 'ACTION_PROPOSED'
  | 'ACTION_APPROVED'
  | 'ACTION_REJECTED'
  | 'ACTION_EXECUTED'
  | 'USER_CORRECTION'
  | 'MEMORY_UPDATED'
  | 'USER_LOGIN'
  | 'USER_SIGNUP'
  | 'BUSINESS_CREATED';

export interface AuditEvent {
  event_id: string;
  tenant_id: string;
  event_type: AuditEventType;
  actor_id: string;
  actor_type: 'USER' | 'SYSTEM' | 'AGENT';
  object_type: string;
  object_id: string;
  result: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  metadata: Record<string, unknown>;
  correlation_id: string;
  timestamp: string;
}

// ─── Memory Event (Memory Evolution) ────────────────────────────────────────

export interface MemoryEvent {
  memory_event_id: string;
  tenant_id: string;
  entity_id: string;
  field: string;
  old_value: string | null;
  new_value: string;
  source_id: string;
  reason: string;
  timestamp: string;
  actor: string;
  confidence: ConfidenceLevel;
}

// ─── API Response Types ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  request_id: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    request_id: string;
    details?: Record<string, unknown>;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total?: number;
    next_cursor?: string;
    has_more: boolean;
  };
  request_id: string;
  timestamp: string;
}

// ─── Business Memory Query ──────────────────────────────────────────────────

export interface MemoryQueryRequest {
  query: string;
  context?: {
    entity_type?: EntityType;
    entity_id?: string;
    date_range?: { start: string; end: string };
  };
}

export interface MemoryQueryResponse {
  answer: string;
  claims: Claim[];
  evidence: Evidence[];
  related_entities: EntityReference[];
  confidence: ConfidenceLevel;
  suggested_actions: ProposedAction[];
  agent_metadata: {
    agent_id: string;
    model_id: string;
    prompt_version: string;
    latency_ms: number;
    token_usage?: { input: number; output: number };
  };
}
