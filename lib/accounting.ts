// NEED ELECTRO ERP — Central Accounting & Financial Ledger Synchronization Engine
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type TransactionDirection = 'INFLOW' | 'OUTFLOW';

export interface RecordMovementOptions {
  accountId?: string | null;
  paymentMethod?: string | null;
  referenceType: string;
  referenceNumber: string;
  amount: number;
  direction: TransactionDirection;
  description: string;
  performedBy?: string | null;
  relatedTransactionId?: string | null;
  date?: Date;
}

/**
 * Resolves a financial account by explicit ID or payment method string.
 * Defaults to Main Cash ('acc-1') if no match is found.
 */
export async function resolveAccount(
  tx: Prisma.TransactionClient,
  accountId?: string | null,
  paymentMethod?: string | null
) {
  if (accountId) {
    const acc = await tx.financialAccount.findUnique({ where: { id: accountId } });
    if (acc) return acc;
  }

  const method = (paymentMethod || 'cash').toLowerCase().trim();
  const allAccounts = await tx.financialAccount.findMany({ where: { isActive: true } });

  if (method.includes('bkash')) {
    const bkashAcc = allAccounts.find(a => a.id.includes('bkash') || a.name.toLowerCase().includes('bkash'));
    if (bkashAcc) return bkashAcc;
  }

  if (method.includes('nagad')) {
    const nagadAcc = allAccounts.find(a => a.id.includes('nagad') || a.name.toLowerCase().includes('nagad'));
    if (nagadAcc) return nagadAcc;
  }

  if (method.includes('bank') || method.includes('card') || method.includes('cheque') || method.includes('ebl') || method.includes('pubali')) {
    const bankAcc = allAccounts.find(a => a.type === 'BANK');
    if (bankAcc) return bankAcc;
  }

  // Default to Main Cash Drawer
  const mainCash = allAccounts.find(a => a.id === 'acc-1' || a.type === 'CASH');
  return mainCash || allAccounts[0] || null;
}

/**
 * Records a financial movement in the central account ledger and updates the account balance.
 * Returns the created LedgerEntry and the updated account.
 */
export async function recordAccountMovement(
  tx: Prisma.TransactionClient,
  options: RecordMovementOptions
) {
  const amount = Number(options.amount);
  if (isNaN(amount) || amount <= 0) {
    throw new Error(`Movement amount must be greater than 0. Received: ${options.amount}`);
  }

  const account = await resolveAccount(tx, options.accountId, options.paymentMethod);
  if (!account) {
    throw new Error('No active financial account available to record financial movement.');
  }

  const isDebit = options.direction === 'INFLOW';
  const debitAmount = isDebit ? new Prisma.Decimal(amount) : new Prisma.Decimal(0);
  const creditAmount = isDebit ? new Prisma.Decimal(0) : new Prisma.Decimal(amount);

  // Update Account Balance
  const updatedAccount = await tx.financialAccount.update({
    where: { id: account.id },
    data: {
      balance: {
        [isDebit ? 'increment' : 'decrement']: new Prisma.Decimal(amount),
      },
    },
  });

  const entryId = 'led-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

  const entry = await tx.ledgerEntry.create({
    data: {
      id: entryId,
      date: options.date || new Date(),
      partyType: 'ACCOUNT',
      partyId: account.id,
      referenceType: options.referenceType,
      referenceNumber: options.referenceNumber,
      description: options.description,
      debit: debitAmount,
      credit: creditAmount,
      runningBalance: updatedAccount.balance,
      status: 'COMPLETED',
      paymentMethod: options.paymentMethod || (account.type === 'CASH' ? 'Cash' : account.type),
      performedBy: options.performedBy || 'System',
      relatedTransactionId: options.relatedTransactionId || null,
    },
  });

  return { entry, account: updatedAccount };
}

/**
 * Reverses all financial effects of a given transaction reference in the Central Account Ledger.
 * Ensures the original transaction is counteracted, never leaves orphaned cash entries,
 * and maintains full mathematical correctness and audit trail.
 */
export async function reverseTransaction(
  tx: Prisma.TransactionClient,
  {
    referenceNumber,
    reason,
    performedBy,
  }: {
    referenceNumber: string;
    reason: string;
    performedBy: string;
  }
) {
  // Find all active ledger entries for this referenceNumber
  const entries = await tx.ledgerEntry.findMany({
    where: {
      referenceNumber,
      status: 'COMPLETED',
    },
  });

  const reversals = [];

  for (const entry of entries) {
    // 1. Mark original entry as REVERSED
    await tx.ledgerEntry.update({
      where: { id: entry.id },
      data: {
        status: 'REVERSED',
        updatedAt: new Date(),
      },
    });

    // 2. If it affected a Financial Account, counteract its effect
    if (entry.partyType === 'ACCOUNT') {
      const prevDebit = Number(entry.debit);
      const prevCredit = Number(entry.credit);

      let updatedAccount = null;

      if (prevDebit > 0) {
        // Original was an INFLOW (Debit). Reversal is an OUTFLOW (Credit).
        updatedAccount = await tx.financialAccount.update({
          where: { id: entry.partyId },
          data: {
            balance: { decrement: new Prisma.Decimal(prevDebit) },
          },
        });

        const revEntry = await tx.ledgerEntry.create({
          data: {
            id: 'led-rev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            date: new Date(),
            partyType: 'ACCOUNT',
            partyId: entry.partyId,
            referenceType: `${entry.referenceType}_REVERSAL`,
            referenceNumber: `REV-${entry.referenceNumber}`,
            description: `Reversal of ${entry.referenceType} [${entry.referenceNumber}]: ${reason}`,
            debit: new Prisma.Decimal(0),
            credit: new Prisma.Decimal(prevDebit),
            runningBalance: updatedAccount.balance,
            status: 'COMPLETED',
            reversalOfId: entry.id,
            relatedTransactionId: entry.referenceNumber,
            paymentMethod: entry.paymentMethod,
            performedBy,
          },
        });
        reversals.push(revEntry);
      } else if (prevCredit > 0) {
        // Original was an OUTFLOW (Credit). Reversal is an INFLOW (Debit).
        updatedAccount = await tx.financialAccount.update({
          where: { id: entry.partyId },
          data: {
            balance: { increment: new Prisma.Decimal(prevCredit) },
          },
        });

        const revEntry = await tx.ledgerEntry.create({
          data: {
            id: 'led-rev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            date: new Date(),
            partyType: 'ACCOUNT',
            partyId: entry.partyId,
            referenceType: `${entry.referenceType}_REVERSAL`,
            referenceNumber: `REV-${entry.referenceNumber}`,
            description: `Reversal of ${entry.referenceType} [${entry.referenceNumber}]: ${reason}`,
            debit: new Prisma.Decimal(prevCredit),
            credit: new Prisma.Decimal(0),
            runningBalance: updatedAccount.balance,
            status: 'COMPLETED',
            reversalOfId: entry.id,
            relatedTransactionId: entry.referenceNumber,
            paymentMethod: entry.paymentMethod,
            performedBy,
          },
        });
        reversals.push(revEntry);
      }
    } else if (entry.partyType === 'CUSTOMER') {
      // Counteract Customer balance change
      const prevDebit = Number(entry.debit);
      const prevCredit = Number(entry.credit);

      if (prevDebit > 0) {
        // Customer was charged (Due created). Revert by decrementing customer balance.
        await tx.customer.update({
          where: { id: entry.partyId },
          data: {
            currentBalance: { decrement: new Prisma.Decimal(prevDebit) },
          },
        });
      } else if (prevCredit > 0) {
        // Customer had paid due. Revert by incrementing customer balance.
        await tx.customer.update({
          where: { id: entry.partyId },
          data: {
            currentBalance: { increment: new Prisma.Decimal(prevCredit) },
          },
        });
      }
    } else if (entry.partyType === 'SUPPLIER') {
      // Counteract Supplier payable change
      const prevDebit = Number(entry.debit);
      const prevCredit = Number(entry.credit);

      if (prevCredit > 0) {
        // Supplier payable was increased. Revert by decrementing.
        await tx.supplier.update({
          where: { id: entry.partyId },
          data: {
            currentPayable: { decrement: new Prisma.Decimal(prevCredit) },
          },
        });
      } else if (prevDebit > 0) {
        // Supplier payment had reduced payable. Revert by incrementing payable.
        await tx.supplier.update({
          where: { id: entry.partyId },
          data: {
            currentPayable: { increment: new Prisma.Decimal(prevDebit) },
          },
        });
      }
    }
  }

  return reversals;
}

/**
 * Calculates current balance for all active accounts from the Central Account Ledger.
 * Implements Requirement 15:
 * Current Balance = Opening Balance + Total Money In - Total Money Out + Transfers In - Transfers Out + Valid Adjustments
 */
export async function calculateAccountBalancesFromLedger() {
  const accounts = await prisma.financialAccount.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  const accountStats = await Promise.all(
    accounts.map(async (acc) => {
      // Sum all completed and reversed debits and credits for this account
      // Reversed entries must be included because their corresponding reversal entries
      // counteract them symmetrically in double-entry ledger bookkeeping.
      const agg = await prisma.ledgerEntry.aggregate({
        where: {
          partyType: 'ACCOUNT',
          partyId: acc.id,
          status: { in: ['COMPLETED', 'REVERSED'] },
        },
        _sum: {
          debit: true,
          credit: true,
        },
      });

      const totalIn = Number(agg._sum.debit || 0);
      const totalOut = Number(agg._sum.credit || 0);
      const ledgerBalance = totalIn - totalOut;

      return {
        id: acc.id,
        name: acc.name,
        type: acc.type,
        accountNumber: acc.accountNumber,
        bankName: acc.bankName,
        branchName: acc.branchName,
        currency: acc.currency,
        storedBalance: Number(acc.balance),
        ledgerBalance,
        totalIn,
        totalOut,
      };
    })
  );

  return accountStats;
}

/**
 * Synchronizes the stored balance in `financial_accounts` with the true balance calculated from the ledger.
 */
export async function syncStoredBalancesWithLedger(tx?: Prisma.TransactionClient) {
  const db = tx || prisma;
  const accounts = await db.financialAccount.findMany({ where: { isActive: true } });

  for (const acc of accounts) {
    const agg = await db.ledgerEntry.aggregate({
      where: {
        partyType: 'ACCOUNT',
        partyId: acc.id,
        status: { in: ['COMPLETED', 'REVERSED'] },
      },
      _sum: {
        debit: true,
        credit: true,
      },
    });

    const trueBalance = Number(agg._sum.debit || 0) - Number(agg._sum.credit || 0);

    if (Number(acc.balance) !== trueBalance) {
      await db.financialAccount.update({
        where: { id: acc.id },
        data: {
          balance: new Prisma.Decimal(trueBalance),
        },
      });
    }
  }
}
