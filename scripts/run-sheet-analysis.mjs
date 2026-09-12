// Deep analytical script for Google Sheet data
import fs from 'fs';
import path from 'path';

function parseCsv(content) {
  const lines = content.split('\r\n').join('\n').split('\n');
  return lines.map(line => {
    const row = [];
    let inQuotes = false;
    let current = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    return row;
  });
}

function cleanNum(val) {
  if (!val) return 0;
  const cleaned = val.replace(/,/g, '').replace(/৳/g, '').replace(/"/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

async function runAnalysis() {
  const dir = path.resolve('scripts/sheet_data');

  console.log('=== NEED ELECTRO PERSONAL GOOGLE SHEET FULL ANALYSIS ===\n');

  // 1. Final Calculate
  const finalCalcRaw = fs.readFileSync(path.join(dir, 'Final_Calculate.csv'), 'utf-8');
  const finalCalc = parseCsv(finalCalcRaw);
  console.log('--- 1. FINAL BALANCE SHEET & EQUITY STRUCTURE ---');
  let stockTotal = 0;
  let stockItems = 0;
  for (let i = 1; i <= 43; i++) {
    const row = finalCalc[i];
    if (row && row[8] && cleanNum(row[8]) > 0) {
      stockTotal += cleanNum(row[8]);
      stockItems += cleanNum(row[6]);
    }
  }
  console.log(`Stock Valuation: ৳${stockTotal.toLocaleString('en-IN')} across ${stockItems} units`);

  let fixedAssetsTotal = 0;
  for (let i = 47; i <= 60; i++) {
    const row = finalCalc[i];
    if (row && row[2] && cleanNum(row[2]) > 0) {
      fixedAssetsTotal += cleanNum(row[2]);
    }
  }
  console.log(`Fixed Assets Valuation: ৳${fixedAssetsTotal.toLocaleString('en-IN')}`);

  // Partner equity
  console.log('\nPartner Capital Distribution:');
  console.log('Amdad:  Invested ৳80,000 (40%),  Remaining: ৳58,000, Loss Absorbed: ৳22,000');
  console.log('Kohes:  Invested ৳70,000 (35%),  Remaining: ৳50,750, Loss Absorbed: ৳19,250');
  console.log('Khalad: Invested ৳50,000 (25%),  Remaining: ৳36,250, Loss Absorbed: ৳13,750');
  console.log('Founders Total: ৳2,00,000, Remaining: ৳1,45,000, Total Loss: ৳55,000');
  console.log('External Investor: ৳20,000');
  console.log('Total Capital Pool: ৳2,20,000');
  console.log('Customer Dues Outstanding: ৳24,450');

  // 2. Expense & Invest
  const expRaw = fs.readFileSync(path.join(dir, 'Expense_-_Invest.csv'), 'utf-8');
  const expRows = parseCsv(expRaw);
  console.log('\n--- 2. INVESTMENTS & CASH LIQUIDITY ---');
  console.log(`Recorded In-Cash in Sheet: ৳${cleanNum(expRows[0][1]).toLocaleString('en-IN')}`);
  console.log('Recorded Investments:');
  console.log('- Amdadur: ৳80,000');
  console.log('- Kohes:   ৳1,00,000');
  console.log('- Khaled:  ৳35,000');
  console.log('- Jisan:   ৳20,000 + ৳18,000 = ৳38,000');
  console.log('- Saleh:   ৳20,000');
  console.log('Total Working Capital Invested: ৳2,73,000');

  // 3. Sales Report Analysis
  const salesRaw = fs.readFileSync(path.join(dir, 'Sales_Report.csv'), 'utf-8');
  const salesRows = parseCsv(salesRaw);
  console.log('\n--- 3. SALES, REVENUE & PROFIT ANALYSIS ---');
  let totalSell = 0;
  let totalCost = 0;
  let totalProfit = 0;
  let totalDue = 0;
  let saleCount = 0;

  for (let i = 3; i < salesRows.length; i++) {
    const row = salesRows[i];
    if (!row || !row[0] || row[0] === 'Total' || row[0].includes('Total') || row[0] === 'May' || row[0] === 'June' || row[0] === 'July' || row[0] === 'August' || row[0] === 'September') continue;
    const sell = cleanNum(row[4]);
    const buy = cleanNum(row[5]);
    const profit = cleanNum(row[6]);
    const due = cleanNum(row[9]);

    if (sell > 0 || buy > 0 || profit !== 0) {
      saleCount++;
      totalSell += sell;
      totalCost += buy;
      totalProfit += profit;
      totalDue += due;
    }
  }

  console.log(`Valid Sales Transactions: ${saleCount}`);
  console.log(`Total Sales Invoiced: ৳${totalSell.toLocaleString('en-IN')}`);
  console.log(`Total Product Cost (COGS): ৳${totalCost.toLocaleString('en-IN')}`);
  console.log(`Gross Profit on Sales: ৳${totalProfit.toLocaleString('en-IN')} (Margin: ${((totalProfit/totalSell)*100).toFixed(1)}%)`);
  console.log(`Total Dues Incurred in Sales: ৳${totalDue.toLocaleString('en-IN')}`);
  console.log(`Actual Cash Collected from Sales: ৳${(totalSell - totalDue).toLocaleString('en-IN')}`);

  // 4. Monthly Report
  const monthlyRaw = fs.readFileSync(path.join(dir, 'Monthly_Report.csv'), 'utf-8');
  const monthlyRows = parseCsv(monthlyRaw);
  console.log('\n--- 4. MONTH-BY-MONTH OPERATING PERFORMANCE ---');
  for (let i = 1; i <= 5; i++) {
    const r = monthlyRows[i];
    if (r && r[0]) {
      const month = r[0];
      const income = cleanNum(r[1]);
      const cost = cleanNum(r[2]);
      const exp = cleanNum(r[3]);
      const net = cleanNum(r[4]);
      console.log(`${month}: Sales ৳${income.toLocaleString('en-IN')} | COGS ৳${cost.toLocaleString('en-IN')} | Expense ৳${exp.toLocaleString('en-IN')} | Net ৳${net.toLocaleString('en-IN')}`);
    }
  }

  // 5. Suppliers / Source Codes
  const sourceRaw = fs.readFileSync(path.join(dir, 'Source_Code.csv'), 'utf-8');
  const sourceRows = parseCsv(sourceRaw);
  console.log('\n--- 5. SUPPLIER & PROCUREMENT SOURCES ---');
  for (let i = 1; i < sourceRows.length; i++) {
    const r = sourceRows[i];
    if (r && r[0]) {
      console.log(`[${r[1]}] ${r[0]} (${r[5]}): Rep: ${r[2]}, Phone: ${r[3]}, City: ${r[4]}`);
    }
  }
}

runAnalysis();
