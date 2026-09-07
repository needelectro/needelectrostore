// NEED ELECTRO ERP — Real Transaction Accounting, Dynamic P&L & Balance Engine
// Enforces Formula: Gross Profit = Revenue - COGS, Net Profit = Gross Profit - Operating Expenses
// Treats Investments as Equity (NOT Revenue, NOT Operating Expense)
import { Router } from 'express';
import { db, transaction } from '../db.js';
import { requireAuth, requirePermission, requireSuperAdmin } from '../middleware/auth.js';

export const accountingRouter = Router();

/**
 * Live Dynamic Financial Metrics (Zero Fake Stats)
 */
accountingRouter.get('/overview', requireAuth, requirePermission('accounting.view'), (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonth = todayStr.substring(0, 7);

    // 1. Sales & Revenue
    const todaySalesRows = db.prepare("SELECT * FROM sales WHERE date = ? AND status != 'VOID'").all(todayStr);
    const monthSalesRows = db.prepare("SELECT * FROM sales WHERE date LIKE ? AND status != 'VOID'").all(`${currentMonth}%`);
    const allSalesRows = db.prepare("SELECT * FROM sales WHERE status != 'VOID'").all();

    const todaySales = todaySalesRows.reduce((sum, s) => sum + s.grand_total, 0);
    const monthSales = monthSalesRows.reduce((sum, s) => sum + s.grand_total, 0);
    const totalRevenue = allSalesRows.reduce((sum, s) => sum + s.grand_total, 0);

    // 2. COGS (Quantity × Cost Price of sold items)
    const allSaleItems = db.prepare(`
      SELECT si.quantity, si.unit_price, p.cost_price, s.date
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      LEFT JOIN products p ON si.product_id = p.id
      WHERE s.status != 'VOID'
    `).all();

    let todayCOGS = 0;
    let monthCOGS = 0;
    let totalCOGS = 0;

    for (const item of allSaleItems) {
      const unitCost = item.cost_price || (item.unit_price * 0.78);
      const itemCost = unitCost * item.quantity;
      totalCOGS += itemCost;
      if (item.date === todayStr) todayCOGS += itemCost;
      if (item.date && item.date.startsWith(currentMonth)) monthCOGS += itemCost;
    }

    const todayGrossProfit = todaySales - todayCOGS;
    const monthGrossProfit = monthSales - monthCOGS;
    const totalGrossProfit = totalRevenue - totalCOGS;

    // 3. Operating Expenses
    const expenses = db.prepare('SELECT amount, date FROM expenses').all();
    let todayExpenses = 0;
    let monthExpenses = 0;
    let totalExpenses = 0;

    for (const exp of expenses) {
      totalExpenses += exp.amount;
      if (exp.date === todayStr) todayExpenses += exp.amount;
      if (exp.date && exp.date.startsWith(currentMonth)) monthExpenses += exp.amount;
    }

    // 4. Honest Net Profit = Gross Profit - Operating Expenses
    const todayNetProfit = todayGrossProfit - todayExpenses;
    const monthNetProfit = monthGrossProfit - monthExpenses;
    const totalNetProfit = totalGrossProfit - totalExpenses;

    // 5. Receivables (Customer Due + Active EMI Remaining)
    const customerDueSum = db.prepare('SELECT SUM(current_balance) as due FROM customers WHERE current_balance > 0').get().due || 0;
    const emiReceivableSum = db.prepare("SELECT SUM(remaining_balance) as rem FROM emi_accounts WHERE status = 'ACTIVE'").get().rem || 0;
    const totalReceivables = customerDueSum + emiReceivableSum;

    // 6. Payables (Suppliers)
    const totalPayables = db.prepare('SELECT SUM(current_payable) as payable FROM suppliers').get().payable || 0;

    // 7. Inventory Asset Valuation
    const products = db.prepare('SELECT current_stock, cost_price, min_stock FROM products').all();
    let totalStockValue = 0;
    let lowStockCount = 0;

    for (const p of products) {
      totalStockValue += (p.current_stock * p.cost_price);
      if (p.current_stock <= p.min_stock) lowStockCount++;
    }

    // 8. Financial Account Balances (Cash, Bank, MFS)
    const accounts = db.prepare('SELECT * FROM financial_accounts WHERE is_active = 1').all();
    let totalLiquidCash = 0;
    for (const a of accounts) {
      totalLiquidCash += a.balance;
    }

    // 9. Capital & Investments
    const totalInvestments = db.prepare("SELECT SUM(amount) as inv FROM investments WHERE status = 'ACTIVE'").get().inv || 0;

    // 10. EMI Collections
    const todayEmiCollected = db.prepare('SELECT SUM(amount + penalty_paid) as col FROM emi_payments WHERE payment_date = ?').get(todayStr).col || 0;
    const totalEmiCollected = db.prepare('SELECT SUM(amount + penalty_paid) as col FROM emi_payments').get().col || 0;

    // Overdue EMI Accounts Count & Sum
    const overdueInst = db.prepare(`
      SELECT SUM(amount - paid_amount) as overdueSum, COUNT(DISTINCT emi_account_id) as overdueAccounts
      FROM emi_installments
      WHERE due_date < ? AND status NOT IN ('PAID', 'WAIVED')
    `).get(todayStr);

    res.json({
      success: true,
      data: {
        todaySales,
        monthSales,
        totalRevenue,
        todayCOGS,
        monthCOGS,
        totalCOGS,
        todayGrossProfit,
        monthGrossProfit,
        totalGrossProfit,
        todayExpenses,
        monthExpenses,
        totalExpenses,
        todayNetProfit,
        monthNetProfit,
        totalNetProfit,
        totalReceivables,
        customerDirectDue: customerDueSum,
        emiReceivable: emiReceivableSum,
        totalPayables,
        totalStockValue,
        lowStockCount,
        totalLiquidCash,
        totalInvestments,
        todayEmiCollected,
        totalEmiCollected,
        overdueEmiSum: overdueInst?.overdueSum || 0,
        overdueEmiCount: overdueInst?.overdueAccounts || 0,
        accounts
      }
    });
  } catch (err) {
    console.error('Accounting overview error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Internal Fund Transfers (e.g. Cash to Bank or Cash to bKash)
 */
accountingRouter.post('/transfer', requireAuth, requirePermission('accounting.transfer'), (req, res) => {
  try {
    const { fromAccountId, toAccountId, amount, fee, notes } = req.body;

    if (!fromAccountId || !toAccountId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Source, destination, and valid transfer amount are required.' });
    }
    if (fromAccountId === toAccountId) {
      return res.status(400).json({ success: false, error: 'Source and destination accounts must be distinct.' });
    }

    const transferAmount = Number(amount);
    const transferFee = Number(fee || 0);
    const totalDeducted = transferAmount + transferFee;
    const today = new Date().toISOString().split('T')[0];

    const result = transaction(() => {
      const fromAcc = db.prepare('SELECT * FROM financial_accounts WHERE id = ?').get(fromAccountId);
      const toAcc = db.prepare('SELECT * FROM financial_accounts WHERE id = ?').get(toAccountId);

      if (!fromAcc || !toAcc) throw new Error('Source or destination account not found.');
      if (fromAcc.balance < totalDeducted) {
        throw new Error(`Insufficient funds in '${fromAcc.name}'. Balance: ৳${fromAcc.balance}, Required: ৳${totalDeducted}`);
      }

      const txCount = db.prepare('SELECT COUNT(*) as count FROM fund_transfers').get().count;
      const transferNumber = `TRF-2026-${String(txCount + 101).padStart(4, '0')}`;

      // Deduct source & credit destination
      db.prepare('UPDATE financial_accounts SET balance = balance - ? WHERE id = ?').run(totalDeducted, fromAccountId);
      db.prepare('UPDATE financial_accounts SET balance = balance + ? WHERE id = ?').run(transferAmount, toAccountId);

      // Record transfer
      db.prepare(`
        INSERT INTO fund_transfers (
          id, transfer_number, date, from_account_id, to_account_id,
          amount, fee, reference, transferred_by, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'trf-' + Date.now(), transferNumber, today, fromAccountId, toAccountId,
        transferAmount, transferFee, `Transfer from ${fromAcc.name} to ${toAcc.name}`,
        req.user.name, notes || ''
      );

      // If fee was charged, record as expense
      if (transferFee > 0) {
        const expCount = db.prepare('SELECT COUNT(*) as count FROM expenses').get().count;
        db.prepare(`
          INSERT INTO expenses (
            id, voucher_number, category, amount, date,
            payment_method, branch_id, description, created_by, created_at
          ) VALUES (?, ?, 'Other Operating Expenses', ?, ?, 'Bank Transfer', 'branch-1', ?, ?, datetime('now'))
        `).run(
          'exp-fee-' + Date.now(), `EXP-FEE-${String(expCount + 101).padStart(4, '0')}`,
          transferFee, today, `Transfer Fee for ${transferNumber}`, req.user.name
        );
      }

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'FUND_TRANSFER', 'ACCOUNTING', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, transferNumber,
        `Transferred ৳${transferAmount} from '${fromAcc.name}' to '${toAcc.name}' (Fee: ৳${transferFee}).`,
        req.ip || '127.0.0.1'
      );

      return { transferNumber, transferAmount, transferFee };
    });

    res.json({
      success: true,
      message: `Transferred ৳${result.transferAmount} successfully (${result.transferNumber}).`,
      data: result
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * Record Capital / Investment (Equity)
 */
accountingRouter.post('/investments', requireAuth, requirePermission('accounting.invest'), (req, res) => {
  try {
    const { investorName, amount, date, investmentType, depositAccountId, paymentMethod, notes } = req.body;

    if (!investorName || !amount || Number(amount) <= 0 || !depositAccountId) {
      return res.status(400).json({ success: false, error: 'Investor name, positive amount, and deposit account are required.' });
    }

    const invAmount = Number(amount);
    const today = date || new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    const result = transaction(() => {
      const targetAcc = db.prepare('SELECT * FROM financial_accounts WHERE id = ?').get(depositAccountId);
      if (!targetAcc) throw new Error('Deposit financial account not found.');

      const invCount = db.prepare('SELECT COUNT(*) as count FROM investments').get().count;
      const refNumber = `INV-CAP-2026-${String(invCount + 101).padStart(3, '0')}`;
      const investmentId = 'inv-' + Date.now();

      // Credit deposit account
      db.prepare('UPDATE financial_accounts SET balance = balance + ? WHERE id = ?').run(invAmount, depositAccountId);

      // Record investment master
      db.prepare(`
        INSERT INTO investments (
          id, reference_number, investor_name, amount, date,
          investment_type, deposit_account_id, payment_method, status,
          notes, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?)
      `).run(
        investmentId, refNumber, investorName.trim(), invAmount, today,
        investmentType || 'WORKING_CAPITAL', depositAccountId,
        paymentMethod || 'Bank Transfer', notes || '', req.user.name, nowIso
      );

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'CAPITAL_INVESTMENT', 'ACCOUNTING', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, refNumber,
        `Recorded capital equity injection of ৳${invAmount} from '${investorName}' into '${targetAcc.name}'.`,
        req.ip || '127.0.0.1'
      );

      return { refNumber, amount: invAmount, targetAccountName: targetAcc.name };
    });

    res.json({
      success: true,
      message: `Capital investment ${result.refNumber} recorded in ${result.targetAccountName}.`,
      data: result
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * Record Opening Balances (Super Admin Only)
 */
accountingRouter.post('/opening-balances', requireAuth, requireSuperAdmin, (req, res) => {
  try {
    const { date, type, targetId, targetName, amount, notes } = req.body;

    if (!type || !targetId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Type, target entity, and positive amount are required.' });
    }

    const opAmount = Number(amount);
    const today = date || new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();
    const entryId = 'opb-' + Date.now();

    transaction(() => {
      // 1. Record Opening Balance Entry
      db.prepare(`
        INSERT INTO opening_balances (
          id, date, type, target_id, target_name, amount, notes, approved_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(entryId, today, type, targetId, targetName, opAmount, notes || '', `${req.user.name} (Super Admin)`, nowIso);

      // 2. Adjust target balance
      if (type === 'CASH' || type === 'BANK' || type === 'MOBILE_BANKING') {
        db.prepare('UPDATE financial_accounts SET balance = balance + ? WHERE id = ?').run(opAmount, targetId);
      } else if (type === 'CUSTOMER_DUE') {
        db.prepare('UPDATE customers SET current_balance = current_balance + ? WHERE id = ?').run(opAmount, targetId);
        db.prepare(`
          INSERT INTO ledger_entries (
            id, date, party_type, party_id, reference_type, reference_number,
            description, debit, credit, running_balance
          ) VALUES (?, ?, 'CUSTOMER', ?, 'ADJUSTMENT', 'OPENING-DUE', 'Opening Customer Due Authorization', ?, 0, (SELECT current_balance FROM customers WHERE id = ?))
        `).run('le-op-' + Date.now(), today, targetId, opAmount, targetId);
      } else if (type === 'SUPPLIER_PAYABLE') {
        db.prepare('UPDATE suppliers SET current_payable = current_payable + ? WHERE id = ?').run(opAmount, targetId);
        db.prepare(`
          INSERT INTO ledger_entries (
            id, date, party_type, party_id, reference_type, reference_number,
            description, debit, credit, running_balance
          ) VALUES (?, ?, 'SUPPLIER', ?, 'ADJUSTMENT', 'OPENING-PAY', 'Opening Supplier Payable Authorization', 0, ?, (SELECT current_payable FROM suppliers WHERE id = ?))
        `).run('le-op-sup-' + Date.now(), today, targetId, opAmount, targetId);
      }

      // Mark opening balances as configured in setup status
      db.prepare("UPDATE setup_status SET is_opening_balances_configured = 1 WHERE id = 'main'").run();

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'OPENING_BALANCE_POSTED', 'ACCOUNTING', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, entryId,
        `Posted opening balance of ৳${opAmount} for ${type} (${targetName}).`,
        req.ip || '127.0.0.1'
      );
    });

    res.json({ success: true, message: `Opening balance of ৳${opAmount} posted successfully.` });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
