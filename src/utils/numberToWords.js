const ones = [
  "", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE",
  "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN",
  "SEVENTEEN", "EIGHTEEN", "NINETEEN",
];
const tens = [
  "", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY",
];

function twoDigits(n) {
  if (n < 20) return ones[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return tens[t] + (o ? " " + ones[o] : "");
}

function threeDigits(n) {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  let str = "";
  if (h) str += ones[h] + " HUNDRED" + (rest ? " " : "");
  if (rest) str += twoDigits(rest);
  return str;
}

/** Converts a number into Indian numbering system words (Lakh/Crore) */
export function numberToIndianWords(num) {
  num = Math.round(num);
  if (num === 0) return "ZERO";
  if (num < 0) return "MINUS " + numberToIndianWords(-num);

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = num;

  let parts = [];
  if (crore) parts.push(threeDigits(crore) + " CRORE");
  if (lakh) parts.push(threeDigits(lakh) + " LAKH");
  if (thousand) parts.push(threeDigits(thousand) + " THOUSAND");
  if (hundred) parts.push(threeDigits(hundred));

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function amountInWords(amount, currencyLabel = "RUPEES") {
  const rupees = Math.floor(amount);
  const words = numberToIndianWords(rupees);
  return `${words} ${currencyLabel} ONLY`;
}
