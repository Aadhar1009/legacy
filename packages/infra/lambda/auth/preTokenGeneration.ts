export const handler = async (event: any) => {
  const role = event.request.userAttributes['custom:role'] || 'VIEWER';
  const tenant_id = event.request.userAttributes['custom:tenant_id'] || 'UNKNOWN';

  const getPermissions = (role: string) => {
    switch (role) {
      case 'OWNER': return 'all';
      case 'MANAGER': return 'docs:read,docs:write,docs:delete,bi:query,users:invite';
      case 'STAFF': return 'docs:read,docs:write,bi:query';
      case 'VIEWER': return 'docs:read,bi:query:read';
      default: return 'docs:read';
    }
  };

  const claimsToAddOrOverride = {
    'custom:tenant_id': tenant_id,
    'custom:role': role,
    'custom:permissions': getPermissions(role)
  };

  event.response = {
    claimsOverrideDetails: {
      claimsToAddOrOverride,
      groupOverrideDetails: {
        groupsToOverride: [role]
      }
    }
  };

  return event;
};
