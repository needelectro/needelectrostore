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
  interestBasis?: 'TOTAL_FLAT' | 'ANNUAL';
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
  monthlyPrincipalPortion: number;
  monthlyInterestPortion: number;
  finalPrincipalPortion: number;
  finalInterestPortion: number;
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
 * Interest is explicitly calculated and added into each monthly installment.
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
      if (params.interestBasis === 'ANNUAL') {
        // Annual Flat APR: Principal * (Rate / 100) * (Months / 12)
        totalInterest = Math.round((financedPrincipal * rate * (durationMonths / 12)) / 100);
      } else {
        // Total Tenure Flat %: Principal * (Rate / 100) directly
        totalInterest = Math.round((financedPrincipal * rate) / 100);
      }
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

  // 8. Total scheduled repayment (Financed Principal + Total Interest)
  const totalFinancedRepayment = financedPrincipal + totalInterest;
  const totalCustomerPayable = downPaymentAmount + totalFinancedRepayment;

  // 9. Monthly Installment Breakdown (Interest added to monthly installment)
  const basePrincipal = durationMonths > 0 ? Math.floor(financedPrincipal / durationMonths) : 0;
  const finalPrincipal = financedPrincipal - (basePrincipal * (durationMonths - 1));

  const baseInterest = durationMonths > 0 ? Math.floor(totalInterest / durationMonths) : 0;
  const finalInterest = totalInterest - (baseInterest * (durationMonths - 1));

  const regularInstallmentAmount = basePrincipal + baseInterest;
  const finalInstallmentAmount = finalPrincipal + finalInterest;

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
    monthlyPrincipalPortion: basePrincipal,
    monthlyInterestPortion: baseInterest,
    finalPrincipalPortion: finalPrincipal,
    finalInterestPortion: finalInterest,
    effectiveAnnualRate: params.isInterestFree ? 0 : Number(params.interestRatePercent || 0),
  };
}

/**
 * Generate a dynamic repayment schedule with verified due dates and balanced amounts.
 * Interest is explicitly calculated and added into each monthly installment.
 */
export function generateRepaymentSchedule(
  durationMonths: number,
  totalRepayment: number,
  firstDueDateStr?: string,
  recurringDueDay?: number,
  financedPrincipal?: number,
  totalInterest?: number,
  interestMethod: 'FLAT' | 'REDUCING_BALANCE' = 'FLAT',
  annualRate: number = 0
): GeneratedScheduleItem[] {
  const months = Math.max(1, Math.round(durationMonths || 1));
  const total = Math.max(0, Math.round(totalRepayment || 0));
  const principal = Math.max(0, Math.round(financedPrincipal !== undefined ? financedPrincipal : total));
  const interest = Math.max(0, Math.round(totalInterest !== undefined ? totalInterest : (total - principal)));

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

  if (interestMethod === 'REDUCING_BALANCE' && annualRate > 0 && interest > 0) {
    const monthlyRate = (annualRate / 100) / 12;
    const factor = Math.pow(1 + monthlyRate, months);
    const emi = Math.round((principal * monthlyRate * factor) / (factor - 1));
    let remPrincipal = principal;
    let remTotal = total;

    for (let i = 1; i <= months; i++) {
      const instDate = new Date(baseDate);
      instDate.setMonth(baseDate.getMonth() + (i - 1));
      const maxDays = new Date(instDate.getFullYear(), instDate.getMonth() + 1, 0).getDate();
      instDate.setDate(Math.min(targetDay, maxDays));

      let monthInterest = Math.round(remPrincipal * monthlyRate);
      let monthPrincipal = emi - monthInterest;

      if (i === months) {
        monthPrincipal = remPrincipal;
        monthInterest = Math.max(0, remTotal - monthPrincipal);
      }

      const installmentAmount = monthPrincipal + monthInterest;
      remPrincipal = Math.max(0, remPrincipal - monthPrincipal);
      remTotal = Math.max(0, remTotal - installmentAmount);

      schedule.push({
        installmentNumber: i,
        dueDate: instDate.toISOString().split('T')[0],
        amount: installmentAmount,
        principalPortion: monthPrincipal,
        interestPortion: monthInterest,
        remainingBalanceAfter: remTotal,
        status: 'UPCOMING',
      });
    }
  } else {
    // Flat Rate or 0% interest: interest is evenly distributed into each monthly installment
    const basePrincipal = Math.floor(principal / months);
    const finalPrincipal = principal - (basePrincipal * (months - 1));

    const baseInterest = Math.floor(interest / months);
    const finalInterest = interest - (baseInterest * (months - 1));

    let remTotal = total;

    for (let i = 1; i <= months; i++) {
      const instDate = new Date(baseDate);
      instDate.setMonth(baseDate.getMonth() + (i - 1));
      const maxDays = new Date(instDate.getFullYear(), instDate.getMonth() + 1, 0).getDate();
      instDate.setDate(Math.min(targetDay, maxDays));

      const pPortion = i === months ? finalPrincipal : basePrincipal;
      const iPortion = i === months ? finalInterest : baseInterest;
      const amount = pPortion + iPortion;

      remTotal = Math.max(0, remTotal - amount);

      schedule.push({
        installmentNumber: i,
        dueDate: instDate.toISOString().split('T')[0],
        amount,
        principalPortion: pPortion,
        interestPortion: iPortion,
        remainingBalanceAfter: remTotal,
        status: 'UPCOMING',
      });
    }
  }

  return schedule;
}

/**
 * Reconcile a manually adjusted repayment schedule so the sum matches contract obligations.
 */
export function reconcileSchedule(
  schedule: { installmentNumber: number; dueDate: string; amount: number; principalPortion?: number; interestPortion?: number; notes?: string }[],
  targetTotal: number,
  targetPrincipal: number = 0,
  targetInterest: number = 0
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

    const interestRatio = targetTotal > 0 ? (targetInterest / targetTotal) : 0;
    const estInterest = Math.round(amt * interestRatio);
    const estPrincipal = amt - estInterest;

    return {
      installmentNumber: item.installmentNumber,
      dueDate: item.dueDate,
      amount: amt,
      principalPortion: item.principalPortion !== undefined ? item.principalPortion : estPrincipal,
      interestPortion: item.interestPortion !== undefined ? item.interestPortion : estInterest,
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
