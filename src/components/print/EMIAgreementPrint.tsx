import React, { useState } from 'react';
import { EMIAccount, SystemSettings, EMIContractClause, EMIFinancialTerms } from '../../types';
import { Printer, X, FileText, Download, Loader2, Globe, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { NeedElectroLogo } from '../NeedElectroLogo';
import { getDefaultEMIClauses, interpolateClauseText } from '../../services/emiContractClauses';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface EMIAgreementPrintProps {
  account: EMIAccount;
  settings: SystemSettings;
  onClose: () => void;
}

export const EMIAgreementPrint: React.FC<EMIAgreementPrintProps> = ({ account, settings, onClose }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Parse structured contract terms if stored as JSON
  let structuredTerms: any = null;
  try {
    if (typeof account.contractTerms === 'string' && account.contractTerms.startsWith('{')) {
      structuredTerms = JSON.parse(account.contractTerms);
    } else if (typeof account.contractTerms === 'object' && account.contractTerms !== null) {
      structuredTerms = account.contractTerms;
    }
  } catch (e) {
    structuredTerms = null;
  }

  const financialTerms: EMIFinancialTerms | undefined = 
    account.financialTerms || structuredTerms?.financialTerms;

  const savedClauses: EMIContractClause[] = 
    account.contractClauses || structuredTerms?.clauses || [];

  const customerAcceptance = 
    account.customerAcceptance || structuredTerms?.customerAcceptance;

  const initialLang: 'EN' | 'BN' | 'BOTH' = 
    account.termsLanguage || structuredTerms?.termsLanguage || 'BOTH';

  const [printLanguage, setPrintLanguage] = useState<'EN' | 'BN' | 'BOTH'>(initialLang);

  // Build context for clause interpolation
  const interpContext = {
    customerName: account.customerName,
    customerPhone: account.customerPhone,
    customerAddress: account.customerAddress,
    customerNid: account.customerNid,
    guarantorName: account.guarantor?.name,
    guarantorPhone: account.guarantor?.phone,
    guarantorRelation: account.guarantor?.relationship,
    guarantorNid: account.guarantor?.nid,
    productName: account.productName,
    serialNumber: account.serialNumber,
    contractNumber: account.emiNumber,
    agreementDate: account.startDate,
    contractPrice: account.laptopPrice,
    downPayment: account.downPayment,
    financedAmount: account.financedAmount,
    interestRate: financialTerms?.interestRatePercent || 0,
    isInterestFree: financialTerms ? financialTerms.isInterestFree : true,
    interestMethod: financialTerms?.interestCalculationMethod || 'FLAT',
    durationMonths: account.durationMonths,
    monthlyInstallment: account.monthlyInstallment,
    finalInstallment: financialTerms?.finalInstallmentAmount || account.monthlyInstallment,
    firstDueDate: account.installments[0]?.dueDate || '',
    finalDueDate: account.endDate,
    gracePeriodDays: financialTerms?.gracePeriodDays || 5,
    lateFeePerDay: financialTerms?.lateFeePerDay || 0,
    companyName: settings.companyName || 'NEED ELECTRO',
    companyPhone: settings.phone || '+880 1733-983752',
    companyAddress: settings.address || 'Moulvibazar, Sylhet, Bangladesh'
  };

  // If no clauses were stored in contractTerms, interpolate the 25 standard clauses
  const activeClauses: EMIContractClause[] = savedClauses.length > 0 
    ? savedClauses 
    : getDefaultEMIClauses().map(c => ({
        ...c,
        content: interpolateClauseText(c.content, interpContext),
        contentBn: interpolateClauseText(c.contentBn, interpContext)
      }));

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('printable-emi-contract');
    if (!element) return;

    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('printable-emi-contract');
          if (clonedElement) {
            clonedElement.style.boxShadow = 'none';
            clonedElement.style.borderRadius = '0';
            clonedElement.style.margin = '0 auto';
            clonedElement.style.width = '210mm';
            clonedElement.style.maxWidth = '210mm';
          }
        },
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgProps = pdf.getImageProperties(imgData);
      const calculatedHeight = (imgProps.height * pdfWidth) / imgProps.width;

      if (calculatedHeight <= pdfHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, calculatedHeight, undefined, 'FAST');
      } else {
        let heightLeft = calculatedHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, calculatedHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;

        while (heightLeft > 1) {
          position -= pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, calculatedHeight, undefined, 'FAST');
          heightLeft -= pdfHeight;
        }
      }

      const safeEmiNumber = (account.emiNumber || 'EMI-AGREEMENT').replace(/[^a-zA-Z0-9-_]/g, '_');
      pdf.save(`EMI-Agreement-${safeEmiNumber}.pdf`);
    } catch (error) {
      console.error('Failed to generate EMI Agreement PDF:', error);
      alert('Failed to generate PDF directly. Please use the Print Contract / PDF option.');
    } finally {
      setIsGeneratingPDF(false);
    }
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
            Official EMI Contract & Terms Agreement — {account.emiNumber}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Language Switcher */}
            <div style={{ display: 'flex', border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
              <button
                className={`btn btn-xs ${printLanguage === 'BOTH' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPrintLanguage('BOTH')}
                style={{ borderRadius: 0, padding: '4px 8px', fontSize: '11px' }}
              >
                Dual (EN + বাংলা)
              </button>
              <button
                className={`btn btn-xs ${printLanguage === 'EN' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPrintLanguage('EN')}
                style={{ borderRadius: 0, padding: '4px 8px', fontSize: '11px' }}
              >
                English
              </button>
              <button
                className={`btn btn-xs ${printLanguage === 'BN' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPrintLanguage('BN')}
                style={{ borderRadius: 0, padding: '4px 8px', fontSize: '11px' }}
              >
                বাংলা
              </button>
            </div>

            <button 
              className="btn btn-success btn-sm" 
              onClick={handleDownloadPDF} 
              disabled={isGeneratingPDF}
              style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              title="Directly download contract as PDF"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Generating PDF...
                </>
              ) : (
                <>
                  <Download size={16} /> Download PDF
                </>
              )}
            </button>
            <button className="btn btn-primary btn-sm" onClick={handlePrint} style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Printer size={16} /> Print Contract / PDF
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <X size={16} /> Close
            </button>
          </div>
        </div>

        <div className="modal-body a4-preview-body">
          <div className="a4-print-document" id="printable-emi-contract">
            {/* Watermark Background */}
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
                <div className="a4-company-details" style={{ marginTop: '6px', fontSize: '11px', color: '#475569', lineHeight: '1.45' }}>
                  <p><strong>NEED ELECTRO</strong> — Trusted Electrical and Technological Solutions</p>
                  <p><strong>Main Branch Moulvibazar:</strong> {settings.address || 'Shop#5, MR Plaza, Kusumbag, Moulvibazar, Sylhet, Bangladesh'}</p>
                  <p>Hotline: <strong>{settings.phone || '+880 1733-983752'}</strong> | Email: <strong>info.needelectro@gmail.com</strong></p>
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
                  <p><strong>Contract Version:</strong> v{account.contractVersion || structuredTerms?.contractVersion || 1}.0</p>
                </div>
              </div>
            </div>

            {/* Preamble */}
            <div style={{ fontSize: '11px', lineHeight: '1.5', margin: '12px 0', color: '#334155', textAlign: 'justify' }}>
              This Hire-Purchase and Installment Financing Agreement is formally executed on <strong>{account.startDate}</strong> between <strong>{settings.companyName || 'NEED ELECTRO'}</strong> (hereinafter referred to as the <em>'Seller / Financier'</em>) and the Customer detailed below pursuant to the Contract Act 1872, Sale of Goods Act 1930, and the applicable laws of Bangladesh.
            </div>

            {/* Parties Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
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

            {/* Product & Comprehensive Financial Terms Overview */}
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{ background: '#f1f5f9', padding: '6px 10px', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                <span>3. Equipment Specification & Comprehensive Financial Terms</span>
                <span style={{ color: '#2563eb' }}>
                  {financialTerms?.isInterestFree || !financialTerms ? '0% Interest-Free Scheme' : `${financialTerms.interestRatePercent}% Interest (${financialTerms.interestCalculationMethod})`}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', padding: '10px', gap: '15px', fontSize: '11px' }}>
                <div>
                  <p><strong>Product Description:</strong> {account.productName}</p>
                  <p style={{ marginTop: '3px' }}>
                    <strong style={{ color: '#2563eb' }}>Serial Number / IMEI:</strong>{' '}
                    <span style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                      {account.serialNumber || 'N/A'}
                    </span>
                  </p>
                  <p style={{ marginTop: '3px' }}><strong>Tenure:</strong> {account.durationMonths} Monthly Installments</p>
                  <p><strong>Grace Period:</strong> {financialTerms?.gracePeriodDays || 5} Days</p>
                  <p><strong>Late Penalty Policy:</strong> {financialTerms?.lateFeePerDay ? `৳${financialTerms.lateFeePerDay}/day after grace period` : 'No contractual late fee configured'}</p>
                  <p><strong>Account Status:</strong> <span style={{ fontWeight: 'bold', color: '#16a34a' }}>{account.status}</span></p>
                </div>

                {/* Financial Summary Box */}
                <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '4px', border: '1px solid #e2e8f0', lineHeight: '1.6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Agreed Product Price:</span>
                    <strong>৳{account.laptopPrice.toLocaleString()}</strong>
                  </div>
                  {financialTerms && (financialTerms.processingFee > 0 || financialTerms.deliveryCharge > 0) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>Additional Eligible Fees:</span>
                      <span>+৳{(financialTerms.processingFee + financialTerms.documentationFee + financialTerms.deliveryCharge + financialTerms.otherCharges).toLocaleString()}</span>
                    </div>
                  )}
                  {financialTerms && financialTerms.taxAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>Statutory Tax / VAT:</span>
                      <span>+৳{financialTerms.taxAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', borderTop: '1px dashed #cbd5e1', paddingTop: '2px' }}>
                    <span>Down Payment Verified:</span>
                    <strong>-৳{account.downPayment.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2563eb', fontWeight: 'bold' }}>
                    <span>Financed Principal:</span>
                    <span>৳{account.financedAmount.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Contract Interest Charge:</span>
                    <span>{financialTerms?.totalInterest ? `+৳${financialTerms.totalInterest.toLocaleString()}` : '৳0 (0% Rate)'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', fontWeight: 'bold', borderTop: '1px solid #cbd5e1', marginTop: '4px', paddingTop: '4px' }}>
                    <span>Monthly Installment:</span>
                    <span>৳{account.monthlyInstallment.toLocaleString()} / Mo</span>
                  </div>
                  {financialTerms && financialTerms.totalInterest > 0 && account.durationMonths > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#b45309', fontWeight: 600 }}>
                      <span>• Interest Added:</span>
                      <span>+৳{Math.floor(financialTerms.totalInterest / account.durationMonths).toLocaleString()} / Mo (Principal: ৳{Math.floor(account.financedAmount / account.durationMonths).toLocaleString()})</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                    <span>Total Financed Obligation:</span>
                    <span>৳{(account.financedAmount + (financialTerms?.totalInterest || 0)).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Installment Schedule Table */}
            <div style={{ marginBottom: '14px' }}>
              <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#1e3a8a', marginBottom: '6px' }}>
                4. Authoritative Repayment Schedule
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

            {/* 25 Complete Terms & Conditions Clauses */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#1e3a8a', marginBottom: '6px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>
                5. Complete Contract Terms and Conditions ({activeClauses.length} Clauses)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '9.5px', lineHeight: '1.45', color: '#334155' }}>
                {activeClauses.map((clause, idx) => (
                  <div key={clause.id || idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px 8px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                      Clause {clause.number || idx + 1}: {printLanguage === 'BN' ? clause.titleBn : clause.title}
                      {printLanguage === 'BOTH' && ` / ${clause.titleBn}`}
                    </div>
                    {(printLanguage === 'EN' || printLanguage === 'BOTH') && (
                      <p style={{ margin: 0, textAlign: 'justify' }}>{clause.content}</p>
                    )}
                    {(printLanguage === 'BN' || printLanguage === 'BOTH') && (
                      <p style={{ margin: (printLanguage === 'BOTH' ? '4px 0 0 0' : 0), color: '#1e293b', textAlign: 'justify' }}>
                        {clause.contentBn}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Electronic Affirmation Evidence (if available) */}
            {customerAcceptance && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '8px 10px', marginBottom: '16px', fontSize: '10px', color: '#166534' }}>
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <ShieldCheck size={14} /> Electronic Affirmative Customer Acceptance Record
                </div>
                <p style={{ margin: 0 }}>
                  Customer <strong>{account.customerName}</strong> affirmatively verified the financial terms, repayment schedule, and all 25 contract conditions on <strong>{customerAcceptance.acceptedAt || account.startDate}</strong> via {customerAcceptance.acceptanceMethod}.
                </p>
              </div>
            )}

            {/* Signatures */}
            <div className="a4-signatures" style={{ marginTop: '24px' }}>
              <div className="a4-signature-box">
                <div>{account.customerName}</div>
                <div style={{ fontSize: '9px', color: '#64748b' }}>Hirer / Customer Signature</div>
              </div>
              <div className="a4-signature-box">
                <div>{account.guarantor?.name || 'Guarantor'}</div>
                <div style={{ fontSize: '9px', color: '#64748b' }}>Guarantor Signature</div>
              </div>
              <div className="a4-signature-box">
                <div>{account.approvedBy || 'Authorized Manager'}</div>
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
