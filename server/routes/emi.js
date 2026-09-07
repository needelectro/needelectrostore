// NEED ELECTRO ERP — Laptop EMI Management Subsystem
// Enforces Atomic Transactions for Installment Collection, Penalty Accounting & Balance Adjustments
import { Router } from 'express';
import { db, transaction } from '../db.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';

export const emiRouter = Router();

/**
 * List EMI Accounts with Live Installment Metrics
 */
emiRouter.get('/accounts', requireAuth, requirePermission('emi.view'), (req, res) => {
  try {
    const { status, customerId } = req.query;
    let sql = 'SELECT * FROM emi_accounts WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (customerId) {
      sql += ' AND customer_id = ?';
      params.push(customerId);
    }

    sql += ' ORDER BY start_date DESC';
    const accounts = db.prepare(sql).all(...params);

    const accountIds = accounts.map(a => a.id);
    let installmentsMap = {};

    if (accountIds.length > 0) {
      const placeholders = accountIds.map(() => '?').join(',');
      const installments = db.prepare(`SELECT * FROM emi_installments WHERE emi_account_id IN (${placeholders}) ORDER BY installment_number ASC`).all(...accountIds);

      for (const inst of installments) {
        if (!installmentsMap[inst.emi_account_id]) installmentsMap[inst.emi_account_id] = [];
        installmentsMap[inst.emi_account_id].push({
          id: inst.id,
          installmentNumber: inst.installment_number,
          dueDate: inst.due_date,
          amount: inst.amount,
          penaltyAmount: inst.penalty_amount,
          paidAmount: inst.paid_amount,
          paidDate: inst.paid_date,
          status: inst.status,
          receiptNumber: inst.receipt_number,
          paymentMethod: inst.payment_method
        });
      }
    }

    const formatted = accounts.map(ea => ({
      id: ea.id,
      emiNumber: ea.emi_number,
      saleInvoiceId: ea.sale_invoice_id,
      customerId: ea.customer_id,
      customerName: ea.customer_name,
      customerPhone: ea.customer_phone,
      customerAddress: ea.customer_address,
      customerNid: ea.customer_nid,
      guarantor: ea.guarantor ? JSON.parse(ea.guarantor) : undefined,
      productId: ea.product_id,
      productName: ea.product_name,
      serialNumber: ea.serial_number,
      laptopPrice: ea.laptop_price,
      downPayment: ea.down_payment,
      financedAmount: ea.financed_amount,
      durationMonths: ea.duration_months,
      monthlyInstallment: ea.monthly_installment,
      totalPayable: ea.total_payable,
      totalPaid: ea.total_paid,
      remainingBalance: ea.remaining_balance,
      startDate: ea.start_date,
      endDate: ea.end_date,
      status: ea.status,
      contractTerms: ea.contract_terms,
      approvedBy: ea.approved_by,
      createdAt: ea.created_at,
      installments: installmentsMap[ea.id] || []
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * ATOMIC EMI PAYMENT COLLECTION
 */
emiRouter.post('/collect', requireAuth, requirePermission('emi.collect'), (req, res) => {
  try {
    const { emiAccountId, installmentId, amount, penaltyAmount, paymentMethod, ref, notes, accountId } = req.body;

    if (!emiAccountId || !installmentId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'EMI Account ID, Installment ID, and a positive payment amount are mandatory.' });
    }

    const payAmount = Number(amount);
    const penAmount = Number(penaltyAmount || 0);
    const totalCollected = payAmount + penAmount;
    const today = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    const result = transaction(() => {
      const emiAccount = db.prepare('SELECT * FROM emi_accounts WHERE id = ?').get(emiAccountId);
      if (!emiAccount) {
        throw new Error('EMI Account record not found.');
      }

      const installment = db.prepare('SELECT * FROM emi_installments WHERE id = ? AND emi_account_id = ?').get(installmentId, emiAccountId);
      if (!installment) {
        throw new Error('Installment record not found.');
      }

      // Generate sequential receipt number
      const paymentCount = db.prepare('SELECT COUNT(*) as count FROM emi_payments').get().count;
      const receiptNumber = `RCP-2026-${String(paymentCount + 101).padStart(4, '0')}`;

      // Update installment
      const newPaidAmount = installment.paid_amount + payAmount;
      const newPenaltyAmount = installment.penalty_amount + penAmount;
      const isFullPaid = newPaidAmount >= installment.amount;
      const newInstStatus = isFullPaid ? 'PAID' : 'PARTIALLY_PAID';

      db.prepare(`
        UPDATE emi_installments
        SET paid_amount = ?,
            penalty_amount = ?,
            paid_date = ?,
            status = ?,
            receipt_number = ?,
            payment_method = ?
        WHERE id = ?
      `).run(newPaidAmount, newPenaltyAmount, today, newInstStatus, receiptNumber, paymentMethod || 'Cash', installmentId);

      // Update EMI account balances
      const newTotalPaid = emiAccount.total_paid + payAmount;
      const newRemaining = Math.max(0, emiAccount.remaining_balance - payAmount);
      const isAccountCompleted = newRemaining <= 0;
      const newAccountStatus = isAccountCompleted ? 'COMPLETED' : emiAccount.status;

      db.prepare(`
        UPDATE emi_accounts
        SET total_paid = ?,
            remaining_balance = ?,
            status = ?
        WHERE id = ?
      `).run(newTotalPaid, newRemaining, newAccountStatus, emiAccountId);

      // Update customer due balance
      db.prepare('UPDATE customers SET current_balance = MAX(0, current_balance - ?) WHERE id = ?').run(payAmount, emiAccount.customer_id);

      // Credit cash / digital financial account
      const targetAccountId = accountId || 'acc-1';
      db.prepare('UPDATE financial_accounts SET balance = balance + ? WHERE id = ?').run(totalCollected, targetAccountId);

      // Record EMI payment receipt
      const paymentRecordId = 'rcp-' + Date.now();
      db.prepare(`
        INSERT INTO emi_payments (
          id, receipt_number, emi_account_id, emi_number, installment_id,
          installment_number, customer_id, customer_name, amount, penalty_paid,
          payment_date, payment_method, transaction_ref, collected_by, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        paymentRecordId, receiptNumber, emiAccountId, emiAccount.emi_number,
        installmentId, installment.installment_number, emiAccount.customer_id,
        emiAccount.customer_name, payAmount, penAmount, today,
        paymentMethod || 'Cash', ref || '', req.user.name, notes || ''
      );

      // Record customer ledger entry
      db.prepare(`
        INSERT INTO ledger_entries (
          id, date, party_type, party_id, reference_type, reference_number,
          description, debit, credit, running_balance
        ) VALUES (?, ?, 'CUSTOMER', ?, 'PAYMENT', ?, ?, 0, ?, (SELECT current_balance FROM customers WHERE id = ?))
      `).run(
        'le-emi-' + Date.now(), today, emiAccount.customer_id, receiptNumber,
        `EMI Installment #${installment.installment_number} Payment for ${emiAccount.product_name} (${receiptNumber})`,
        payAmount, emiAccount.customer_id
      );

      // Audit log
      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'EMI_PAYMENT_COLLECTED', 'EMI', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, receiptNumber,
        `Collected EMI Installment #${installment.installment_number} (৳${payAmount}${penAmount > 0 ? ` + ৳${penAmount} penalty` : ''}) from ${emiAccount.customer_name} on account ${emiAccount.emi_number}. Receipt: ${receiptNumber}.`,
        req.ip || '127.0.0.1'
      );

      return {
        receiptNumber,
        payAmount,
        penAmount,
        remainingBalance: newRemaining,
        isAccountCompleted
      };
    });

    res.json({
      success: true,
      message: `EMI Payment voucher ${result.receiptNumber} recorded successfully.`,
      receiptNumber: result.receiptNumber,
      data: result
    });
  } catch (err) {
    console.error('EMI collection error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * Plans List & CRUD
 */
emiRouter.get('/plans', requireAuth, (req, res) => {
  try {
    const plans = db.prepare('SELECT * FROM emi_plans ORDER BY duration_months ASC').all();
    const formatted = plans.map(p => ({
      ...p,
      durationMonths: p.duration_months,
      minDownPaymentPercent: p.min_down_payment_percent,
      interestRatePercent: p.interest_rate_percent,
      processingFee: p.processing_fee,
      lateFeePerDay: p.late_fee_per_day,
      gracePeriodDays: p.grace_period_days,
      isActive: Boolean(p.is_active)
    }));
    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

emiRouter.post('/plans', requireAuth, requirePermission('emi.settings'), (req, res) => {
  try {
    const plan = req.body;
    if (!plan.name || !plan.durationMonths) {
      return res.status(400).json({ success: false, error: 'Plan name and duration are required.' });
    }

    const planId = plan.id || `emi-plan-${plan.durationMonths}m-${Date.now()}`;

    transaction(() => {
      const existing = db.prepare('SELECT id FROM emi_plans WHERE id = ?').get(planId);
      if (existing) {
        db.prepare(`
          UPDATE emi_plans
          SET name = ?,
              duration_months = ?,
              min_down_payment_percent = ?,
              interest_rate_percent = ?,
              processing_fee = ?,
              late_fee_per_day = ?,
              grace_period_days = ?,
              is_active = ?,
              version = version + 1,
              description = ?,
              eligibility_rules = ?,
              terms_text = ?
          WHERE id = ?
        `).run(
          plan.name, plan.durationMonths, plan.minDownPaymentPercent || 20,
          plan.interestRatePercent || 0, plan.processingFee || 0,
          plan.lateFeePerDay || 50, plan.gracePeriodDays || 5,
          plan.isActive !== undefined ? (plan.isActive ? 1 : 0) : 1,
          plan.description || '', plan.eligibilityRules || '',
          plan.termsText || '', planId
        );
      } else {
        db.prepare(`
          INSERT INTO emi_plans (
            id, name, duration_months, min_down_payment_percent, interest_rate_percent,
            processing_fee, late_fee_per_day, grace_period_days, is_active, version,
            description, eligibility_rules, terms_text
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
        `).run(
          planId, plan.name, plan.durationMonths, plan.minDownPaymentPercent || 20,
          plan.interestRatePercent || 0, plan.processingFee || 0,
          plan.lateFeePerDay || 50, plan.gracePeriodDays || 5,
          plan.isActive !== undefined ? (plan.isActive ? 1 : 0) : 1,
          plan.description || '', plan.eligibilityRules || '',
          plan.termsText || ''
        );
      }

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'EMI_PLAN_CONFIGURED', 'SETTINGS', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, planId,
        `Configured EMI plan '${plan.name}' (${plan.durationMonths} Months, ${plan.minDownPaymentPercent}% DP).`,
        req.ip || '127.0.0.1'
      );
    });

    res.json({ success: true, message: 'EMI Plan saved successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
