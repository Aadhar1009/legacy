import { Context, Next } from 'hono';

export const tenantContext = async (c: Context, next: Next) => {
  // In API Gateway + Lambda integration, authorizer claims are passed in event
  const event = c.env?.event as any;
  const claims = event?.requestContext?.authorizer?.jwt?.claims || {};

  const tenantId = claims['custom:tenant_id'] || claims.tenant_id;
  const userId = claims.sub || claims.userId;
  const role = claims['custom:role'] || claims.role;
  const permissionsStr = claims['custom:permissions'] || claims.permissions;

  // if (!tenantId) {
  //   return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing tenant ID' }, requestId: c.get('requestId') }, 401);
  // }

  c.set('tenantId', tenantId || 'default-tenant');
  c.set('userId', userId || 'unknown-user');
  c.set('role', role || 'user');
  
  let permissions: string[] = [];
  try {
    if (typeof permissionsStr === 'string') {
      permissions = JSON.parse(permissionsStr);
    } else if (Array.isArray(permissionsStr)) {
      permissions = permissionsStr;
    }
  } catch (e) {
    // ignore
  }
  c.set('permissions', permissions);

  await next();
};
