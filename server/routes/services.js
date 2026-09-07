// NEED ELECTRO ERP — Technical Services & Field Electrical Job Ticketing
import { Router } from 'express';
import { db, transaction } from '../db.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';

export const servicesRouter = Router();

servicesRouter.get('/', requireAuth, requirePermission('services.view'), (req, res) => {
  try {
    const jobs = db.prepare('SELECT * FROM service_jobs ORDER BY created_at DESC').all();
    const formatted = jobs.map(s => ({
      id: s.id,
      jobCardNumber: s.job_card_number,
      customerId: s.customer_id,
      customerName: s.customer_name,
      customerPhone: s.customer_phone,
      customerAddress: s.customer_address,
      serviceType: s.service_type,
      deviceOrSite: s.device_or_site,
      serialNumber: s.serial_number,
      reportedIssue: s.reported_issue,
      assignedTechnicianId: s.assigned_technician_id,
      assignedTechnicianName: s.assigned_technician_name,
      status: s.status,
      partsUsed: s.parts_used ? JSON.parse(s.parts_used) : [],
      laborCost: s.labor_cost,
      totalBill: s.total_bill,
      paymentStatus: s.payment_status,
      paymentMethod: s.payment_method,
      scheduledDate: s.scheduled_date,
      completedDate: s.completed_date,
      notes: s.notes,
      createdAt: s.created_at
    }));
    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

servicesRouter.post('/', requireAuth, requirePermission('services.manage'), (req, res) => {
  try {
    const jobData = req.body;
    if (!jobData || !jobData.customerName || !jobData.customerPhone || !jobData.serviceType) {
      return res.status(400).json({ success: false, error: 'Customer name, phone, and service type are mandatory.' });
    }

    const jobCount = db.prepare('SELECT COUNT(*) as count FROM service_jobs').get().count;
    const jobCardNumber = `JOB-2026-${String(jobCount + 101).padStart(3, '0')}`;
    const jobId = 'job-' + Date.now();
    const nowIso = new Date().toISOString();

    transaction(() => {
      db.prepare(`
        INSERT INTO service_jobs (
          id, job_card_number, customer_id, customer_name, customer_phone,
          customer_address, service_type, device_or_site, serial_number,
          reported_issue, assigned_technician_id, assigned_technician_name,
          status, parts_used, labor_cost, total_bill, payment_status,
          payment_method, scheduled_date, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', 0, 0, 'UNPAID', 'Cash', ?, ?, ?)
      `).run(
        jobId, jobCardNumber, jobData.customerId || 'walk-in', jobData.customerName.trim(),
        jobData.customerPhone.trim(), jobData.customerAddress || '', jobData.serviceType,
        jobData.deviceOrSite || 'Hardware Device', jobData.serialNumber || '',
        jobData.reportedIssue || '', jobData.assignedTechnicianId || null,
        jobData.assignedTechnicianName || null, jobData.status || 'Pending',
        jobData.scheduledDate || nowIso.split('T')[0], jobData.notes || '', nowIso
      );

      // Update technician active job count if assigned
      if (jobData.assignedTechnicianId) {
        db.prepare('UPDATE technicians SET active_jobs_count = active_jobs_count + 1 WHERE id = ?').run(jobData.assignedTechnicianId);
      }

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'SERVICE_JOB_CREATED', 'SERVICE', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, jobCardNumber,
        `Created service job card ${jobCardNumber} for ${jobData.customerName} (${jobData.serviceType}).`,
        req.ip || '127.0.0.1'
      );
    });

    const createdJob = {
      id: jobId,
      jobCardNumber,
      customerId: jobData.customerId || 'walk-in',
      customerName: jobData.customerName.trim(),
      customerPhone: jobData.customerPhone.trim(),
      customerAddress: jobData.customerAddress || '',
      serviceType: jobData.serviceType,
      deviceOrSite: jobData.deviceOrSite || 'Hardware Device',
      serialNumber: jobData.serialNumber || '',
      reportedIssue: jobData.reportedIssue || '',
      assignedTechnicianId: jobData.assignedTechnicianId || null,
      assignedTechnicianName: jobData.assignedTechnicianName || null,
      status: jobData.status || 'Pending',
      partsUsed: [],
      laborCost: 0,
      totalBill: 0,
      paymentStatus: 'UNPAID',
      paymentMethod: 'Cash',
      scheduledDate: jobData.scheduledDate || nowIso.split('T')[0],
      completedDate: null,
      notes: jobData.notes || '',
      createdAt: nowIso
    };

    res.json({ success: true, message: `Job card ${jobCardNumber} created.`, jobId, jobCardNumber, job: createdJob });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

servicesRouter.put('/:id', requireAuth, requirePermission('services.manage'), (req, res) => {
  try {
    const { id } = req.params;
    const { status, partsUsed, laborCost, paymentStatus, paymentMethod, notes } = req.body;

    const existing = db.prepare('SELECT * FROM service_jobs WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ success: false, error: 'Job ticket not found.' });

    transaction(() => {
      let partsTotal = 0;
      if (partsUsed && Array.isArray(partsUsed)) {
        partsTotal = partsUsed.reduce((sum, p) => sum + (Number(p.quantity) * Number(p.unitPrice)), 0);
      }

      const labor = laborCost !== undefined ? Number(laborCost) : existing.labor_cost;
      const totalBill = partsTotal + labor;
      const completedDate = status === 'Completed' ? new Date().toISOString().split('T')[0] : existing.completed_date;

      db.prepare(`
        UPDATE service_jobs
        SET status = COALESCE(?, status),
            parts_used = COALESCE(?, parts_used),
            labor_cost = ?,
            total_bill = ?,
            payment_status = COALESCE(?, payment_status),
            payment_method = COALESCE(?, payment_method),
            completed_date = ?,
            notes = COALESCE(?, notes)
        WHERE id = ?
      `).run(
        status, partsUsed ? JSON.stringify(partsUsed) : null,
        labor, totalBill, paymentStatus, paymentMethod, completedDate, notes, id
      );

      // If paid, credit cash drawer
      if (paymentStatus === 'PAID' && existing.payment_status !== 'PAID' && totalBill > 0) {
        db.prepare('UPDATE financial_accounts SET balance = balance + ? WHERE id = ?').run(totalBill, 'acc-1');
      }

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'SERVICE_JOB_UPDATED', 'SERVICE', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, existing.job_card_number,
        `Updated service card ${existing.job_card_number} (Status: ${status || existing.status}, Total Bill: ৳${totalBill}).`,
        req.ip || '127.0.0.1'
      );
    });

    res.json({ success: true, message: 'Service ticket updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
