// NEED ELECTRO ERP — Operating Expense Management Engine
import { Router } from 'express';
import { db, transaction } from '../db.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';

export const expensesRouter = Router();

expensesRouter.get('/', requireAuth, requirePermission('expenses.view'), (req, res) => {
  try {
    const expenses = db.prepare('SELECT * FROM expenses ORDER BY date DESC, created_at DESC LIMIT 300').all();
    const formatted = expenses.map(e => ({
      id: e.id,
      voucherNumber: e.voucher_number,
      category: e.category,
      amount: e.amount,
      date: e.date,
      paymentMethod: e.payment_method,
      branchId: e.branch_id,
      description: e.description,
      attachmentName: e.attachment_name,
      createdBy: e.created_by,
      createdAt: e.created_at
    }));
    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

expensesRouter.post('/', requireAuth, requirePermission('expenses.create'), (req, res) => {
  try {
    const { category, amount, date, paymentMethod, branchId, description, attachmentName, accountId } = req.body;

    if (!category || !amount || Number(amount) <= 0 || !description) {
      return res.status(400).json({ success: false, error: 'Category, valid positive amount, and description are required.' });
    }

    const expAmount = Number(amount);
    const today = date || new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    const result = transaction(() => {
      const expCount = db.prepare('SELECT COUNT(*) as count FROM expenses').get().count;
      const voucherNumber = `EXP-2026-${String(expCount + 101).padStart(4, '0')}`;
      const expenseId = 'exp-' + Date.now();

      // Deduct from financial account
      const targetAcc = accountId || 'acc-1';
      db.prepare('UPDATE financial_accounts SET balance = balance - ? WHERE id = ?').run(expAmount, targetAcc);

      db.prepare(`
        INSERT INTO expenses (
          id, voucher_number, category, amount, date,
          payment_method, branch_id, description, attachment_name,
          created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        expenseId, voucherNumber, category, expAmount, today,
        paymentMethod || 'Cash', branchId || 'branch-1', description.trim(),
        attachmentName || '', req.user.name, nowIso
      );

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'EXPENSE_RECORDED', 'ACCOUNTING', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, voucherNumber,
        `Recorded operating expense voucher ${voucherNumber} of ৳${expAmount} under '${category}'.`,
        req.ip || '127.0.0.1'
      );

      return {
        id: expenseId,
        voucherNumber,
        category,
        amount: expAmount,
        date: today,
        paymentMethod: paymentMethod || 'Cash',
        branchId: branchId || 'branch-1',
        description: description.trim(),
        attachmentName: attachmentName || '',
        createdBy: req.user.name,
        createdAt: nowIso
      };
    });

    res.json({
      success: true,
      message: `Expense voucher ${result.voucherNumber} recorded.`,
      expense: result,
      data: result
    });
  } catch (err) {
    console.error('Expense error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});
