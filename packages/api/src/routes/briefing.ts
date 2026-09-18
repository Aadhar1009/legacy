import { Hono } from 'hono';
import { queryByPrefix } from '../db/operations';

export const briefingRoutes = new Hono<{ Variables: { tenantId: string, requestId: string } }>();

briefingRoutes.get('/', async (c) => {
  const tenantId = c.var.tenantId;

  try {
    // 1. Gather all critical context concurrently
    const [suppliers, alerts, gaps, events] = await Promise.all([
      queryByPrefix(tenantId, 'ENT#SUPPLIER#', { limit: 10 }),
      queryByPrefix(tenantId, 'ALT#', { limit: 10 }),
      queryByPrefix(tenantId, 'GAP#', { limit: 10 }),
      queryByPrefix(tenantId, 'EVT#', { limit: 10 })
    ]);

    // 2. Synthesize the Briefing
    const briefing = {
      business_profile: "Sharma Digital House", // In real app, fetch from ENT#BUSINESS
      top_suppliers: suppliers.items.map(s => ({ name: s.name, latest_price: s.attributes?.latest_price_paise })),
      open_alerts: alerts.items.map(a => ({ title: a.title, severity: a.severity })),
      known_memory_gaps: gaps.items.map(g => ({ description: g.description })),
      recent_changes: events.items.map(e => ({ field: e.attribute, old: e.old_value, new: e.new_value }))
    };

    return c.json({
      data: briefing,
      request_id: c.var.requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to generate briefing:', error);
    return c.json({ error: 'Failed to generate briefing' }, 500);
  }
});
