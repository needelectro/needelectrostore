import React, { useState, useMemo, useEffect } from 'react';
import { Customer, Product, ProductSerial, PaymentMethod, EMIPlan } from '../../types';
import { 
  Laptop, CheckCircle2, AlertTriangle, Calculator, FileText, 
  Calendar, DollarSign, Percent, ShieldCheck, ArrowRight, Plus, 
  Trash2, MoveUp, MoveDown, RotateCcw, Check, UserCheck, Eye, 
  Download, Printer, AlertCircle, Info, Lock
} from 'lucide-react';
import { 
  calculateEMIFinancials, 
  generateRepaymentSchedule, 
  reconcileSchedule, 
  FinancialCalculationParams,
  GeneratedScheduleItem
} from '../../services/emiCalculator';
import { 
  DEFAULT_25_EMI_CLAUSES, 
  EMIContractClause, 
  interpolateClauseText,
  ContractInterpolationContext 
} from '../../services/emiContractClauses';

interface EMIContractWizardProps {
  customers: Customer[];
  products: Product[];
  serials: ProductSerial[];
  emiPlans: EMIPlan[];
  selectedBranch: { id: string; name: string };
  currentUser: { id: string; name: string; role: string };
  settings: any;
  createCustomer: (customerData: any) => Promise<{ success: boolean; customer?: Customer; error?: string }>;
  createSale: (saleData: any, emiPlanConfig: any) => Promise<{ success: boolean; sale?: any; error?: string }>;
  onSuccess: (createdAccount?: any) => void;
  onCancel: () => void;
}

export const EMIContractWizard: React.FC<EMIContractWizardProps> = ({
  customers,
  products,
  serials,
  emiPlans,
  selectedBranch,
  currentUser,
  settings,
  createCustomer,
  createSale,
  onSuccess,
  onCancel,
}) => {
  // Wizard Navigation Tabs
  type WizardTab = 'customer' | 'financials' | 'schedule' | 'clauses' | 'preview';
  const [activeStep, setActiveStep] = useState<WizardTab>('customer');

  // -------------------------------------------------------------
  // STEP 1: CUSTOMER & GUARANTOR STATE
  // -------------------------------------------------------------
  const [customerType, setCustomerType] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustNid, setNewCustNid] = useState('');

  // Guarantor
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorPhone, setGuarantorPhone] = useState('');
  const [guarantorNid, setGuarantorNid] = useState('');
  const [guarantorRelationship, setGuarantorRelationship] = useState('Family Member');
  const [guarantorAddress, setGuarantorAddress] = useState('');

  // -------------------------------------------------------------
  // STEP 2: PRODUCT, PRICING & DOWN PAYMENT STATE
  // -------------------------------------------------------------
  const laptopProducts = useMemo(() => {
    const list = products.filter(p => p.category === 'Laptop' && p.status === 'ACTIVE');
    return list.length > 0 ? list : products.filter(p => p.status === 'ACTIVE');
  }, [products]);

  const [selectedProductId, setSelectedProductId] = useState<string>(laptopProducts[0]?.id || '');
  const currentProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || laptopProducts[0];
  }, [products, selectedProductId, laptopProducts]);

  const availableSerials = useMemo(() => {
    return serials.filter(s => s.productId === selectedProductId && s.status === 'AVAILABLE');
  }, [serials, selectedProductId]);

  const [selectedSerial, setSelectedSerial] = useState<string>('');

  useEffect(() => {
    if (availableSerials.length > 0) {
      setSelectedSerial(availableSerials[0].serialNumber);
    } else {
      setSelectedSerial('');
    }
  }, [selectedProductId, availableSerials]);

  // Pricing & Price Override
  const defaultProductPrice = currentProduct ? (currentProduct.emiPrice || currentProduct.retailPrice || 50000) : 50000;
  const [agreedPrice, setAgreedPrice] = useState<number>(defaultProductPrice);
  const [priceOverrideReason, setPriceOverrideReason] = useState<string>('');

  useEffect(() => {
    if (currentProduct) {
      const p = currentProduct.emiPrice || currentProduct.retailPrice || 50000;
      setAgreedPrice(p);
    }
  }, [currentProduct]);

  // Discount
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('FIXED');
  const [discountValue, setDiscountValue] = useState<number>(0);

  // Additional Eligible Charges
  const [processingFee, setProcessingFee] = useState<number>(500);
  const [documentationFee, setDocumentationFee] = useState<number>(0);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [otherCharges, setOtherCharges] = useState<number>(0);
  const [otherChargesDesc, setOtherChargesDesc] = useState<string>('');

  // Taxes
  const [taxPercent, setTaxPercent] = useState<number>(0);

  // Down Payment
  const [selectedPlanId, setSelectedPlanId] = useState<string>(emiPlans[0]?.id || '');
  const currentPlan = useMemo(() => {
    return emiPlans.find(p => p.id === selectedPlanId) || emiPlans[0];
  }, [emiPlans, selectedPlanId]);

  const [downPaymentType, setDownPaymentType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [downPaymentValue, setDownPaymentValue] = useState<number>(currentPlan?.minDownPaymentPercent || 25);
  const [downPaymentMethod, setDownPaymentMethod] = useState<PaymentMethod>('bKash');
  const [downPaymentStatus, setDownPaymentStatus] = useState<'PENDING' | 'PAID' | 'PARTIALLY_PAID'>('PAID');
  const [downPaymentDueDate, setDownPaymentDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [downPaymentTxRef, setDownPaymentTxRef] = useState<string>('');

  // -------------------------------------------------------------
  // STEP 3: INTEREST & INSTALLMENT SCHEDULE STATE
  // -------------------------------------------------------------
  const [isInterestFree, setIsInterestFree] = useState<boolean>(true);
  const [interestType, setInterestType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('FIXED_AMOUNT');
  const [customInterestAmount, setCustomInterestAmount] = useState<number>(0);
  const [interestRatePercent, setInterestRatePercent] = useState<number>(0);
  const [interestMethod, setInterestMethod] = useState<'FLAT' | 'REDUCING_BALANCE'>('FLAT');
  const [interestBasis, setInterestBasis] = useState<'TOTAL_FLAT' | 'ANNUAL'>('TOTAL_FLAT');
  const [interestAdjustmentReason, setInterestAdjustmentReason] = useState<string>('');

  // Installment Tenure
  const [durationMonths, setDurationMonths] = useState<number>(currentPlan?.durationMonths || 6);
  const [firstDueDate, setFirstDueDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });
  const [recurringDueDay, setRecurringDueDay] = useState<number>(10);
  const [gracePeriodDays, setGracePeriodDays] = useState<number>(currentPlan?.gracePeriodDays || 5);
  const [lateFeePerDay, setLateFeePerDay] = useState<number>(currentPlan?.lateFeePerDay || 50);

  // Reconciled & Editable Schedule Table
  const [customSchedule, setCustomSchedule] = useState<GeneratedScheduleItem[]>([]);
  const [isCustomScheduleActive, setIsCustomScheduleActive] = useState<boolean>(false);

  // Synchronize plan defaults when selectedPlanId changes
  useEffect(() => {
    if (currentPlan) {
      setDurationMonths(currentPlan.durationMonths);
      setDownPaymentValue(currentPlan.minDownPaymentPercent);
      setProcessingFee(Number(currentPlan.processingFee) || 500);
      setGracePeriodDays(currentPlan.gracePeriodDays || 5);
      setLateFeePerDay(Number(currentPlan.lateFeePerDay) || 50);
      if (Number(currentPlan.interestRatePercent) > 0) {
        setIsInterestFree(false);
        setInterestType('PERCENTAGE');
        setInterestRatePercent(Number(currentPlan.interestRatePercent));
      } else {
        setIsInterestFree(true);
        setInterestType('FIXED_AMOUNT');
        setCustomInterestAmount(0);
        setInterestRatePercent(0);
      }
    }
  }, [currentPlan]);

  // -------------------------------------------------------------
  // REAL-TIME FINANCIAL SUMMARY ENGINE
  // -------------------------------------------------------------
  const financials = useMemo(() => {
    const params: FinancialCalculationParams = {
      originalPrice: defaultProductPrice,
      agreedPrice,
      discountType,
      discountValue,
      processingFee,
      documentationFee,
      deliveryCharge,
      otherCharges,
      taxPercent,
      downPaymentType,
      downPaymentValue,
      isInterestFree,
      interestType,
      customInterestAmount,
      interestRatePercent,
      interestMethod,
      interestBasis,
      durationMonths,
      firstDueDate,
      recurringDueDay,
    };
    return calculateEMIFinancials(params);
  }, [
    defaultProductPrice, agreedPrice, discountType, discountValue,
    processingFee, documentationFee, deliveryCharge, otherCharges,
    taxPercent, downPaymentType, downPaymentValue, isInterestFree,
    interestType, customInterestAmount,
    interestRatePercent, interestMethod, interestBasis, durationMonths, firstDueDate, recurringDueDay
  ]);

  // Regenerate schedule whenever financial inputs change (unless manual edit mode)
  useEffect(() => {
    if (!isCustomScheduleActive) {
      const generated = generateRepaymentSchedule(
        durationMonths,
        financials.totalFinancedRepayment,
        firstDueDate,
        recurringDueDay,
        financials.financedPrincipal,
        financials.totalInterest,
        interestMethod,
        interestRatePercent
      );
      setCustomSchedule(generated);
    }
  }, [
    durationMonths,
    financials.totalFinancedRepayment,
    financials.financedPrincipal,
    financials.totalInterest,
    interestMethod,
    interestRatePercent,
    firstDueDate,
    recurringDueDay,
    isCustomScheduleActive
  ]);

  // Schedule Reconciliation
  const scheduleReconciliation = useMemo(() => {
    return reconcileSchedule(
      customSchedule,
      financials.totalFinancedRepayment,
      financials.financedPrincipal,
      financials.totalInterest
    );
  }, [customSchedule, financials.totalFinancedRepayment, financials.financedPrincipal, financials.totalInterest]);

  // Handler to auto balance final installment
  const handleAutoBalanceSchedule = () => {
    if (customSchedule.length === 0) return;
    const items = [...customSchedule];
    const initialSumWithoutLast = items.slice(0, -1).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const neededFinal = Math.max(0, financials.totalFinancedRepayment - initialSumWithoutLast);
    items[items.length - 1].amount = neededFinal;
    setCustomSchedule(items);
  };

  const handleResetEqualSchedule = () => {
    setIsCustomScheduleActive(false);
    const generated = generateRepaymentSchedule(
      durationMonths,
      financials.totalFinancedRepayment,
      firstDueDate,
      recurringDueDay,
      financials.financedPrincipal,
      financials.totalInterest,
      interestMethod,
      interestRatePercent
    );
    setCustomSchedule(generated);
  };

  // -------------------------------------------------------------
  // STEP 4: TERMS & CONDITIONS CLAUSE EDITOR STATE
  // -------------------------------------------------------------
  const [clauses, setClauses] = useState<EMIContractClause[]>(() => {
    return JSON.parse(JSON.stringify(DEFAULT_25_EMI_CLAUSES));
  });
  const [termsLanguage, setTermsLanguage] = useState<'EN' | 'BN' | 'BOTH'>('EN');
  const [clauseFilter, setClauseFilter] = useState<'ALL' | 'MANDATORY' | 'FINANCIAL' | 'LEGAL' | 'OPERATIONAL' | 'SCHEDULE'>('ALL');
  const [editingClauseId, setEditingClauseId] = useState<string | null>(null);

  // New custom clause form
  const [showAddClause, setShowAddClause] = useState(false);
  const [newClauseTitle, setNewClauseTitle] = useState('');
  const [newClauseTitleBn, setNewClauseTitleBn] = useState('');
  const [newClauseContent, setNewClauseContent] = useState('');
  const [newClauseContentBn, setNewClauseContentBn] = useState('');

  const handleAddCustomClause = () => {
    if (!newClauseTitle.trim() || !newClauseContent.trim()) {
      alert('Please enter clause title and text content.');
      return;
    }
    const newClause: EMIContractClause = {
      id: 'custom-' + Date.now(),
      number: clauses.length + 1,
      title: newClauseTitle.trim(),
      titleBn: newClauseTitleBn.trim() || newClauseTitle.trim(),
      content: newClauseContent.trim(),
      contentBn: newClauseContentBn.trim() || newClauseContent.trim(),
      isMandatory: false,
      order: clauses.length + 1,
      category: 'CUSTOM',
    };
    setClauses(prev => [...prev, newClause]);
    setNewClauseTitle('');
    setNewClauseTitleBn('');
    setNewClauseContent('');
    setNewClauseContentBn('');
    setShowAddClause(false);
  };

  const handleDeleteClause = (clauseId: string) => {
    const clause = clauses.find(c => c.id === clauseId);
    if (clause?.isMandatory) {
      alert('Mandatory contractual clauses cannot be deleted.');
      return;
    }
    setClauses(prev => prev.filter(c => c.id !== clauseId).map((c, idx) => ({ ...c, number: idx + 1, order: idx + 1 })));
  };

  const handleMoveClause = (index: number, direction: 'UP' | 'DOWN') => {
    if ((direction === 'UP' && index === 0) || (direction === 'DOWN' && index === clauses.length - 1)) return;
    const newClauses = [...clauses];
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    const temp = newClauses[index];
    newClauses[index] = newClauses[targetIdx];
    newClauses[targetIdx] = temp;
    setClauses(newClauses.map((c, idx) => ({ ...c, number: idx + 1, order: idx + 1 })));
  };

  const handleResetToDefaultClauses = () => {
    if (confirm('Reset all contractual clauses back to the standard 25 template clauses? Custom edits will be overwritten.')) {
      setClauses(JSON.parse(JSON.stringify(DEFAULT_25_EMI_CLAUSES)));
    }
  };

  // -------------------------------------------------------------
  // STEP 5: PREVIEW & CUSTOMER AFFIRMATIVE ACCEPTANCE STATE
  // -------------------------------------------------------------
  const [confirmedFinancials, setConfirmedFinancials] = useState(false);
  const [confirmedSchedule, setConfirmedSchedule] = useState(false);
  const [confirmedTerms, setConfirmedTerms] = useState(false);
  const [confirmedIdentity, setConfirmedIdentity] = useState(false);
  const [acceptanceNotes, setAcceptanceNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active customer details
  const activeCustomer = useMemo(() => {
    if (customerType === 'NEW') {
      return {
        name: newCustName.trim() || 'New Customer',
        phone: newCustPhone.trim() || 'Pending',
        address: newCustAddress.trim() || 'Showroom Address',
        nid: newCustNid.trim() || 'Pending NID',
      };
    }
    const existing = customers.find(c => c.id === selectedCustomerId);
    return {
      name: existing?.name || 'Selected Customer',
      phone: existing?.phone || '',
      address: existing?.address || '',
      nid: existing?.nid || 'Verified',
    };
  }, [customerType, newCustName, newCustPhone, newCustAddress, newCustNid, customers, selectedCustomerId]);

  // Context for clause interpolation
  const interpolationContext: ContractInterpolationContext = useMemo(() => {
    return {
      customerName: activeCustomer.name,
      customerPhone: activeCustomer.phone,
      customerAddress: activeCustomer.address,
      customerNid: activeCustomer.nid,
      guarantorName: guarantorName || undefined,
      guarantorPhone: guarantorPhone || undefined,
      guarantorRelation: guarantorRelationship,
      guarantorNid: guarantorNid || undefined,
      productName: currentProduct?.name || 'Laptop Equipment',
      serialNumber: selectedSerial || 'Unassigned / Model Level',
      contractNumber: 'EMI-' + Date.now().toString().slice(-6),
      agreementDate: new Date().toISOString().split('T')[0],
      contractPrice: financials.finalContractPrice,
      downPayment: financials.downPaymentAmount,
      financedAmount: financials.financedPrincipal,
      interestRate: financials.effectiveAnnualRate,
      isInterestFree,
      interestMethod,
      durationMonths,
      monthlyInstallment: financials.regularInstallmentAmount,
      finalInstallment: financials.finalInstallmentAmount,
      firstDueDate,
      finalDueDate: customSchedule[customSchedule.length - 1]?.dueDate || 'Maturity Date',
      gracePeriodDays,
      lateFeePerDay,
      companyName: settings?.companyName || 'NEED ELECTRO',
      companyPhone: settings?.phone || '+880 1733-983752',
      companyAddress: settings?.address || 'NEED ELECTRO Building, Central Road, Moulvibazar, Sylhet',
    };
  }, [
    activeCustomer, guarantorName, guarantorPhone, guarantorRelationship, guarantorNid,
    currentProduct, selectedSerial, financials, isInterestFree, interestMethod,
    durationMonths, firstDueDate, customSchedule, gracePeriodDays, lateFeePerDay, settings
  ]);

  // -------------------------------------------------------------
  // FINAL CONTRACT EXECUTION HANDLER
  // -------------------------------------------------------------
  const handleExecuteContract = async () => {
    if (!confirmedFinancials || !confirmedSchedule || !confirmedTerms || !confirmedIdentity) {
      alert('Please complete all 4 mandatory affirmative acceptance checks before executing the contract.');
      return;
    }

    if (!scheduleReconciliation.isBalanced) {
      alert(`The repayment schedule does not reconcile with the contract obligation. Discrepancy: ৳${scheduleReconciliation.difference}. Please click 'Auto-Balance Final Installment' in Step 3.`);
      setActiveStep('schedule');
      return;
    }

    if (customerType === 'NEW') {
      if (!newCustName.trim() || !newCustPhone.trim() || !newCustNid.trim()) {
        alert('Please complete the customer name, phone number, and National ID (NID).');
        setActiveStep('customer');
        return;
      }
    } else {
      if (!selectedCustomerId) {
        alert('Please select an existing customer.');
        setActiveStep('customer');
        return;
      }
    }

    if (agreedPrice !== defaultProductPrice && !priceOverrideReason.trim()) {
      alert('A price override was applied. Please provide a brief reason for audit record in Step 2.');
      setActiveStep('financials');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalCustomerId = selectedCustomerId;
      let finalCustomerName = activeCustomer.name;
      let finalCustomerPhone = activeCustomer.phone;

      // 1. Create Customer if new
      if (customerType === 'NEW') {
        const cRes = await createCustomer({
          name: newCustName.trim(),
          phone: newCustPhone.trim(),
          address: newCustAddress.trim(),
          nid: newCustNid.trim(),
          guarantor: guarantorName ? {
            name: guarantorName.trim(),
            relationship: guarantorRelationship,
            phone: guarantorPhone.trim(),
            nid: guarantorNid.trim(),
            address: guarantorAddress.trim(),
          } : undefined,
          creditLimit: 150000,
        });

        if (!cRes.success || !cRes.customer) {
          throw new Error(cRes.error || 'Failed to create customer record.');
        }
        finalCustomerId = cRes.customer.id;
        finalCustomerName = cRes.customer.name;
        finalCustomerPhone = cRes.customer.phone;
      }

      // 2. Prepare structured contract payload
      const contractTermsText = clauses.map(c => {
        const content = termsLanguage === 'BN' ? c.contentBn : c.content;
        const title = termsLanguage === 'BN' ? c.titleBn : c.title;
        return `${c.number}. ${title}\n${interpolateClauseText(content, interpolationContext)}\n`;
      }).join('\n');

      const emiPlanConfigPayload = {
        planId: selectedPlanId,
        durationMonths,
        downPayment: financials.downPaymentAmount,
        financedAmount: financials.financedPrincipal,
        monthlyInstallment: financials.regularInstallmentAmount,
        totalPayable: financials.totalCustomerPayable,
        totalFinancedRepayment: financials.totalFinancedRepayment,
        interestRatePercent: financials.effectiveAnnualRate,
        isInterestFree,
        interestType,
        customInterestAmount: interestType === 'FIXED_AMOUNT' ? customInterestAmount : 0,
        interestMethod,
        guarantor: guarantorName ? {
          name: guarantorName.trim(),
          phone: guarantorPhone.trim(),
          relation: guarantorRelationship,
          relationship: guarantorRelationship,
          nid: guarantorNid.trim(),
          address: guarantorAddress.trim(),
        } : undefined,
        financialTerms: {
          originalPrice: defaultProductPrice,
          agreedPrice,
          discountType,
          discountValue,
          discountAmount: financials.discountAmount,
          processingFee,
          documentationFee,
          deliveryCharge,
          otherCharges,
          otherChargesDescription: otherChargesDesc,
          taxPercent,
          taxAmount: financials.taxAmount,
          finalContractPrice: financials.finalContractPrice,
          downPaymentType,
          downPaymentValue,
          downPaymentAmount: financials.downPaymentAmount,
          minDownPaymentPercent: currentPlan?.minDownPaymentPercent || 25,
          downPaymentDueDate,
          downPaymentMethod,
          downPaymentStatus,
          downPaymentTxRef,
          isInterestFree,
          interestType,
          manualInterestAmount: interestType === 'FIXED_AMOUNT' ? customInterestAmount : 0,
          interestRatePercent: financials.effectiveAnnualRate,
          interestCalculationMethod: interestMethod,
          interestPeriod: 'MONTHLY',
          totalInterest: financials.totalInterest,
          totalFinancedRepayment: financials.totalFinancedRepayment,
          interestAdjustmentReason,
          priceOverrideReason,
          durationMonths,
          firstDueDate,
          recurringDueDay,
          gracePeriodDays,
          regularInstallmentAmount: financials.regularInstallmentAmount,
          finalInstallmentAmount: financials.finalInstallmentAmount,
          lateFeePerDay,
          earlySettlementDiscountPercent: 0,
        },
        clauses,
        schedule: customSchedule.map((inst, idx) => ({
          installmentNumber: inst.installmentNumber,
          dueDate: inst.dueDate,
          amount: inst.amount,
          principalPortion: scheduleReconciliation.reconciledSchedule[idx]?.principalPortion || inst.principalPortion || 0,
          interestPortion: scheduleReconciliation.reconciledSchedule[idx]?.interestPortion || inst.interestPortion || 0,
          remainingBalanceAfter: scheduleReconciliation.reconciledSchedule[idx]?.remainingBalanceAfter || 0,
        })),
        customerAcceptance: {
          isAccepted: true,
          acceptedAt: new Date().toISOString(),
          acceptedBy: currentUser.name,
          acceptanceMethod: 'ELECTRONIC_AFFIRMATIVE',
          confirmedFinancials,
          confirmedSchedule,
          confirmedTerms,
          notes: acceptanceNotes,
        },
        termsLanguage,
        contractTermsText,
      };

      // 3. Create Sale & EMI Account via API
      const saleData = {
        customerId: finalCustomerId,
        customerName: finalCustomerName,
        customerPhone: finalCustomerPhone,
        customerAddress: activeCustomer.address,
        branchId: selectedBranch.id,
        date: new Date().toISOString().split('T')[0],
        items: [
          {
            productId: currentProduct.id,
            productName: currentProduct.name,
            sku: currentProduct.sku,
            category: currentProduct.category || 'Laptop',
            quantity: 1,
            unitPrice: agreedPrice,
            discount: financials.discountAmount,
            total: financials.finalContractPrice,
            warrantyMonths: currentProduct.warrantyPeriodMonths || 12,
            isSerialized: Boolean(selectedSerial),
            serialNumbers: selectedSerial ? [selectedSerial] : [],
          },
        ],
        subtotal: agreedPrice,
        overallDiscount: financials.discountAmount,
        vatAmount: financials.taxAmount,
        vatPercent: taxPercent,
        deliveryCharge,
        serviceCharge: documentationFee,
        otherCharges: processingFee + otherCharges,
        grandTotal: financials.finalContractPrice,
        paidAmount: downPaymentStatus === 'PAID' ? financials.downPaymentAmount : 0,
        dueAmount: financials.financedPrincipal,
        payments: downPaymentStatus === 'PAID' ? [{
          method: downPaymentMethod,
          amount: financials.downPaymentAmount,
          ref: downPaymentTxRef || undefined,
        }] : [],
        saleType: 'EMI',
        status: 'COMPLETED',
        salespersonId: currentUser.id,
        salespersonName: currentUser.name,
        notes: `Advanced EMI Contract executed for ${durationMonths} months. Total: ৳${financials.finalContractPrice.toLocaleString()}, Down Payment: ৳${financials.downPaymentAmount.toLocaleString()}`,
      };

      const res = await createSale(saleData, emiPlanConfigPayload);
      if (res.success && res.sale) {
        alert(`EMI Contract Successfully Executed! Invoice: ${res.sale.invoiceNumber}. Repayment schedule and legal terms have been bound.`);
        onSuccess(res.sale);
      } else {
        throw new Error(res.error || 'Failed to execute EMI sale.');
      }
    } catch (err: any) {
      console.error('Contract execution error:', err);
      alert(`Error creating EMI contract: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Wizard Header & Progress Bar */}
      <div 
        className="erp-card" 
        style={{ 
          padding: '1.25rem 1.5rem', 
          background: 'linear-gradient(135deg, rgba(0, 140, 255, 0.08) 0%, rgba(13, 30, 46, 0.95) 100%)',
          border: '1px solid rgba(0, 140, 255, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
            <Laptop size={22} color="var(--brand-primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              Advanced EMI Contract & Terms Management
            </h2>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
            Configure custom financial terms, adjust repayment schedules, and manage all 25 legal clauses before finalizing.
          </p>
        </div>

        {/* Step Indicator Badges */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {[
            { id: 'customer', num: 1, label: 'Customer & Guarantor' },
            { id: 'financials', num: 2, label: 'Product & Pricing' },
            { id: 'schedule', num: 3, label: 'Schedule & Interest' },
            { id: 'clauses', num: 4, label: '25 Terms & Clauses' },
            { id: 'preview', num: 5, label: 'Preview & Execute' },
          ].map(s => (
            <button
              key={s.id}
              type="button"
              className={`btn btn-xs ${activeStep === s.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveStep(s.id as WizardTab)}
              style={{ fontWeight: activeStep === s.id ? 800 : 600, padding: '6px 12px', borderRadius: '8px' }}
            >
              <span style={{ opacity: 0.8 }}>#{s.num}</span> {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout: Left Controls + Right Live Financial Calculation Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '1.25rem', alignItems: 'start' }}>
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: ACTIVE STEP CONTENT                          */}
        {/* ========================================================= */}
        <div className="erp-card" style={{ padding: '1.5rem', minHeight: '600px' }}>
          
          {/* STEP 1: CUSTOMER & GUARANTOR */}
          {activeStep === 'customer' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserCheck size={18} color="var(--brand-primary)" />
                  Step 1: Customer Profile & Guarantor Undertaking
                </h3>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    type="button"
                    className={`btn btn-xs ${customerType === 'EXISTING' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setCustomerType('EXISTING')}
                  >
                    Existing Customer
                  </button>
                  <button
                    type="button"
                    className={`btn btn-xs ${customerType === 'NEW' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setCustomerType('NEW')}
                  >
                    + Register New Customer
                  </button>
                </div>
              </div>

              {customerType === 'EXISTING' ? (
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Choose Existing Customer *</label>
                  <select
                    className="form-select"
                    value={selectedCustomerId}
                    onChange={e => setSelectedCustomerId(e.target.value)}
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone}) — NID: {c.nid || 'Verified on file'}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Shakawat Hossain"
                      value={newCustName}
                      onChange={e => setNewCustName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>Phone Number *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="017XX-XXXXXX"
                      value={newCustPhone}
                      onChange={e => setNewCustPhone(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>National ID (NID) *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="10 or 17 digit NID"
                      value={newCustNid}
                      onChange={e => setNewCustNid(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>Residential Address *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Kusumbag, Moulvibazar"
                      value={newCustAddress}
                      onChange={e => setNewCustAddress(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Guarantor Section */}
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
                  <ShieldCheck size={18} color="#10b981" />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                    Guarantor Particulars (জামিনদারের বিবরণ — Optional but Recommended)
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Guarantor Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Full name of guarantor"
                      value={guarantorName}
                      onChange={e => setGuarantorName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Guarantor Mobile Phone</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="018XX-XXXXXX"
                      value={guarantorPhone}
                      onChange={e => setGuarantorPhone(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Relationship with Customer</label>
                    <select
                      className="form-select"
                      value={guarantorRelationship}
                      onChange={e => setGuarantorRelationship(e.target.value)}
                    >
                      <option value="Family Member">Family Member (পারিবারিক আত্মীয়)</option>
                      <option value="Colleague / Employer">Colleague / Employer (সহকর্মী / নিয়োগকর্তা)</option>
                      <option value="Business Associate">Business Associate (ব্যবসায়ী সহযোগী)</option>
                      <option value="Local Guardian">Local Guardian (স্থানীয় অভিভাবক)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Guarantor National ID (NID)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="NID number of guarantor"
                      value={guarantorNid}
                      onChange={e => setGuarantorNid(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Guarantor Residential Address</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Guarantor residential address"
                      value={guarantorAddress}
                      onChange={e => setGuarantorAddress(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setActiveStep('financials')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                >
                  Proceed to Product & Pricing <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PRODUCT, PRICING & DOWN PAYMENT */}
          {activeStep === 'financials' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DollarSign size={18} color="var(--brand-primary)" />
                  Step 2: Product, Custom Pricing, Charges & Down Payment
                </h3>
              </div>

              {/* Product and Serial Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>Choose Laptop Model *</label>
                  <select
                    className="form-select"
                    value={selectedProductId}
                    onChange={e => setSelectedProductId(e.target.value)}
                  >
                    {laptopProducts.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} — Retail: ৳{(p.retailPrice || 0).toLocaleString()} | EMI: ৳{(p.emiPrice || p.retailPrice || 0).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Physical Serial Number (Optional)</label>
                  <select
                    className="form-select"
                    value={selectedSerial}
                    onChange={e => setSelectedSerial(e.target.value)}
                  >
                    <option value="">— No Serial Assigned —</option>
                    {availableSerials.map(s => (
                      <option key={s.id} value={s.serialNumber}>
                        {s.serialNumber} (Available in {selectedBranch.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price Override & Discount */}
              <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--brand-primary)' }}>
                  Pricing & Commercial Discount Controls
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Original Standard Price (৳)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={defaultProductPrice}
                      disabled
                      style={{ opacity: 0.7 }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>Agreed Selling Price (৳) *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={agreedPrice}
                      onChange={e => setAgreedPrice(Math.max(0, Number(e.target.value)))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Discount Type</label>
                    <select
                      className="form-select"
                      value={discountType}
                      onChange={e => setDiscountType(e.target.value as any)}
                    >
                      <option value="FIXED">Fixed Taka Discount (৳)</option>
                      <option value="PERCENTAGE">Percentage Discount (%)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Discount Value ({discountType === 'PERCENTAGE' ? '%' : '৳'})</label>
                    <input
                      type="number"
                      className="form-input"
                      value={discountValue}
                      onChange={e => setDiscountValue(Math.max(0, Number(e.target.value)))}
                    />
                  </div>
                </div>

                {agreedPrice !== defaultProductPrice && (
                  <div className="form-group" style={{ marginTop: '0.75rem' }}>
                    <label className="form-label" style={{ color: '#f59e0b', fontWeight: 700 }}>
                      ⚠ Price Override Audit Reason *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Special student promotion / corporate client volume quote"
                      value={priceOverrideReason}
                      onChange={e => setPriceOverrideReason(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Additional Eligible Charges & Taxes */}
              <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--brand-primary)' }}>
                  Disclosed Administrative Fees & VAT
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Processing Fee (৳)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={processingFee}
                      onChange={e => setProcessingFee(Math.max(0, Number(e.target.value)))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Documentation Fee (৳)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={documentationFee}
                      onChange={e => setDocumentationFee(Math.max(0, Number(e.target.value)))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Delivery / Installation (৳)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={deliveryCharge}
                      onChange={e => setDeliveryCharge(Math.max(0, Number(e.target.value)))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Statutory VAT / Tax (%)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={taxPercent}
                      onChange={e => setTaxPercent(Math.max(0, Number(e.target.value)))}
                    />
                  </div>
                </div>
              </div>

              {/* Down Payment Controls */}
              <div style={{ background: 'rgba(0, 140, 255, 0.05)', border: '1px solid rgba(0, 140, 255, 0.25)', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--brand-primary)' }}>
                    Down Payment Configuration
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>
                    Calculated Down Payment: ৳{financials.downPaymentAmount.toLocaleString()}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Down Payment Mode</label>
                    <select
                      className="form-select"
                      value={downPaymentType}
                      onChange={e => setDownPaymentType(e.target.value as any)}
                    >
                      <option value="PERCENTAGE">Percentage of Contract (%)</option>
                      <option value="FIXED">Fixed Taka Amount (৳)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Value ({downPaymentType === 'PERCENTAGE' ? '%' : '৳'})</label>
                    <input
                      type="number"
                      className="form-input"
                      value={downPaymentValue}
                      onChange={e => setDownPaymentValue(Math.max(0, Number(e.target.value)))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select
                      className="form-select"
                      value={downPaymentMethod}
                      onChange={e => setDownPaymentMethod(e.target.value as any)}
                    >
                      <option value="bKash">bKash Merchant</option>
                      <option value="Nagad">Nagad Merchant</option>
                      <option value="Cash">Cash at Counter</option>
                      <option value="Bank Transfer">Bank Transfer / Deposit</option>
                      <option value="Card">POS Card Swipe</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Status</label>
                    <select
                      className="form-select"
                      value={downPaymentStatus}
                      onChange={e => setDownPaymentStatus(e.target.value as any)}
                    >
                      <option value="PAID">Paid / Collected</option>
                      <option value="PENDING">Pending Verification</option>
                      <option value="PARTIALLY_PAID">Partially Paid</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Trx ID / Bank Deposit Slip Ref</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. BK98231AA9 or Counter Memo #101"
                      value={downPaymentTxRef}
                      onChange={e => setDownPaymentTxRef(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveStep('customer')}
                >
                  Back to Customer
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setActiveStep('schedule')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                >
                  Configure Interest & Schedule <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: INTEREST & INSTALLMENT SCHEDULE */}
          {activeStep === 'schedule' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calculator size={18} color="var(--brand-primary)" />
                  Step 3: Interest Terms & Interactive Repayment Schedule
                </h3>
              </div>

              {/* Interest Configuration Panel */}
              <div style={{ background: 'var(--bg-secondary)', padding: '1.15rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Interest Scheme & Addition</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Choose how interest is determined and added to each monthly installment
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className={`btn btn-xs ${isInterestFree ? 'btn-success' : 'btn-secondary'}`}
                      onClick={() => {
                        setIsInterestFree(true);
                        setInterestType('FIXED_AMOUNT');
                        setCustomInterestAmount(0);
                        setInterestRatePercent(0);
                      }}
                      style={{ fontWeight: 700 }}
                    >
                      ✓ 0% Interest-Free
                    </button>
                    <button
                      type="button"
                      className={`btn btn-xs ${!isInterestFree && interestType === 'FIXED_AMOUNT' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => {
                        setIsInterestFree(false);
                        setInterestType('FIXED_AMOUNT');
                        if (customInterestAmount === 0) {
                          setCustomInterestAmount(3000);
                        }
                      }}
                      style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      ৳ Manual Fixed Amount
                    </button>
                    <button
                      type="button"
                      className={`btn btn-xs ${!isInterestFree && interestType === 'PERCENTAGE' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => {
                        setIsInterestFree(false);
                        setInterestType('PERCENTAGE');
                        if (interestRatePercent === 0) {
                          setInterestRatePercent(5);
                        }
                      }}
                      style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      % Percentage Rate
                    </button>
                  </div>
                </div>

                {isInterestFree && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} />
                    <span><strong>0% Interest-Free Contract:</strong> No interest surcharge applied. Monthly installment is 100% principal repayment (৳{financials.monthlyPrincipalPortion.toLocaleString()} / mo).</span>
                  </div>
                )}

                {/* Option 1: Manual Fixed Interest Amount in BDT */}
                {!isInterestFree && interestType === 'FIXED_AMOUNT' && (
                  <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', marginTop: '0.75rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Manual Interest Amount (টাকা / BDT)</span>
                          <span style={{ color: 'var(--brand-primary)', fontSize: '0.75rem', fontWeight: 700 }}>
                            Equiv: {financials.effectiveAnnualRate}% Rate
                          </span>
                        </label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--brand-primary)', fontSize: '1rem' }}>৳</span>
                          <input
                            type="number"
                            min="0"
                            step="100"
                            className="form-input"
                            style={{ paddingLeft: '28px', fontWeight: 800, fontSize: '1.05rem', color: 'var(--brand-primary)' }}
                            value={customInterestAmount}
                            onChange={e => setCustomInterestAmount(Math.max(0, Math.round(Number(e.target.value) || 0)))}
                            placeholder="Enter manual interest (e.g. 3000)"
                          />
                        </div>
                        {/* Quick Presets */}
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Quick Presets:</span>
                          {[1000, 2000, 3000, 5000, 7500, 10000].map(amt => (
                            <button
                              key={amt}
                              type="button"
                              className={`btn btn-xs ${customInterestAmount === amt ? 'btn-primary' : 'btn-secondary'}`}
                              style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                              onClick={() => setCustomInterestAmount(amt)}
                            >
                              ৳{amt.toLocaleString()}
                            </button>
                          ))}
                          <button
                            type="button"
                            className="btn btn-xs btn-secondary"
                            style={{ fontSize: '0.7rem', padding: '2px 8px', color: '#ef4444' }}
                            onClick={() => setCustomInterestAmount(0)}
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Financing Surcharge / Admin Note</label>
                        <input
                          type="text"
                          className="form-input"
                          value={interestAdjustmentReason}
                          onChange={e => setInterestAdjustmentReason(e.target.value)}
                          placeholder="e.g. Pre-agreed installment surcharge, showroom financing fee"
                        />
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.4 }}>
                          💡 <strong>Monthly Addition:</strong> ৳{customInterestAmount.toLocaleString()} interest is evenly divided into {durationMonths} installments (<strong>+৳{financials.monthlyInterestPortion.toLocaleString()}/mo</strong> added to ৳{financials.monthlyPrincipalPortion.toLocaleString()}/mo principal).
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Option 2: Formula-based Percentage Rate */}
                {!isInterestFree && interestType === 'PERCENTAGE' && (
                  <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', marginTop: '0.75rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Interest Rate (%)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          className="form-input"
                          value={interestRatePercent}
                          onChange={e => setInterestRatePercent(Math.max(0, Number(e.target.value)))}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Calculation Method</label>
                        <select
                          className="form-select"
                          value={interestMethod}
                          onChange={e => setInterestMethod(e.target.value as any)}
                        >
                          <option value="FLAT">Flat Rate Calculation</option>
                          <option value="REDUCING_BALANCE">Reducing Balance (Amortized)</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Calculation Basis</label>
                        <select
                          className="form-select"
                          value={interestBasis}
                          onChange={e => setInterestBasis(e.target.value as any)}
                        >
                          <option value="TOTAL_FLAT">% on Financed Principal (Store Retail EMI)</option>
                          <option value="ANNUAL">% Per Annum (Annual Flat APR)</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                      <label className="form-label">Adjustment Reason (Optional)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={interestAdjustmentReason}
                        onChange={e => setInterestAdjustmentReason(e.target.value)}
                        placeholder="Reason for rate adjustment if overridden"
                      />
                    </div>
                  </div>
                )}

                    {/* Prominent Monthly Installment Interest Addition Banner */}
                    <div style={{
                      background: 'rgba(0, 140, 255, 0.08)',
                      border: '1px solid rgba(0, 140, 255, 0.25)',
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      marginTop: '0.85rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '0.75rem'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Financed Principal:</span>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--brand-primary)' }}>
                          ৳{financials.financedPrincipal.toLocaleString()}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          ৳{financials.monthlyPrincipalPortion.toLocaleString()} / mo principal
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Total Financing Interest:</span>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#f59e0b' }}>
                          +৳{financials.totalInterest.toLocaleString()}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 600 }}>
                          +৳{financials.monthlyInterestPortion.toLocaleString()} / mo interest added
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#10b981' }}>Total Monthly Installment:</span>
                        <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#10b981' }}>
                          ৳{financials.regularInstallmentAmount.toLocaleString()} / mo
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
                          Principal + Interest Combined
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Financed Repayment:</span>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                          ৳{financials.totalFinancedRepayment.toLocaleString()}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          Across {durationMonths} monthly installments
                        </span>
                      </div>
                    </div>
              </div>

              {/* Installment Tenure Presets & Dates */}
              <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--brand-primary)' }}>
                  Tenure, Due Dates & Grace Period
                </div>

                <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  {[3, 6, 9, 12, 18, 24].map(m => (
                    <button
                      key={m}
                      type="button"
                      className={`btn btn-xs ${durationMonths === m ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => {
                        setDurationMonths(m);
                        setIsCustomScheduleActive(false);
                      }}
                      style={{ fontWeight: durationMonths === m ? 800 : 500 }}
                    >
                      {m} Months
                    </button>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Custom Duration (Months)</label>
                    <input
                      type="number"
                      className="form-input"
                      min={1}
                      max={36}
                      value={durationMonths}
                      onChange={e => {
                        setDurationMonths(Math.max(1, Number(e.target.value)));
                        setIsCustomScheduleActive(false);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">First Installment Due Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={firstDueDate}
                      onChange={e => {
                        setFirstDueDate(e.target.value);
                        setIsCustomScheduleActive(false);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Recurring Due Day of Month</label>
                    <input
                      type="number"
                      className="form-input"
                      min={1}
                      max={28}
                      value={recurringDueDay}
                      onChange={e => {
                        setRecurringDueDay(Math.min(28, Math.max(1, Number(e.target.value))));
                        setIsCustomScheduleActive(false);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Grace Period (Days)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={gracePeriodDays}
                      onChange={e => setGracePeriodDays(Math.max(0, Number(e.target.value)))}
                    />
                  </div>
                </div>
              </div>

              {/* Interactive Repayment Schedule Table */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-card-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                      Repayment Schedule Table ({customSchedule.length} Installments)
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                      You may customize individual dates and amounts before finalizing.
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      type="button"
                      className="btn btn-xs btn-secondary"
                      onClick={handleAutoBalanceSchedule}
                      title="Adjust the final installment amount so the sum matches the exact contract obligation"
                    >
                      <RotateCcw size={12} /> Auto-Balance Final
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs btn-secondary"
                      onClick={handleResetEqualSchedule}
                    >
                      Reset Equal
                    </button>
                  </div>
                </div>

                {/* Reconciliation Alert Banner */}
                <div style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.8rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: scheduleReconciliation.isBalanced ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  color: scheduleReconciliation.isBalanced ? '#10b981' : '#ef4444',
                  fontWeight: 700,
                  borderBottom: '1px solid var(--border-color)'
                }}>
                  <span>
                    {scheduleReconciliation.isBalanced 
                      ? '✓ Schedule Perfectly Balanced with Contract Obligation' 
                      : `⚠ Schedule Discrepancy: Difference of ৳${scheduleReconciliation.difference.toLocaleString()}!`}
                  </span>
                  <span>
                    Sum of Installments: ৳{customSchedule.reduce((a, b) => a + Number(b.amount || 0), 0).toLocaleString()} / ৳{financials.totalFinancedRepayment.toLocaleString()}
                  </span>
                </div>

                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  <table className="erp-table" style={{ fontSize: '0.8rem', width: '100%' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '8%', textAlign: 'center' }}>#</th>
                        <th style={{ width: '22%' }}>Due Date</th>
                        <th style={{ width: '20%', textAlign: 'right' }}>Principal (৳)</th>
                        <th style={{ width: '22%', textAlign: 'right', color: '#f59e0b' }}>Interest Added (৳)</th>
                        <th style={{ width: '28%', textAlign: 'right' }}>Total Installment (৳)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customSchedule.map((inst, idx) => {
                        const reconciled = scheduleReconciliation.reconciledSchedule[idx];
                        const pPortion = reconciled?.principalPortion || inst.principalPortion || 0;
                        const iPortion = reconciled?.interestPortion || inst.interestPortion || 0;
                        return (
                          <tr key={inst.installmentNumber}>
                            <td style={{ textAlign: 'center', fontWeight: 700 }}>#{inst.installmentNumber}</td>
                            <td>
                              <input
                                type="date"
                                className="form-input form-input-xs"
                                value={inst.dueDate}
                                onChange={e => {
                                  setIsCustomScheduleActive(true);
                                  const newSched = [...customSchedule];
                                  newSched[idx].dueDate = e.target.value;
                                  setCustomSchedule(newSched);
                                }}
                                style={{ padding: '2px 6px', fontSize: '0.775rem' }}
                              />
                            </td>
                            <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600 }}>
                              ৳{pPortion.toLocaleString()}
                            </td>
                            <td style={{ textAlign: 'right', color: '#f59e0b', fontWeight: 600 }}>
                              {iPortion > 0 ? `+৳${iPortion.toLocaleString()}` : '৳0'}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <input
                                type="number"
                                className="form-input form-input-xs"
                                value={inst.amount}
                                onChange={e => {
                                  setIsCustomScheduleActive(true);
                                  const newSched = [...customSchedule];
                                  newSched[idx].amount = Math.max(0, Number(e.target.value));
                                  setCustomSchedule(newSched);
                                }}
                                style={{ textAlign: 'right', fontWeight: 700, padding: '2px 6px', fontSize: '0.825rem', color: '#10b981' }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveStep('financials')}
                >
                  Back to Pricing
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setActiveStep('clauses')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                >
                  Manage 25 Terms & Conditions <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: TERMS & CONDITIONS CLAUSE EDITOR */}
          {activeStep === 'clauses' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={18} color="var(--brand-primary)" />
                    Step 4: Contract Terms & Conditions Clause Management
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Standard 25 Hire-Purchase Clauses under Bangladesh Law. Reorder, edit, or append custom terms.
                  </span>
                </div>

                {/* Language Switcher */}
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Language:</span>
                  <button
                    type="button"
                    className={`btn btn-xs ${termsLanguage === 'EN' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setTermsLanguage('EN')}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    className={`btn btn-xs ${termsLanguage === 'BN' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setTermsLanguage('BN')}
                  >
                    বাংলা
                  </button>
                  <button
                    type="button"
                    className={`btn btn-xs ${termsLanguage === 'BOTH' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setTermsLanguage('BOTH')}
                  >
                    Dual (EN + BN)
                  </button>
                </div>
              </div>

              {/* Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', background: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {(['ALL', 'FINANCIAL', 'LEGAL', 'OPERATIONAL', 'SCHEDULE'] as const).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      className={`btn btn-xs ${clauseFilter === cat ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setClauseFilter(cat)}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    type="button"
                    className="btn btn-xs btn-secondary"
                    onClick={() => setShowAddClause(true)}
                  >
                    <Plus size={12} /> Add Custom Clause
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-secondary text-danger"
                    onClick={handleResetToDefaultClauses}
                  >
                    <RotateCcw size={12} /> Reset to Defaults
                  </button>
                </div>
              </div>

              {/* Add Custom Clause Drawer */}
              {showAddClause && (
                <div style={{ background: 'rgba(0, 140, 255, 0.08)', border: '1px dashed var(--brand-primary)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    + Add New Contractual Clause
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Clause Title in English *"
                      value={newClauseTitle}
                      onChange={e => setNewClauseTitle(e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="ধারার শিরোনাম বাংলায়"
                      value={newClauseTitleBn}
                      onChange={e => setNewClauseTitleBn(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="Clause terms in English... (Placeholders like {CUSTOMER_NAME}, {PRODUCT_NAME} supported)"
                      value={newClauseContent}
                      onChange={e => setNewClauseContent(e.target.value)}
                    />
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="ধারার শর্তাবলি বাংলায়..."
                      value={newClauseContentBn}
                      onChange={e => setNewClauseContentBn(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-xs"
                      onClick={() => setShowAddClause(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-xs"
                      onClick={handleAddCustomClause}
                    >
                      Add Clause
                    </button>
                  </div>
                </div>
              )}

              {/* Clauses List */}
              <div style={{ maxHeight: '450px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {clauses
                  .filter(c => clauseFilter === 'ALL' || c.category === clauseFilter)
                  .map((clause, idx) => {
                    const isEditing = editingClauseId === clause.id;
                    return (
                      <div
                        key={clause.id}
                        style={{
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '0.75rem 1rem',
                          background: 'var(--bg-card)',
                          transition: 'all 0.15s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--brand-primary)' }}>
                              Clause {clause.number}: {termsLanguage === 'BN' ? clause.titleBn : clause.title}
                            </span>
                            {clause.isMandatory ? (
                              <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>
                                <Lock size={10} /> Mandatory
                              </span>
                            ) : (
                              <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                                Optional
                              </span>
                            )}
                            <span className="badge" style={{ fontSize: '0.65rem', opacity: 0.7 }}>
                              {clause.category}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs"
                              disabled={idx === 0}
                              onClick={() => handleMoveClause(idx, 'UP')}
                              title="Move Clause Up"
                            >
                              <MoveUp size={13} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs"
                              disabled={idx === clauses.length - 1}
                              onClick={() => handleMoveClause(idx, 'DOWN')}
                              title="Move Clause Down"
                            >
                              <MoveDown size={13} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs"
                              onClick={() => setEditingClauseId(isEditing ? null : clause.id)}
                              title="Edit Clause Content"
                            >
                              {isEditing ? 'Done' : 'Edit'}
                            </button>
                            {!clause.isMandatory && (
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs text-danger"
                                onClick={() => handleDeleteClause(clause.id)}
                                title="Remove Clause"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Clause Content Body */}
                        {isEditing ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {(termsLanguage === 'EN' || termsLanguage === 'BOTH') && (
                              <div>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>English Content:</label>
                                <textarea
                                  className="form-textarea"
                                  rows={3}
                                  value={clause.content}
                                  onChange={e => {
                                    const text = e.target.value;
                                    setClauses(prev => prev.map(c => c.id === clause.id ? { ...c, content: text } : c));
                                  }}
                                  style={{ fontSize: '0.8rem', width: '100%' }}
                                />
                              </div>
                            )}
                            {(termsLanguage === 'BN' || termsLanguage === 'BOTH') && (
                              <div>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>বাংলা বিষয়বস্তু:</label>
                                <textarea
                                  className="form-textarea"
                                  rows={3}
                                  value={clause.contentBn}
                                  onChange={e => {
                                    const text = e.target.value;
                                    setClauses(prev => prev.map(c => c.id === clause.id ? { ...c, contentBn: text } : c));
                                  }}
                                  style={{ fontSize: '0.8rem', width: '100%' }}
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            {termsLanguage === 'BN' ? (
                              <p style={{ margin: 0 }}>{interpolateClauseText(clause.contentBn, interpolationContext)}</p>
                            ) : termsLanguage === 'BOTH' ? (
                              <div>
                                <p style={{ margin: 0, marginBottom: '4px' }}>{interpolateClauseText(clause.content, interpolationContext)}</p>
                                <p style={{ margin: 0, fontStyle: 'italic', opacity: 0.85 }}>{interpolateClauseText(clause.contentBn, interpolationContext)}</p>
                              </div>
                            ) : (
                              <p style={{ margin: 0 }}>{interpolateClauseText(clause.content, interpolationContext)}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveStep('schedule')}
                >
                  Back to Schedule
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setActiveStep('preview')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                >
                  Proceed to Agreement Preview <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: PREVIEW & CUSTOMER ACCEPTANCE */}
          {activeStep === 'preview' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={18} color="#10b981" />
                  Step 5: Complete Agreement Preview & Customer Affirmative Acceptance
                </h3>
              </div>

              {/* Live Contract Preview Box */}
              <div 
                style={{ 
                  background: '#ffffff', 
                  color: '#0f172a', 
                  borderRadius: '10px', 
                  padding: '1.5rem', 
                  border: '1px solid #cbd5e1', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  maxHeight: '420px',
                  overflowY: 'auto',
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  marginBottom: '1.25rem'
                }}
              >
                {/* Contract Header */}
                <div style={{ textAlign: 'center', borderBottom: '2px solid #008CFF', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#002B5B', margin: 0 }}>
                    {settings?.companyName || 'NEED ELECTRO'}
                  </h2>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                    Trusted Electrical and Technological Solutions • Moulvibazar, Bangladesh
                  </div>
                  <div style={{ display: 'inline-block', background: '#002B5B', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '2px 10px', borderRadius: '4px', marginTop: '6px' }}>
                    COMMERCIAL HIRE-PURCHASE & LAPTOP FINANCING AGREEMENT
                  </div>
                </div>

                {/* Contract Meta Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem', marginBottom: '1rem', background: '#F8FAFC', padding: '10px', borderRadius: '6px' }}>
                  <div>
                    <div><strong>Customer:</strong> {activeCustomer.name}</div>
                    <div><strong>Mobile:</strong> {activeCustomer.phone}</div>
                    <div><strong>National ID:</strong> {activeCustomer.nid}</div>
                    <div><strong>Guarantor:</strong> {guarantorName || 'N/A'} ({guarantorRelationship})</div>
                  </div>
                  <div>
                    <div><strong>Equipment:</strong> {currentProduct?.name}</div>
                    <div><strong>Serial Number:</strong> {selectedSerial || 'Pending Assignment'}</div>
                    <div><strong>Contract Price:</strong> ৳{financials.finalContractPrice.toLocaleString()}</div>
                    <div><strong>Down Payment:</strong> ৳{financials.downPaymentAmount.toLocaleString()} ({downPaymentStatus})</div>
                  </div>
                </div>

                {/* Financial Summary Strip */}
                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#EAF4FF', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#002B5B', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                  <span>Financed Principal: ৳{financials.financedPrincipal.toLocaleString()}</span>
                  <span>Interest: {isInterestFree ? '0% Free' : interestType === 'FIXED_AMOUNT' ? `৳${financials.totalInterest.toLocaleString()} Manual Fixed (${financials.effectiveAnnualRate}%)` : `${financials.effectiveAnnualRate}% (৳${financials.totalInterest.toLocaleString()})`}</span>
                  <span>Installments: {durationMonths} × ৳{financials.regularInstallmentAmount.toLocaleString()} {financials.totalInterest > 0 ? `(৳${financials.monthlyPrincipalPortion.toLocaleString()} P + ৳${financials.monthlyInterestPortion.toLocaleString()} I)` : ''}</span>
                  <span>Total Payable: ৳{financials.totalCustomerPayable.toLocaleString()}</span>
                </div>

                {/* 25 Clauses Rendered */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {clauses.map(c => (
                    <div key={c.id} style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                      <div style={{ fontWeight: 800, color: '#002B5B' }}>
                        {c.number}. {termsLanguage === 'BN' ? c.titleBn : c.title}
                      </div>
                      <div style={{ color: '#334155', textAlign: 'justify' }}>
                        {termsLanguage === 'BN' 
                          ? interpolateClauseText(c.contentBn, interpolationContext)
                          : interpolateClauseText(c.content, interpolationContext)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Signatures Placeholder */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed #cbd5e1', textAlign: 'center', fontSize: '0.75rem' }}>
                  <div>
                    <div style={{ borderBottom: '1px solid #000', marginBottom: '4px', height: '24px' }}></div>
                    <strong>{activeCustomer.name}</strong>
                    <div>Customer Signature</div>
                  </div>
                  <div>
                    <div style={{ borderBottom: '1px solid #000', marginBottom: '4px', height: '24px' }}></div>
                    <strong>{guarantorName || 'Guarantor'}</strong>
                    <div>Guarantor Signature</div>
                  </div>
                  <div>
                    <div style={{ borderBottom: '1px solid #000', marginBottom: '4px', height: '24px' }}></div>
                    <strong>{currentUser.name}</strong>
                    <div>For {settings?.companyName || 'NEED ELECTRO'}</div>
                  </div>
                </div>
              </div>

              {/* Affirmative Customer Confirmation Controls */}
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#10b981', marginBottom: '0.75rem' }}>
                  Mandatory Affirmative Customer Confirmation (সকল শর্তে স্পষ্ট সম্মতি আবশ্যক)
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.825rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={confirmedFinancials}
                      onChange={e => setConfirmedFinancials(e.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span>
                      Customer has reviewed and confirmed the agreed price (৳{financials.finalContractPrice.toLocaleString()}), down payment (৳{financials.downPaymentAmount.toLocaleString()}), and total payable amount.
                    </span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.825rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={confirmedSchedule}
                      onChange={e => setConfirmedSchedule(e.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span>
                      Customer has reviewed and accepted the {durationMonths}-month repayment schedule starting on {firstDueDate}.
                    </span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.825rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={confirmedTerms}
                      onChange={e => setConfirmedTerms(e.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span>
                      Customer has received and agreed to all 25 contractual terms & conditions without objection.
                    </span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.825rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={confirmedIdentity}
                      onChange={e => setConfirmedIdentity(e.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span>
                      Customer National ID ({activeCustomer.nid}) and guarantor particulars have been physically or digitally verified.
                    </span>
                  </label>
                </div>

                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Administrator Acceptance / Execution Notes</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Executed in presence of branch manager; original NID verified."
                    value={acceptanceNotes}
                    onChange={e => setAcceptanceNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveStep('clauses')}
                >
                  Back to Terms
                </button>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onCancel}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-success btn-lg"
                    disabled={
                      !confirmedFinancials || 
                      !confirmedSchedule || 
                      !confirmedTerms || 
                      !confirmedIdentity || 
                      !scheduleReconciliation.isBalanced ||
                      isSubmitting
                    }
                    onClick={handleExecuteContract}
                    style={{ fontWeight: 800, minWidth: '260px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <CheckCircle2 size={18} />
                    {isSubmitting ? 'Executing Contract...' : 'Execute EMI Contract & Bind Terms'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: STICKY REAL-TIME FINANCIAL SUMMARY PANEL    */}
        {/* ========================================================= */}
        <div 
          className="erp-card" 
          style={{ 
            padding: '1.25rem', 
            position: 'sticky', 
            top: '80px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <Calculator size={18} color="var(--brand-primary)" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>
              Live Financial Calculation Summary
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>1. Original Product Price:</span>
              <strong>৳{financials.originalPrice.toLocaleString()}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
              <span>2. Commercial Discount:</span>
              <span>-৳{financials.discountAmount.toLocaleString()} ({discountType === 'PERCENTAGE' ? `${discountValue}%` : 'Fixed'})</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
              <span>3. Agreed Selling Price:</span>
              <span>৳{financials.sellingPriceAfterDiscount.toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>4. Additional Charges:</span>
              <span>+৳{financials.additionalChargesTotal.toLocaleString()}</span>
            </div>
            {(processingFee > 0 || documentationFee > 0 || deliveryCharge > 0) && (
              <div style={{ paddingLeft: '8px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {processingFee > 0 && <div>• Processing Fee: ৳{processingFee.toLocaleString()}</div>}
                {documentationFee > 0 && <div>• Documentation: ৳{documentationFee.toLocaleString()}</div>}
                {deliveryCharge > 0 && <div>• Delivery: ৳{deliveryCharge.toLocaleString()}</div>}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>5. Applicable Taxes (VAT):</span>
              <span>+৳{financials.taxAmount.toLocaleString()} ({taxPercent}%)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '6px', fontWeight: 700, fontSize: '0.85rem' }}>
              <span>Final Contract Price:</span>
              <span>৳{financials.finalContractPrice.toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 700 }}>
              <span>6. Down Payment:</span>
              <span>-৳{financials.downPaymentAmount.toLocaleString()} ({downPaymentType === 'PERCENTAGE' ? `${downPaymentValue}%` : 'Fixed'})</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--brand-primary)', fontWeight: 800 }}>
              <span>7. Financed Principal:</span>
              <span>৳{financials.financedPrincipal.toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>8. Interest Mode:</span>
              <span className={`badge ${isInterestFree ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: '0.675rem' }}>
                {isInterestFree ? '0% Free' : interestType === 'FIXED_AMOUNT' ? `৳${financials.totalInterest.toLocaleString()} Manual (${financials.effectiveAnnualRate}%)` : `${financials.effectiveAnnualRate}% (${interestMethod})`}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>9. Total Financing Interest:</span>
              <strong style={{ color: financials.totalInterest > 0 ? '#f59e0b' : 'inherit' }}>
                {financials.totalInterest > 0 ? `+৳${financials.totalInterest.toLocaleString()}` : '৳0'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '6px', fontWeight: 700 }}>
              <span>10. Scheduled Repayment:</span>
              <span style={{ color: 'var(--brand-primary)' }}>৳{financials.totalFinancedRepayment.toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>11. Tenure in Months:</span>
              <strong>{durationMonths} Months</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>12. Regular Installment:</span>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ color: '#10b981', fontSize: '0.95rem' }}>
                  ৳{financials.regularInstallmentAmount.toLocaleString()} / mo
                </strong>
                {financials.totalInterest > 0 && (
                  <div style={{ fontSize: '0.7rem', color: '#f59e0b' }}>
                    (Principal: ৳{financials.monthlyPrincipalPortion.toLocaleString()} + Interest: ৳{financials.monthlyInterestPortion.toLocaleString()})
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>13. Final Reconciling Installment:</span>
              <strong>৳{financials.finalInstallmentAmount.toLocaleString()}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0, 140, 255, 0.08)', padding: '6px 8px', borderRadius: '6px', fontWeight: 800 }}>
              <span>14. Total Customer Payable:</span>
              <span style={{ color: 'var(--brand-primary)' }}>৳{financials.totalCustomerPayable.toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
              <span>15. Collected at Counter (DP):</span>
              <span>৳{(downPaymentStatus === 'PAID' ? financials.downPaymentAmount : 0).toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444', fontWeight: 700 }}>
              <span>16. Remaining Receivable:</span>
              <span>৳{(financials.totalCustomerPayable - (downPaymentStatus === 'PAID' ? financials.downPaymentAmount : 0)).toLocaleString()}</span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '6px', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              <div>• 1st Due: {firstDueDate}</div>
              <div>• Maturity: {customSchedule[customSchedule.length - 1]?.dueDate || 'Maturity Date'}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
