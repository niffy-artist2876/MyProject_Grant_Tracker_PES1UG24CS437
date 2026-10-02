// Money is handled as integer paise end to end; floats are never used.

const MAX_RUPEE_DIGITS = 11;

/**
 * Parses user input like "25000", "25,000.50" or "₹1,00,000" into paise.
 * Returns null for anything that is not a positive amount with at most two
 * decimal places, so zero, negative and malformed input (BTB9-1) are refused.
 */
export function parseAmountToPaise(input: string): number | null {
  const cleaned = input.trim().replace(/^₹/, "").replace(/,/g, "").trim();
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(cleaned);
  if (!match) return null;

  const rupees = match[1].replace(/^0+(?=\d)/, "");
  if (rupees.length > MAX_RUPEE_DIGITS) return null;

  const paise = Number(rupees) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return paise > 0 ? paise : null;
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});

export function formatPaise(paise: number): string {
  return inr.format(paise / 100);
}
