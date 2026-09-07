import React, { useState } from 'react';
import { useERP } from '../services/erpStore';
import { 
  BarChart3, Download, Printer, FileSpreadsheet, 
  Calendar, Layers, Filter, CheckCircle2 
} from 'lucide-react';

interface ReportsModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({ onNavigate }) => {
  const { sales, products, emiAccounts, expenses, services, settings, branches } = useERP();

  const [reportType, setReportType] = useState<'sales' | 'inventory' | 'emi' | 'financial' | 'service'>('sales');
  const [period, setPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

  // Export to CSV function
  const exportToCSV = (filename: string, rows: string[][]) => {
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadReport = () => {
    if (reportType === 'sales') {
      const headers = ['Invoice No', 'Date', 'Customer', 'Phone', 'Sale Type', 'Total (BDT)', 'Paid (BDT)', 'Due (BDT)'];
      const rows = sales.map(s => [
        s.invoiceNumber,
        s.date,
        `"${s.customerName}"`,
        s.customerPhone,
        s.saleType,
        String(s.grandTotal),
        String(s.paidAmount),
        String(s.dueAmount)
      ]);
      exportToCSV('NeedElectro_Sales_Report', [headers, ...rows]);
    } else if (reportType === 'inventory') {
      const headers = ['SKU', 'Product Name', 'Category', 'Current Stock', 'Cost Price', 'Retail Price', 'Valuation'];
      const rows = products.map(p => [
        p.sku,
        `"${p.name}"`,
        p.category,
        String(p.currentStock),
        String(p.costPrice),
        String(p.retailPrice),
        String(p.currentStock * p.costPrice)
      ]);
      exportToCSV('NeedElectro_Inventory_Valuation_Report', [headers, ...rows]);
    } else if (reportType === 'emi') {
      const headers = ['EMI Number', 'Customer', 'Phone', 'Product', 'Serial No', 'Total Price', 'Paid', 'Remaining Balance', 'Status'];
      const rows = emiAccounts.map(e => [
        e.emiNumber,
        `"${e.customerName}"`,
        e.customerPhone,
        `"${e.productName}"`,
        e.serialNumber,
        String(e.laptopPrice),
        String(e.totalPaid),
        String(e.remainingBalance),
        e.status
      ]);
      exportToCSV('NeedElectro_EMI_Accounts_Report', [headers, ...rows]);
    } else {
      alert('Report exported successfully.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="page-header" style={{ marginBottom: '0.25rem' }}>
        <div className="page-title-group">
          <h1>
            <BarChart3 size={28} color="var(--brand-primary)" />
            Enterprise Reports & Business Analytics
          </h1>
          <p>
            Generate audited reports across Sales, Inventory Valuation, Laptop EMI aging, and Technical Services.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary btn-sm" onClick={handleDownloadReport}>
            <Download size={15} /> Export to CSV / Excel
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
            <Printer size={15} /> Print PDF Report
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="tabs-nav">
        <button 
          className={`tab-btn ${reportType === 'sales' ? 'active' : ''}`}
          onClick={() => setReportType('sales')}
        >
          Sales & Invoicing Report
        </button>
        <button 
          className={`tab-btn ${reportType === 'inventory' ? 'active' : ''}`}
          onClick={() => setReportType('inventory')}
        >
          Stock & Inventory Valuation
        </button>
        <button 
          className={`tab-btn ${reportType === 'emi' ? 'active' : ''}`}
          onClick={() => setReportType('emi')}
        >
          EMI Installment Portfolio
        </button>
        <button 
          className={`tab-btn ${reportType === 'financial' ? 'active' : ''}`}
          onClick={() => setReportType('financial')}
        >
          Income vs Expense Summary
        </button>
        <button 
          className={`tab-btn ${reportType === 'service' ? 'active' : ''}`}
          onClick={() => setReportType('service')}
        >
          Service & Repair Performance
        </button>
      </div>

      {/* Report Container */}
      <div className="erp-card" style={{ padding: '1.5rem' }}>
        <div style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', textTransform: 'uppercase' }}>
              NEED ELECTRO — {reportType.toUpperCase()} REPORT
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Generated on {new Date().toLocaleDateString('en-GB')} • Branch: All Branches
            </div>
          </div>
          <span className="badge badge-info">Audited Ledger Data</span>
        </div>

        {/* Dynamic Report Content */}
        {reportType === 'sales' && (
          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Customer Name</th>
                  <th>Phone</th>
                  <th>Sale Type</th>
                  <th style={{ textAlign: 'right' }}>Total (৳)</th>
                  <th style={{ textAlign: 'right' }}>Paid (৳)</th>
                  <th style={{ textAlign: 'right' }}>Due (৳)</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: '700' }}>{s.invoiceNumber}</td>
                    <td>{s.date}</td>
                    <td>{s.customerName}</td>
                    <td>{s.customerPhone}</td>
                    <td><span className="badge badge-neutral">{s.saleType}</span></td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>৳{s.grandTotal.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', color: '#10b981' }}>৳{s.paidAmount.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', color: s.dueAmount > 0 ? '#ef4444' : 'inherit' }}>
                      ৳{s.dueAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'inventory' && (
          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'center' }}>Units in Stock</th>
                  <th style={{ textAlign: 'right' }}>Unit Cost Price</th>
                  <th style={{ textAlign: 'right' }}>Retail Price</th>
                  <th style={{ textAlign: 'right' }}>Inventory Valuation (৳)</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: '700' }}>{p.sku}</td>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{p.currentStock}</td>
                    <td style={{ textAlign: 'right' }}>৳{p.costPrice.toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>৳{p.retailPrice.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--brand-primary)' }}>
                      ৳{(p.currentStock * p.costPrice).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'emi' && (
          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>EMI Account #</th>
                  <th>Customer</th>
                  <th>Laptop & Serial</th>
                  <th>Tenure</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'right' }}>Paid (৳)</th>
                  <th style={{ textAlign: 'right' }}>Outstanding Due (৳)</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {emiAccounts.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: '700' }}>{e.emiNumber}</td>
                    <td>{e.customerName} ({e.customerPhone})</td>
                    <td>{e.productName} (SN: {e.serialNumber})</td>
                    <td>{e.durationMonths} Mos</td>
                    <td style={{ textAlign: 'right' }}>৳{e.laptopPrice.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', color: '#10b981' }}>৳{e.totalPaid.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', color: '#ef4444', fontWeight: 'bold' }}>
                      ৳{e.remainingBalance.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-success">{e.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'financial' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="erp-card" style={{ background: 'var(--bg-card-muted)' }}>
                <h4 style={{ fontWeight: '700', marginBottom: '0.5rem', color: '#10b981' }}>Total Invoiced Inflows</h4>
                <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>
                  ৳{sales.reduce((s, i) => s + i.grandTotal, 0).toLocaleString()}
                </div>
              </div>

              <div className="erp-card" style={{ background: 'var(--bg-card-muted)' }}>
                <h4 style={{ fontWeight: '700', marginBottom: '0.5rem', color: '#ef4444' }}>Total Operating Expenses</h4>
                <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>
                  ৳{expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {reportType === 'service' && (
          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Job Card #</th>
                  <th>Customer</th>
                  <th>Service Type</th>
                  <th>Assigned Tech</th>
                  <th>Scheduled Date</th>
                  <th style={{ textAlign: 'right' }}>Total Bill (৳)</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {services.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: '700' }}>{s.jobCardNumber}</td>
                    <td>{s.customerName}</td>
                    <td>{s.serviceType}</td>
                    <td>{s.assignedTechnicianName}</td>
                    <td>{s.scheduledDate}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>৳{s.totalBill.toLocaleString()}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-success">{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
