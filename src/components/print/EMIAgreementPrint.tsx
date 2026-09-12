import React from 'react';
import { EMIAccount, SystemSettings } from '../../types';
import { Printer, X, FileText, ShieldCheck } from 'lucide-react';
import { NeedElectroLogo } from '../NeedElectroLogo';

interface EMIAgreementPrintProps {
  account: EMIAccount;
  settings: SystemSettings;
  onClose: () => void;
}

export const EMIAgreementPrint: React.FC<EMIAgreementPrintProps> = ({ account, settings, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  React.useEffect(() => {
    document.body.classList.add('is-printing-emi');
    return () => {
      document.body.classList.remove('is-printing-emi');
    };
  }, []);

  return (
    <div className="modal-overlay print-active-modal" style={{ zIndex: 9999 }}>
      <div className="modal-content modal-content-xl" style={{ maxHeight: '96vh' }}>
        <div className="modal-header no-print">
          <div className="modal-title">
            <FileText size={20} className="text-primary" />
            Official Laptop Hire-Purchase (EMI) Contract Agreement — {account.emiNumber}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={16} /> Print Contract / PDF
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              <X size={16} /> Close
            </button>
          </div>
        </div>

        <div className="modal-body a4-preview-body">
          <div className="a4-print-document">
            {/* Watermark Background from Official Previous Memo */}
            <div 
              className="a4-watermark-overlay" 
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '48%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '480px',
                maxWidth: '82%',
                opacity: 0.16,
                pointerEvents: 'none',
                zIndex: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                userSelect: 'none'
              }}
            >
              <img 
                src="/logo-transparent.png" 
                alt="NEED ELECTRO Watermark" 
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>

            {/* Header */}
            <div className="a4-header" style={{ borderBottom: '3px double #0284c7', paddingBottom: '1rem' }}>
              <div className="a4-logo-group">
                <NeedElectroLogo 
                  variant="master-image"
                  size="lg" 
                  theme="light" 
                  showSisterConcern={false} 
                />
                <div style={{ marginTop: '6px', fontSize: '11px', color: '#0284C7', fontWeight: 'bold', letterSpacing: '0.04em' }}>
                  — A sister Concern Of AMDADS GROUP —
                </div>
                <div className="a4-company-details" style={{ marginTop: '4px', fontSize: '11px', color: '#475569', lineHeight: '1.45' }}>
                  <p><strong>Main Branch Moulvibazar:</strong> {settings.address}</p>
                  <p>Hotline: <strong>{settings.phone}</strong> | Email: {settings.email} | Web: {settings.website}</p>
                  <p>{settings.vatRegistrationNo}</p>
                </div>
              </div>

              <div className="a4-invoice-meta">
                <div style={{ background: '#1e3a8a', color: '#ffffff', padding: '4px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold', textAlign: 'center' }}>
                  HIRE-PURCHASE (EMI) CONTRACT
                </div>
                <div className="a4-meta-table" style={{ marginTop: '8px' }}>
                  <p><strong>Agreement No:</strong> {account.emiNumber}</p>
                  <p><strong>Related Invoice:</strong> {account.saleInvoiceId}</p>
                  <p><strong>Effective Date:</strong> {account.startDate}</p>
                  <p><strong>Maturity Date:</strong> {account.endDate}</p>
                </div>
              </div>
            </div>

            {/* Preamble */}
            <div style={{ fontSize: '11px', lineHeight: '1.5', marginBottom: '15px', color: '#334155', textAlign: 'justify' }}>
              This Hire-Purchase Agreement is executed on <strong>{account.startDate}</strong> between <strong>{settings.companyName}</strong> (hereinafter referred to as the <em>'Owner/Seller'</em>) and the Customer/Hirer detailed below pursuant to the applicable laws of Bangladesh.
            </div>

            {/* Parties Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px' }}>
                <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#1e3a8a', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '6px' }}>
                  1. Customer (Hirer) Particulars
                </h4>
                <div style={{ fontSize: '11px', lineHeight: '1.5' }}>
                  <p><strong>Full Name:</strong> {account.customerName}</p>
                  <p><strong>Contact Phone:</strong> {account.customerPhone}</p>
                  <p><strong>National ID (NID):</strong> {account.customerNid || 'Verified by Showroom'}</p>
                  <p><strong>Present Address:</strong> {account.customerAddress}</p>
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px' }}>
                <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#1e3a8a', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '6px' }}>
                  2. Guarantor Particulars
                </h4>
                <div style={{ fontSize: '11px', lineHeight: '1.5' }}>
                  <p><strong>Guarantor Name:</strong> {account.guarantor?.name || 'N/A'}</p>
                  <p><strong>Relationship:</strong> {account.guarantor?.relationship || 'N/A'}</p>
                  <p><strong>Guarantor Phone:</strong> {account.guarantor?.phone || 'N/A'}</p>
                  <p><strong>Guarantor NID:</strong> {account.guarantor?.nid || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Product & Financial Overview */}
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', marginBottom: '15px' }}>
              <div style={{ background: '#f1f5f9', padding: '6px 10px', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase' }}>
                3. Equipment Specification & Financial Terms
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', padding: '10px', gap: '15px', fontSize: '11px' }}>
                <div>
                  <p><strong>Product Description:</strong> {account.productName}</p>
                  <p style={{ marginTop: '3px' }}>
                    <strong style={{ color: '#2563eb' }}>Serial Number:</strong>{' '}
                    <span style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                      {account.serialNumber}
                    </span>
                  </p>
                  <p style={{ marginTop: '3px' }}><strong>Tenure:</strong> {account.durationMonths} Monthly Installments</p>
                  <p><strong>Status:</strong> <span style={{ fontWeight: 'bold', color: '#16a34a' }}>{account.status}</span></p>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Laptop Price:</span>
                    <strong>৳{account.laptopPrice.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                    <span>Down Payment Received:</span>
                    <strong>৳{account.downPayment.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2563eb', fontWeight: 'bold', borderTop: '1px solid #cbd5e1', marginTop: '4px', paddingTop: '4px' }}>
                    <span>Financed Principal:</span>
                    <span>৳{account.financedAmount.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', fontWeight: 'bold', marginTop: '2px' }}>
                    <span>Monthly Installment:</span>
                    <span>৳{account.monthlyInstallment.toLocaleString()} / Month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Installment Schedule Table */}
            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#1e3a8a', marginBottom: '6px' }}>
                4. Mandatory Repayment Schedule
              </h4>
              <table className="a4-items-table" style={{ fontSize: '10px', marginBottom: '0' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'center', width: '8%' }}>Inst #</th>
                    <th style={{ width: '25%' }}>Due Date</th>
                    <th style={{ textAlign: 'right', width: '22%' }}>Installment Amount</th>
                    <th style={{ textAlign: 'center', width: '20%' }}>Status</th>
                    <th style={{ textAlign: 'right', width: '25%' }}>Receipt / Ref</th>
                  </tr>
                </thead>
                <tbody>
                  {account.installments.map(inst => (
                    <tr key={inst.id}>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{inst.installmentNumber}</td>
                      <td>{inst.dueDate}</td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>৳{inst.amount.toLocaleString()}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          color: inst.status === 'PAID' ? '#16a34a' : inst.status === 'OVERDUE' ? '#dc2626' : '#2563eb',
                          fontWeight: 'bold',
                          fontSize: '9px'
                        }}>
                          {inst.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontSize: '9px' }}>
                        {inst.receiptNumber ? `${inst.receiptNumber} (${inst.paidDate})` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legal Terms & Conditions */}
            <div style={{ fontSize: '9.5px', color: '#475569', lineHeight: '1.4', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px', marginBottom: '25px' }}>
              <div style={{ fontWeight: 'bold', textTransform: 'uppercase', color: '#0f172a', marginBottom: '2px' }}>
                Contractual Undertaking & Repossession Terms:
              </div>
              <ol style={{ paddingLeft: '14px' }}>
                <li><strong>Title & Ownership:</strong> Absolute ownership and title of the equipment ({account.productName}, Serial: {account.serialNumber}) shall solely vest with {settings.companyName} until all installments are liquidated in full.</li>
                <li><strong>Default & Recovery:</strong> If the Hirer fails or defaults to pay 2 (two) consecutive installments or absconds, {settings.companyName} reserves the legal right under the Contract Act & Penal Code to immediately repossess the equipment and institute legal proceedings against both Hirer and Guarantor.</li>
                <li><strong>Maintenance:</strong> The Hirer shall keep the equipment in good working order and not pledge, sell, or mortgage the same to any third party.</li>
              </ol>
            </div>

            {/* Signatures */}
            <div className="a4-signatures" style={{ marginTop: '30px' }}>
              <div className="a4-signature-box">
                <div>{account.customerName}</div>
                <div style={{ fontSize: '9px', color: '#64748b' }}>Hirer / Customer Signature</div>
              </div>
              <div className="a4-signature-box">
                <div>{account.guarantor?.name || 'Guarantor'}</div>
                <div style={{ fontSize: '9px', color: '#64748b' }}>Guarantor Signature</div>
              </div>
              <div className="a4-signature-box">
                <div>{account.approvedBy}</div>
                <div style={{ fontSize: '9px', color: '#64748b' }}>For NEED ELECTRO</div>
              </div>
            </div>

            {/* Mandatory Software Development Credit */}
            <div 
              className="a4-software-dev-credit"
              style={{
                marginTop: '16px',
                paddingTop: '6px',
                borderTop: '1.5px solid #000000',
                textAlign: 'center',
                fontSize: '11px',
                fontWeight: 800,
                color: '#000000',
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}
            >
              Software Developed By AMDADS GROUP
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
