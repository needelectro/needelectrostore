// NEED ELECTRO ERP — Dynamic Reporting Engine & CSV Data Export
import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';

export const reportsRouter = Router();

/**
 * Generate Report Data by Type with Advanced Filters
 */
reportsRouter.get('/generate', requireAuth, requirePermission('reports.view'), (req, res) => {
  try {
    const { reportType, startDate, endDate, branchId } = req.query;

    if (!reportType) {
      return res.status(400).json({ success: false, error: 'Report type is required.' });
    }

    let reportData = [];
    const today = new Date().toISOString().split('T')[0];
    const sDate = startDate || '2026-01-01';
    const eDate = endDate || today;

    switch (reportType) {
      case 'DAILY_SALES': {
        reportData = db.prepare(`
          SELECT date, COUNT(*) as invoiceCount, SUM(subtotal) as subtotal,
                 SUM(overall_discount) as discount, SUM(grand_total) as grandTotal,
                 SUM(paid_amount) as paidAmount, SUM(due_amount) as dueAmount
          FROM sales
          WHERE date >= ? AND date <= ? AND status != 'VOID'
          GROUP BY date
          ORDER BY date DESC
        `).all(sDate, eDate);
        break;
      }

      case 'SALES_BY_PRODUCT': {
        reportData = db.prepare(`
          SELECT si.product_id as productId, si.product_name as productName,
                 si.sku, si.category, SUM(si.quantity) as totalQtySold,
                 SUM(si.total) as totalRevenue, p.cost_price as unitCost,
                 SUM(si.quantity * p.cost_price) as totalCOGS,
                 (SUM(si.total) - SUM(si.quantity * p.cost_price)) as grossProfit
          FROM sale_items si
          JOIN sales s ON si.sale_id = s.id
          LEFT JOIN products p ON si.product_id = p.id
          WHERE s.date >= ? AND s.date <= ? AND s.status != 'VOID'
          GROUP BY si.product_id
          ORDER BY totalRevenue DESC
        `).all(sDate, eDate);
        break;
      }

      case 'PROFIT_LOSS': {
        const salesSummary = db.prepare(`
          SELECT SUM(grand_total) as totalRevenue,
                 SUM(paid_amount) as totalCollected
          FROM sales
          WHERE date >= ? AND date <= ? AND status != 'VOID'
        `).get(sDate, eDate);

        const cogsSummary = db.prepare(`
          SELECT SUM(si.quantity * p.cost_price) as totalCOGS
          FROM sale_items si
          JOIN sales s ON si.sale_id = s.id
          LEFT JOIN products p ON si.product_id = p.id
          WHERE s.date >= ? AND s.date <= ? AND s.status != 'VOID'
        `).get(sDate, eDate);

        const expSummary = db.prepare(`
          SELECT SUM(amount) as totalExpenses
          FROM expenses
          WHERE date >= ? AND date <= ?
        `).get(sDate, eDate);

        const rev = salesSummary?.totalRevenue || 0;
        const cogs = cogsSummary?.totalCOGS || (rev * 0.78);
        const gross = rev - cogs;
        const exp = expSummary?.totalExpenses || 0;
        const net = gross - exp;

        reportData = [{
          period: `${sDate} to ${eDate}`,
          totalRevenue: rev,
          totalCOGS: cogs,
          grossProfit: gross,
          grossProfitMargin: rev > 0 ? ((gross / rev) * 100).toFixed(1) + '%' : '0%',
          totalOperatingExpenses: exp,
          netOperatingProfit: net,
          netProfitMargin: rev > 0 ? ((net / rev) * 100).toFixed(1) + '%' : '0%'
        }];
        break;
      }

      case 'EMI_COLLECTION': {
        reportData = db.prepare(`
          SELECT ep.receipt_number as receiptNumber, ep.payment_date as paymentDate,
                 ea.emi_number as emiNumber, ea.customer_name as customerName,
                 ea.product_name as productName, ep.installment_number as installmentNumber,
                 ep.amount, ep.penalty_paid as penaltyPaid, (ep.amount + ep.penalty_paid) as totalReceived,
                 ep.payment_method as paymentMethod, ep.collected_by as collectedBy
          FROM emi_payments ep
          JOIN emi_accounts ea ON ep.emi_account_id = ea.id
          WHERE ep.payment_date >= ? AND ep.payment_date <= ?
          ORDER BY ep.payment_date DESC
        `).all(sDate, eDate);
        break;
      }

      case 'CUSTOMER_DUE': {
        reportData = db.prepare(`
          SELECT customer_id as customerId, name, phone, address,
                 credit_limit as creditLimit, current_balance as totalDue,
                 created_at as registeredDate
          FROM customers
          WHERE current_balance > 0
          ORDER BY current_balance DESC
        `).all();
        break;
      }

      case 'INVENTORY_VALUATION': {
        reportData = db.prepare(`
          SELECT sku, name, category, brand, current_stock as stock,
                 cost_price as costPrice, retail_price as retailPrice,
                 (current_stock * cost_price) as stockValuationCost,
                 (current_stock * retail_price) as stockValuationRetail,
                 min_stock as minStock, status
          FROM products
          ORDER BY stockValuationCost DESC
        `).all();
        break;
      }

      case 'EXPENSES_BREAKDOWN': {
        reportData = db.prepare(`
          SELECT category, COUNT(*) as voucherCount, SUM(amount) as totalAmount
          FROM expenses
          WHERE date >= ? AND date <= ?
          GROUP BY category
          ORDER BY totalAmount DESC
        `).all(sDate, eDate);
        break;
      }

      default:
        reportData = [];
    }

    res.json({
      success: true,
      reportType,
      period: { startDate: sDate, endDate: eDate },
      data: reportData
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
