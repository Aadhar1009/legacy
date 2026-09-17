import { Context, Next } from 'hono';

export const requirePermission = (requiredPermission: string) => {
  return async (c: Context, next: Next) => {
    const permissions = c.get('permissions') as string[];
    const role = c.get('role');

    if (role === 'admin') {
      return next();
    }

    if (!permissions || !permissions.includes(requiredPermission)) {
      return c.json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Missing required permission: ${requiredPermission}`
        },
        requestId: c.get('requestId')
      }, 403);
    }

    await next();
  };
};
