/**
 * Convert numerical amounts into English words formatted for Bangladeshi Taka (BDT)
 * Example: 300000 -> "Three Hundred Thousand Bangladeshi Taka Only"
 * Example: 150000.75 -> "One Hundred Fifty Thousand Bangladeshi Taka and Seventy-Five Paisa Only"
 */

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertThreeDigits(num: number): string {
  let result = '';
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;

  if (hundred > 0) {
    result += `${ONES[hundred]} Hundred `;
  }

  if (remainder > 0) {
    if (remainder < 20) {
      result += ONES[remainder];
    } else {
      const ten = Math.floor(remainder / 10);
      const one = remainder % 10;
      result += TENS[ten];
      if (one > 0) {
        result += `-${ONES[one]}`;
      }
    }
  }

  return result.trim();
}

/**
 * Converts a positive number to international words (Thousand, Million, Billion)
 */
export function numberToWords(amount: number): string {
  if (amount === 0) return 'Zero';

  const absAmount = Math.abs(Math.floor(amount));
  if (absAmount === 0) return 'Zero';

  const chunks: { value: number; label: string }[] = [
    { value: 1_000_000_000, label: 'Billion' },
    { value: 1_000_000, label: 'Million' },
    { value: 1_000, label: 'Thousand' },
    { value: 1, label: '' },
  ];

  let remaining = absAmount;
  const words: string[] = [];

  for (const chunk of chunks) {
    const count = Math.floor(remaining / chunk.value);
    if (count > 0) {
      const chunkWords = convertThreeDigits(count);
      if (chunkWords) {
        words.push(chunk.label ? `${chunkWords} ${chunk.label}` : chunkWords);
      }
      remaining %= chunk.value;
    }
  }

  return words.join(' ').trim();
}

/**
 * Converts a currency amount to Bangladeshi Taka words
 * e.g., 300000 -> "Three Hundred Thousand Bangladeshi Taka Only"
 */
export function amountToBangladeshiTakaWords(amount: number): string {
  const num = Number(amount);
  if (isNaN(num) || num === 0) {
    return 'Zero Bangladeshi Taka Only';
  }

  const integerPart = Math.floor(Math.abs(num));
  const decimalPart = Math.round((Math.abs(num) - integerPart) * 100);

  const integerWords = numberToWords(integerPart);
  let result = `${integerWords} Bangladeshi Taka`;

  if (decimalPart > 0) {
    const decimalWords = numberToWords(decimalPart);
    result += ` and ${decimalWords} Paisa`;
  }

  result += ' Only';
  return result;
}
