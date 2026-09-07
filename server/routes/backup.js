// NEED ELECTRO ERP — Production Database Backup & Disaster Recovery Engine
import { Router } from 'express';
import { db, transaction } from '../db.js';
import { requireAuth, requireSuperAdmin } from '../middleware/auth.js';
import fs from 'node:fs';
import path from 'node:path';

export const backupRouter = Router();

const BACKUP_DIR = path.resolve(process.cwd(), 'backups');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'need_electro.db');

/**
 * Create Manual Database Backup Snapshot
 */
backupRouter.post('/create', requireAuth, requireSuperAdmin, (req, res) => {
  try {
    // Checkpoint WAL so all changes are committed to main db file
    db.exec('PRAGMA wal_checkpoint(TRUNCATE);');

    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `need_electro_backup_${timestampStr}.db`;
    const targetPath = path.join(BACKUP_DIR, filename);

    // Atomic file copy of current database
    fs.copyFileSync(DB_FILE, targetPath);
    const stats = fs.statSync(targetPath);

    const backupId = 'bak-' + Date.now();
    const nowIso = new Date().toISOString();

    db.prepare(`
      INSERT INTO database_backups (id, filename, filepath, size_bytes, backup_type, created_at, status)
      VALUES (?, ?, ?, ?, 'MANUAL', ?, 'COMPLETED')
    `).run(backupId, filename, targetPath, stats.size, nowIso);

    db.prepare(`
      INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
      VALUES (?, datetime('now'), ?, ?, 'DATABASE_BACKUP_CREATED', 'SETTINGS', ?, ?, ?)
    `).run(
      'audit-' + Date.now(), req.user.id, req.user.name, backupId,
      `Super Admin generated manual database backup snapshot: ${filename} (${(stats.size / 1024).toFixed(1)} KB).`,
      req.ip || '127.0.0.1'
    );

    res.json({
      success: true,
      message: `Database backup '${filename}' created successfully.`,
      backup: {
        id: backupId,
        filename,
        sizeBytes: stats.size,
        createdAt: nowIso
      }
    });
  } catch (err) {
    console.error('Backup creation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * List Backup Snapshots
 */
backupRouter.get('/list', requireAuth, requireSuperAdmin, (req, res) => {
  try {
    const backups = db.prepare('SELECT * FROM database_backups ORDER BY created_at DESC').all();
    const formatted = backups.map(b => ({
      id: b.id,
      filename: b.filename,
      sizeBytes: b.size_bytes,
      backupType: b.backup_type,
      createdAt: b.created_at,
      status: b.status
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Download Backup File
 */
backupRouter.get('/download/:filename', requireAuth, requireSuperAdmin, (req, res) => {
  try {
    const { filename } = req.params;
    // Sanitization to prevent path traversal
    const safeName = path.basename(filename);
    const filePath = path.join(BACKUP_DIR, safeName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Backup archive not found.' });
    }

    res.download(filePath, safeName);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Restore Database Snapshot (Safeguarded with Pre-Restore Snapshot)
 */
backupRouter.post('/restore', requireAuth, requireSuperAdmin, (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ success: false, error: 'Backup filename is required.' });
    }

    const safeName = path.basename(filename);
    const sourceBackupPath = path.join(BACKUP_DIR, safeName);

    if (!fs.existsSync(sourceBackupPath)) {
      return res.status(404).json({ success: false, error: 'Target backup file does not exist.' });
    }

    // 1. Take safety pre-restore snapshot of current database
    db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
    const safetyFilename = `pre_restore_safety_${Date.now()}.db`;
    const safetyPath = path.join(BACKUP_DIR, safetyFilename);
    fs.copyFileSync(DB_FILE, safetyPath);

    // 2. Perform restoration
    fs.copyFileSync(sourceBackupPath, DB_FILE);

    // 3. Run integrity check
    const integrity = db.prepare('PRAGMA integrity_check;').get();

    db.prepare(`
      INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
      VALUES (?, datetime('now'), ?, ?, 'DATABASE_RESTORED', 'SETTINGS', ?, ?, ?)
    `).run(
      'audit-' + Date.now(), req.user.id, req.user.name, safeName,
      `Super Admin restored database from backup '${safeName}'. Safety snapshot: '${safetyFilename}'.`,
      req.ip || '127.0.0.1'
    );

    res.json({
      success: true,
      message: `Database restored successfully from '${safeName}'. Integrity verification: ${JSON.stringify(integrity)}.`,
      safetySnapshot: safetyFilename
    });
  } catch (err) {
    console.error('Restore error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
