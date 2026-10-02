import { describe, expect, it } from "vitest";
import { formatPaise, parseAmountToPaise } from "./money";

describe("parseAmountToPaise", () => {
  it.each([
    ["25000", 2_500_000],
    ["25000.5", 2_500_050],
    ["25,000.50", 2_500_050],
    ["₹1,00,000", 10_000_000],
    ["  0.01 ", 1],
    ["007", 700],
  ])("parses %j", (input, paise) => {
    expect(parseAmountToPaise(input)).toBe(paise);
  });

  // BTB9-1: negative and zero amounts were accepted.
  it.each(["-500", "0", "0.00", "", "abc", "1.234", "1e5", "12.", ".5", "123456789012"])(
    "refuses %j",
    (input) => {
      expect(parseAmountToPaise(input)).toBeNull();
    },
  );

  it("does not lose paise to floating-point rounding", () => {
    expect(parseAmountToPaise("0.29")).toBe(29);
    expect(parseAmountToPaise("1.15")).toBe(115);
  });
});

describe("formatPaise", () => {
  it("formats in Indian notation", () => {
    expect(formatPaise(10_000_050)).toBe("₹1,00,000.50");
    expect(formatPaise(-500_050)).toBe("-₹5,000.50");
  });
});
