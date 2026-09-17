import { putEntity } from '../db/operations';
import { ulid } from 'ulid';

export interface AuditEvent {
  tenantId: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details?: Record<string, any>;
}

export const logAuditEvent = async (event: AuditEvent) => {
  const timestamp = new Date().toISOString();
  const eventId = ulid();
  const sk = `AUDIT#${timestamp}#${eventId}`;
  
  await putEntity(event.tenantId, sk, {
    eventId,
    timestamp,
    ...event
  });
};
