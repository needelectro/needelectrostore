// NEED ELECTRO ERP — Advanced EMI Financial Calculation & Schedule Engine
// Uses exact integer-rounded monetary arithmetic in BDT (৳)

export interface FinancialCalculationParams {
  originalPrice: number;
  agreedPrice?: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  processingFee: number;
  documentationFee: number;
  deliveryCharge: number;
  otherCharges: number;
  taxPercent: number;
  downPaymentType: 'PERCENTAGE' | 'FIXED';
  downPaymentValue: number;
  isInterestFree: boolean;
  interestRatePercent: number;
  interestMethod: 'FLAT' | 'REDUCING_BALANCE';
  durationMonths: number;
  firstDueDate?: string;
  recurringDueDay?: number;
}

export interface FinancialCalculationResult {
  originalPrice: number;
  agreedPrice: number;
  discountAmount: number;
  sellingPriceAfterDiscount: number;
  additionalChargesTotal: number;
  taxableAmount: number;
  taxAmount: number;
  finalContractPrice: number;
  downPaymentAmount: number;
  financedPrincipal: number;
  totalInterest: number;
  totalFinancedRepayment: number;
  totalCustomerPayable: number;
  regularInstallmentAmount: number;
  finalInstallmentAmount: number;
  effectiveAnnualRate: number;
}

export interface GeneratedScheduleItem {
  installmentNumber: number;
  dueDate: string;
  amount: number;
  principalPortion: number;
  interestPortion: number;
  remainingBalanceAfter: number;
  status: 'UPCOMING';
}

/**
 * Perform exact financial calculations for an EMI contract.
 */
export function calculateEMIFinancials(params: FinancialCalculationParams): FinancialCalculationResult {
  const originalPrice = Math.max(0, Math.round(Number(params.originalPrice) || 0));
  const agreedPrice = Math.max(0, Math.round(Number(params.agreedPrice !== undefined ? params.agreedPrice : originalPrice) || 0));

  // 1. Discount calculation
  let discountAmount = 0;
  if (params.discountType === 'PERCENTAGE') {
    const pct = Math.min(100, Math.max(0, Number(params.discountValue) || 0));
    discountAmount = Math.round((agreedPrice * pct) / 100);
  } else {
    discountAmount = Math.min(agreedPrice, Math.max(0, Math.round(Number(params.discountValue) || 0)));
  }

  const sellingPriceAfterDiscount = Math.max(0, agreedPrice - discountAmount);

  // 2. Additional charges
  const processingFee = Math.max(0, Math.round(Number(params.processingFee) || 0));
  const documentationFee = Math.max(0, Math.round(Number(params.documentationFee) || 0));
  const deliveryCharge = Math.max(0, Math.round(Number(params.deliveryCharge) || 0));
  const otherCharges = Math.max(0, Math.round(Number(params.otherCharges) || 0));
  const additionalChargesTotal = processingFee + documentationFee + deliveryCharge + otherCharges;

  // 3. Tax / VAT
  const taxableAmount = sellingPriceAfterDiscount;
  const taxPercent = Math.min(100, Math.max(0, Number(params.taxPercent) || 0));
  const taxAmount = taxPercent > 0 ? Math.round((taxableAmount * taxPercent) / 100) : 0;

  // 4. Final Contract Price before financing charges
  const finalContractPrice = sellingPriceAfterDiscount + taxAmount + additionalChargesTotal;

  // 5. Down payment
  let downPaymentAmount = 0;
  if (params.downPaymentType === 'PERCENTAGE') {
    const dpPct = Math.min(100, Math.max(0, Number(params.downPaymentValue) || 0));
    downPaymentAmount = Math.round((finalContractPrice * dpPct) / 100);
  } else {
    downPaymentAmount = Math.min(finalContractPrice, Math.max(0, Math.round(Number(params.downPaymentValue) || 0)));
  }

  // 6. Financed Principal
  const financedPrincipal = Math.max(0, finalContractPrice - downPaymentAmount);

  // 7. Interest calculation
  const durationMonths = Math.max(1, Math.round(Number(params.durationMonths) || 1));
  let totalInterest = 0;

  if (!params.isInterestFree && financedPrincipal > 0) {
    const rate = Math.max(0, Number(params.interestRatePercent) || 0);

    if (params.interestMethod === 'FLAT') {
      // Flat Rate: Interest = Principal * (Rate / 100) * (Months / 12)
      totalInterest = Math.round((financedPrincipal * rate * (durationMonths / 12)) / 100);
    } else {
      // Reducing Balance Method (standard monthly amortization formula)
      const monthlyRate = rate > 0 ? (rate / 100) / 12 : 0;
      if (monthlyRate > 0) {
        const factor = Math.pow(1 + monthlyRate, durationMonths);
        const emi = (financedPrincipal * monthlyRate * factor) / (factor - 1);
        const totalPayableAmortized = Math.round(emi * durationMonths);
        totalInterest = Math.max(0, totalPayableAmortized - financedPrincipal);
      } else {
        totalInterest = 0;
      }
    }
  }

  // 8. Total scheduled repayment
  const totalFinancedRepayment = financedPrincipal + totalInterest;
  const totalCustomerPayable = downPaymentAmount + totalFinancedRepayment;

  // 9. Installment breakdown
  const baseMonthly = durationMonths > 0 ? Math.floor(totalFinancedRepayment / durationMonths) : 0;
  const regularInstallmentAmount = baseMonthly;
  // Reconcile final installment so exact sum of all installments equals totalFinancedRepayment
  const totalRegularExceptFinal = baseMonthly * (durationMonths - 1);
  const finalInstallmentAmount = Math.max(0, totalFinancedRepayment - totalRegularExceptFinal);

  return {
    originalPrice,
    agreedPrice,
    discountAmount,
    sellingPriceAfterDiscount,
    additionalChargesTotal,
    taxableAmount,
    taxAmount,
    finalContractPrice,
    downPaymentAmount,
    financedPrincipal,
    totalInterest,
    totalFinancedRepayment,
    totalCustomerPayable,
    regularInstallmentAmount,
    finalInstallmentAmount,
    effectiveAnnualRate: params.isInterestFree ? 0 : Number(params.interestRatePercent || 0),
  };
}

/**
 * Generate a dynamic repayment schedule with verified due dates and balanced amounts.
 */
export function generateRepaymentSchedule(
  durationMonths: number,
  totalRepayment: number,
  firstDueDateStr?: string,
  recurringDueDay?: number
): GeneratedScheduleItem[] {
  const months = Math.max(1, Math.round(durationMonths || 1));
  const total = Math.max(0, Math.round(totalRepayment || 0));

  const baseAmount = Math.floor(total / months);
  const finalAmount = total - (baseAmount * (months - 1));

  // Determine starting date
  let baseDate: Date;
  if (firstDueDateStr && !isNaN(new Date(firstDueDateStr).getTime())) {
    baseDate = new Date(firstDueDateStr);
  } else {
    baseDate = new Date();
    baseDate.setMonth(baseDate.getMonth() + 1);
    if (recurringDueDay && recurringDueDay >= 1 && recurringDueDay <= 28) {
      baseDate.setDate(recurringDueDay);
    }
  }

  const targetDay = recurringDueDay || baseDate.getDate();
  const schedule: GeneratedScheduleItem[] = [];
  let remaining = total;

  for (let i = 1; i <= months; i++) {
    const instDate = new Date(baseDate);
    instDate.setMonth(baseDate.getMonth() + (i - 1));

    // Handle month-end overflows safely (e.g. Feb 30 -> Feb 28)
    const maxDays = new Date(instDate.getFullYear(), instDate.getMonth() + 1, 0).getDate();
    const clampedDay = Math.min(targetDay, maxDays);
    instDate.setDate(clampedDay);

    const amount = i === months ? finalAmount : baseAmount;
    remaining = Math.max(0, remaining - amount);

    schedule.push({
      installmentNumber: i,
      dueDate: instDate.toISOString().split('T')[0],
      amount,
      principalPortion: amount,
      interestPortion: 0,
      remainingBalanceAfter: remaining,
      status: 'UPCOMING',
    });
  }

  return schedule;
}

/**
 * Reconcile a manually adjusted repayment schedule so the sum matches contract obligations.
 */
export function reconcileSchedule(
  schedule: { installmentNumber: number; dueDate: string; amount: number; notes?: string }[],
  targetTotal: number
): {
  reconciledSchedule: GeneratedScheduleItem[];
  difference: number;
  isBalanced: boolean;
} {
  const currentSum = schedule.reduce((sum, item) => sum + (Math.round(Number(item.amount) || 0)), 0);
  const difference = targetTotal - currentSum;

  let runningBalance = targetTotal;
  const reconciledSchedule: GeneratedScheduleItem[] = schedule.map((item) => {
    const amt = Math.round(Number(item.amount) || 0);
    runningBalance = Math.max(0, runningBalance - amt);
    return {
      installmentNumber: item.installmentNumber,
      dueDate: item.dueDate,
      amount: amt,
      principalPortion: amt,
      interestPortion: 0,
      remainingBalanceAfter: runningBalance,
      status: 'UPCOMING',
    };
  });

  return {
    reconciledSchedule,
    difference,
    isBalanced: difference === 0,
  };
}
