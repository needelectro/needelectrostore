import React, { useState, useEffect } from 'react';
import { Investment, SystemSettings } from '../../types';
import { Printer, X, Download, Loader2, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { NeedElectroLogo } from '../NeedElectroLogo';
import { amountToBangladeshiTakaWords } from '../../utils/numberToWords';
import { useERP } from '../../services/erpStore';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface InvestmentMemoPrintProps {
  investment: Investment;
  settings: SystemSettings;
  onClose: () => void;
}

export const InvestmentMemoPrint: React.FC<InvestmentMemoPrintProps> = ({
  investment,
  settings,
  onClose,
}) => {
  const { financialAccounts, currentUser } = useERP();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    document.body.classList.add('is-printing-memo');
    document.body.classList.add('has-active-print-modal');
    return () => {
      document.body.classList.remove('is-printing-memo');
      document.body.classList.remove('has-active-print-modal');
    };
  }, []);

  if (!investment) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('printable-a4-investment-memo');
    if (!element) return;

    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution crisp output
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('printable-a4-investment-memo');
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

      const safeRef = (investment.referenceNumber || 'MEMO').replace(/[^a-zA-Z0-9-_]/g, '_');
      pdf.save(`NEED-ELECTRO-Investment-Memo-${safeRef}.pdf`);
    } catch (error) {
      console.error('Failed to generate Investment Memo PDF:', error);
      alert('Failed to generate PDF directly. Please use the Print Memo option to save as PDF.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const rawDate = investment.date || investment.createdAt || new Date();
  const parsedDate = new Date(rawDate);
  const formattedDate = isNaN(parsedDate.getTime())
    ? new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : parsedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  const safeSettings = settings || ({} as Partial<SystemSettings>);
  const depositAcc = financialAccounts.find((a) => a.id === investment.depositAccountId);
  const accountDisplayName = depositAcc
    ? `${depositAcc.name} (${depositAcc.type === 'CASH' ? 'Cash Account' : depositAcc.type === 'BANK' ? 'Bank Account' : 'Digital Wallet'})`
    : 'Main Cash Account';

  const amountNumber = Number(investment.amount) || 0;
  const amountWords = amountToBangladeshiTakaWords(amountNumber);
  const isReversed = investment.status === 'REVERSED';

  // Extract metadata fields
  let investorPhone = investment.investorPhone;
  let investorEmail = investment.investorEmail;
  let investorAddress = investment.investorAddress;
  let organization = investment.organization;
  let purpose = investment.purpose;
  let description = investment.description;
  let notes = investment.notes;

  // If notes contains JSON string, parse it
  if (notes && typeof notes === 'string' && notes.trim().startsWith('{')) {
    try {
      const parsedNotes = JSON.parse(notes);
      investorPhone = investorPhone || parsedNotes.investorPhone;
      investorEmail = investorEmail || parsedNotes.investorEmail;
      investorAddress = investorAddress || parsedNotes.investorAddress;
      organization = organization || parsedNotes.organization;
      purpose = purpose || parsedNotes.purpose;
      description = description || parsedNotes.description;
      notes = parsedNotes.userNotes || '';
    } catch {
      // keep original
    }
  }

  return (
    <div className="modal-overlay print-active-modal" style={{ zIndex: 9999 }}>
      <div className="modal-content modal-content-xl" style={{ maxWidth: '920px' }}>
        {/* Navigation Toolbar (Hidden during paper print) */}
        <div className="modal-header no-print">
          <div className="modal-title" style={{ fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} className="text-primary" />
            Official Investment Memo Preview — {investment.referenceNumber}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              className="btn btn-success btn-sm"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              title="Download official A4 PDF document"
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
            <button
              className="btn btn-primary btn-sm"
              onClick={handlePrint}
              style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Printer size={16} /> Print Memo
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={onClose}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <X size={16} /> Close
            </button>
          </div>
        </div>

        {/* Modal Scrollable Container */}
        <div className="modal-body a4-preview-body" style={{ background: '#cbd5e1', padding: '1.5rem 0', display: 'flex', justifyContent: 'center' }}>
          {/* Printable A4 Document Sheet */}
          <div
            className="a4-print-document"
            id="printable-a4-investment-memo"
            style={{
              position: 'relative',
              width: '210mm',
              minHeight: '297mm',
              padding: '16mm 18mm',
              background: '#ffffff',
              color: '#000000',
              fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
              borderRadius: '2px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Watermark Background */}
            <div
              className="a4-watermark-overlay"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                zIndex: 0,
                opacity: isReversed ? 0.08 : 0.05,
              }}
            >
              <img
                src="/logo-transparent.png"
                alt="Watermark"
                style={{ width: '420px', height: 'auto', filter: 'grayscale(100%)' }}
              />
            </div>

            {/* Reversed / Void Watermark Banner */}
            {isReversed && (
              <div
                style={{
                  position: 'absolute',
                  top: '40%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) rotate(-30deg)',
                  border: '6px dashed #dc2626',
                  color: '#dc2626',
                  fontSize: '54px',
                  fontWeight: 900,
                  letterSpacing: '0.15em',
                  padding: '12px 40px',
                  borderRadius: '12px',
                  zIndex: 2,
                  pointerEvents: 'none',
                  opacity: 0.75,
                  textTransform: 'uppercase',
                  textAlign: 'center',
                }}
              >
                REVERSED / VOID
              </div>
            )}

            {/* Content Top Section */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Header with Company Details & Memo Badge */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  borderBottom: '2.5px solid #000000',
                  paddingBottom: '12px',
                  marginBottom: '16px',
                }}
              >
                {/* Left: Branding & Organization Info */}
                <div style={{ flex: 1, paddingRight: '15px' }}>
                  <NeedElectroLogo variant="master-image" size="lg" theme="light" showSisterConcern />
                  <div style={{ marginTop: '6px', fontSize: '11px', lineHeight: 1.4, color: '#0f172a' }}>
                    <div style={{ fontWeight: 800, fontSize: '13px', color: '#000000' }}>
                      {safeSettings.companyName || 'NEED ELECTRO'}
                    </div>
                    <div style={{ color: '#475569', fontSize: '10px', fontStyle: 'italic', marginBottom: '3px' }}>
                      {safeSettings.companyTagline || 'Trusted Electrical & Technological Solutions'}
                    </div>
                    <div>{safeSettings.address || 'NEED ELECTRO Building, Central Road, Moulvibazar, Sylhet, Bangladesh'}</div>
                    <div style={{ marginTop: '2px' }}>
                      <strong>Hotline:</strong> {safeSettings.phone || '+880 1733-983752'}
                      <span style={{ margin: '0 6px' }}>•</span>
                      <strong>Email:</strong> {safeSettings.email || 'contact.amdadur@gmail.com'}
                    </div>
                    {safeSettings.website && (
                      <div>
                        <strong>Web:</strong> {safeSettings.website}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Memo Title & Meta Badge */}
                <div style={{ textAlign: 'right', minWidth: '220px' }}>
                  <div
                    style={{
                      display: 'inline-block',
                      background: '#e0f2fe',
                      color: '#0369a1',
                      border: '1.5px solid #bae6fd',
                      fontSize: '13px',
                      fontWeight: 900,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '4px 14px',
                      borderRadius: '4px',
                      marginBottom: '8px',
                    }}
                  >
                    INVESTMENT MEMO
                  </div>

                  <div style={{ fontSize: '11px', lineHeight: 1.6, color: '#000000' }}>
                    <div>
                      <strong>Investment No:</strong>{' '}
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '12px' }}>
                        {investment.referenceNumber || investment.reference || investment.id}
                      </span>
                    </div>
                    <div>
                      <strong>Date:</strong> {formattedDate}
                    </div>
                    <div>
                      <strong>Status:</strong>{' '}
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '1px 8px',
                          borderRadius: '3px',
                          fontSize: '10px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          background: isReversed ? '#fee2e2' : '#dcfce7',
                          color: isReversed ? '#b91c1c' : '#15803d',
                          border: `1px solid ${isReversed ? '#f87171' : '#86efac'}`,
                        }}
                      >
                        {isReversed ? 'REVERSED / VOID' : 'OFFICIAL / ACTIVE'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notice Banner if Reversed */}
              {isReversed && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1.5px solid #ef4444',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#991b1b',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  <AlertTriangle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>NOTICE OF TRANSACTION REVERSAL:</strong> This capital investment has been reversed in the Central Account Ledger.
                    All ledger debits and cash allocations have been counteracted in accordance with financial audit policy.
                  </div>
                </div>
              )}

              {/* 5. Investor Information Section */}
              <div
                style={{
                  border: '1.5px solid #000000',
                  borderRadius: '4px',
                  marginBottom: '14px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    background: '#f1f5f9',
                    borderBottom: '1.5px solid #000000',
                    padding: '5px 12px',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>INVESTOR INFORMATION</span>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: '#475569' }}>
                    Confidential & Official Document
                  </span>
                </div>

                <div
                  style={{
                    padding: '10px 14px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '6px 20px',
                    fontSize: '11px',
                    lineHeight: 1.45,
                  }}
                >
                  <div>
                    <span style={{ color: '#475569', fontWeight: 600 }}>Investor Name: </span>
                    <strong style={{ color: '#000000', fontSize: '12px' }}>{investment.investorName}</strong>
                  </div>

                  {organization && (
                    <div>
                      <span style={{ color: '#475569', fontWeight: 600 }}>Organization: </span>
                      <strong style={{ color: '#000000' }}>{organization}</strong>
                    </div>
                  )}

                  {investorPhone && (
                    <div>
                      <span style={{ color: '#475569', fontWeight: 600 }}>Phone: </span>
                      <span style={{ color: '#000000', fontWeight: 600 }}>{investorPhone}</span>
                    </div>
                  )}

                  {investorEmail && (
                    <div>
                      <span style={{ color: '#475569', fontWeight: 600 }}>Email: </span>
                      <span style={{ color: '#000000', fontWeight: 600 }}>{investorEmail}</span>
                    </div>
                  )}

                  {investorAddress && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#475569', fontWeight: 600 }}>Address: </span>
                      <span style={{ color: '#000000', fontWeight: 600 }}>{investorAddress}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 6. Investment Details Table */}
              <div
                style={{
                  border: '1.5px solid #000000',
                  borderRadius: '4px',
                  marginBottom: '14px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    background: '#f1f5f9',
                    borderBottom: '1.5px solid #000000',
                    padding: '5px 12px',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: '#000000',
                  }}
                >
                  TRANSACTION & ACCOUNTING SPECIFICATIONS
                </div>

                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '11px',
                  }}
                >
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '7px 12px', width: '30%', color: '#475569', fontWeight: 600, background: '#f8fafc' }}>
                        Investment Reference:
                      </td>
                      <td style={{ padding: '7px 12px', fontWeight: 700, fontFamily: 'monospace', color: '#000000' }}>
                        {investment.referenceNumber}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '7px 12px', color: '#475569', fontWeight: 600, background: '#f8fafc' }}>
                        Investment Date:
                      </td>
                      <td style={{ padding: '7px 12px', fontWeight: 600, color: '#000000' }}>
                        {formattedDate}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '7px 12px', color: '#475569', fontWeight: 600, background: '#f8fafc' }}>
                        Investment Type:
                      </td>
                      <td style={{ padding: '7px 12px', fontWeight: 700, color: '#000000' }}>
                        {investment.investmentType || 'EQUITY'}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '7px 12px', color: '#475569', fontWeight: 600, background: '#f8fafc' }}>
                        Payment Method:
                      </td>
                      <td style={{ padding: '7px 12px', fontWeight: 700, color: '#000000' }}>
                        {investment.paymentMethod || 'Cash'}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '7px 12px', color: '#475569', fontWeight: 600, background: '#f8fafc' }}>
                        Deposit Target Account:
                      </td>
                      <td style={{ padding: '7px 12px', fontWeight: 700, color: '#000000' }}>
                        {accountDisplayName}
                      </td>
                    </tr>
                    {purpose && (
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '7px 12px', color: '#475569', fontWeight: 600, background: '#f8fafc' }}>
                          Investment Purpose:
                        </td>
                        <td style={{ padding: '7px 12px', fontWeight: 600, color: '#000000' }}>
                          {purpose}
                        </td>
                      </tr>
                    )}
                    {description && (
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '7px 12px', color: '#475569', fontWeight: 600, background: '#f8fafc' }}>
                          Description:
                        </td>
                        <td style={{ padding: '7px 12px', fontWeight: 500, color: '#1e293b' }}>
                          {description}
                        </td>
                      </tr>
                    )}
                    {notes && (
                      <tr>
                        <td style={{ padding: '7px 12px', color: '#475569', fontWeight: 600, background: '#f8fafc' }}>
                          Notes / Terms:
                        </td>
                        <td style={{ padding: '7px 12px', fontStyle: 'italic', color: '#334155' }}>
                          {notes}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* 7. Highlighted Investment Amount & Amount In Words */}
              <div
                style={{
                  border: '2px solid #000000',
                  borderRadius: '4px',
                  background: '#fafafa',
                  padding: '12px 16px',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    borderBottom: '1.5px solid #000000',
                    paddingBottom: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Total Investment Amount:
                  </span>
                  <span style={{ fontSize: '20px', fontWeight: 900, color: '#000000' }}>
                    BDT {amountNumber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div style={{ fontSize: '11px', lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 700, color: '#475569' }}>Amount in Words: </span>
                  <strong style={{ color: '#000000', fontStyle: 'italic', fontSize: '11.5px' }}>
                    {amountWords}
                  </strong>
                </div>
              </div>

              {/* Ledger Compliance Declaration */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  fontSize: '9.5px',
                  lineHeight: 1.4,
                  color: '#475569',
                  marginBottom: '20px',
                }}
              >
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={12} color="#0284c7" />
                  CENTRAL ACCOUNTING LEDGER INTEGRITY CONFIRMATION
                </div>
                This official Investment Memo serves as a certified legal record of capital inflow into NEED ELECTRO financial accounts.
                The transaction has been posted to the central double-entry accounting ledger under Reference{' '}
                <strong style={{ color: '#000000' }}>{investment.referenceNumber}</strong>. No duplicate transactions or ledger mutations can be generated from this document.
              </div>
            </div>

            {/* Bottom Section: Signatures & Footer Credits */}
            <div style={{ position: 'relative', zIndex: 1, marginTop: 'auto' }}>
              {/* 10. Signature Section */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '20px',
                  marginBottom: '16px',
                  paddingTop: '28px',
                }}
              >
                {/* 1. Investor Signature */}
                <div
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    borderTop: '1.5px solid #000000',
                    paddingTop: '6px',
                    fontSize: '11px',
                  }}
                >
                  <div style={{ fontWeight: 800, color: '#000000' }}>{investment.investorName}</div>
                  <div style={{ fontSize: '9.5px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Investor Signature
                  </div>
                </div>

                {/* 2. Authorized By */}
                <div
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    borderTop: '1.5px solid #000000',
                    paddingTop: '6px',
                    fontSize: '11px',
                  }}
                >
                  <div style={{ fontWeight: 800, color: '#000000' }}>{currentUser?.name || investment.createdBy || 'Authorized Officer'}</div>
                  <div style={{ fontSize: '9.5px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Authorized By
                  </div>
                </div>

                {/* 3. NEED ELECTRO Authorized Signature */}
                <div
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    borderTop: '1.5px solid #000000',
                    paddingTop: '6px',
                    fontSize: '11px',
                  }}
                >
                  <div style={{ fontWeight: 800, color: '#000000' }}>NEED ELECTRO</div>
                  <div style={{ fontSize: '9.5px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Authorized Signature & Seal
                  </div>
                </div>
              </div>

              {/* Thank you footnote & Services List from Business Card */}
              <div
                style={{
                  paddingTop: '8px',
                  borderTop: '1px dashed #94a3b8',
                  textAlign: 'center',
                  fontSize: '9.5px',
                  color: '#1e293b',
                }}
              >
                <div style={{ fontWeight: 800, color: '#0284c7', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Our Core Services (আমাদের সেবাসমূহ)
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 12px', color: '#000000', fontWeight: 600 }}>
                  <span>💻 Laptops, Computers, CCTV, Computer Accessories</span>
                  <span>📱 Mobile App & Website Development</span>
                  <span>🏠 Complete electrical work of the house</span>
                  <span>💡 Safe and modern smart electric solutions</span>
                  <span>📹 CCTV camera installation and setup services</span>
                </div>
                <div style={{ marginTop: '4px', color: '#334155', fontSize: '9px', fontWeight: 600 }}>
                  Shop#5, MR Plaza, Kusumbag, Moulvibazar • Hotline: {safeSettings.phone || '01733-983752'} • Email: {safeSettings.email || 'info.needelectro@gmail.com'}
                </div>

                {/* Mandatory Software Development Credit */}
                <div
                  style={{
                    marginTop: '6px',
                    paddingTop: '5px',
                    borderTop: '1.5px solid #000000',
                    textAlign: 'center',
                    fontSize: '10.5px',
                    fontWeight: 900,
                    color: '#000000',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  Software Developed By AMDADS GROUP
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
