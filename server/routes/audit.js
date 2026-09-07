// NEED ELECTRO ERP — Audit Trail & Security Query API
import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';

export const auditRouter = Router();

auditRouter.get('/', requireAuth, requirePermission('audit.view'), (req, res) => {
  try {
    const { module, action, userId, startDate, endDate, limit } = req.query;
    let sql = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];

    if (module) {
      sql += ' AND module = ?';
      params.push(module);
    }
    if (action) {
      sql += ' AND action = ?';
      params.push(action);
    }
    if (userId) {
      sql += ' AND user_id = ?';
      params.push(userId);
    }
    if (startDate) {
      sql += ' AND timestamp >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND timestamp <= ?';
      params.push(endDate);
    }

    const rowLimit = limit ? Math.min(Number(limit), 1000) : 300;
    sql += ` ORDER BY timestamp DESC LIMIT ${rowLimit}`;

    const logs = db.prepare(sql).all(...params);
    const formatted = logs.map(al => ({
      id: al.id,
      timestamp: al.timestamp,
      userId: al.user_id,
      userName: al.user_name,
      action: al.action,
      module: al.module,
      recordId: al.record_id,
      details: al.details,
      ipAddress: al.ip_address
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
