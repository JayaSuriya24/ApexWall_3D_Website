import { siteConfig } from "@/config/site";

export type Surface = keyof typeof siteConfig.pricing.baseRates;
export type Ink = keyof typeof siteConfig.pricing.inkAddOns;

export const SURFACES = Object.keys(siteConfig.pricing.baseRates) as Surface[];
export const INKS = Object.keys(siteConfig.pricing.inkAddOns) as Ink[];

/**
 * Rate per sq ft = surface base rate + ink add-on, from siteConfig.pricing.
 * `fillRatio` is the share of the width × height box that is printed (≈0.785 for a circle).
 * siteConfig.pricing.multipliers is not applied; confirm with the business whether it should be.
 */
export function estimatePrice({
  widthFt,
  heightFt,
  surface,
  ink,
  fillRatio = 1,
}: {
  widthFt: number;
  heightFt: number;
  surface: Surface;
  ink: Ink;
  fillRatio?: number;
}) {
  const areaSqFt = widthFt * heightFt * fillRatio;
  const ratePerSqFt = siteConfig.pricing.baseRates[surface] + siteConfig.pricing.inkAddOns[ink];
  return {
    areaSqFt,
    ratePerSqFt,
    total: Math.round(areaSqFt * ratePerSqFt),
    printHours: areaSqFt / siteConfig.pricing.speedSqFtPerHour,
  };
}

/** Pixels per printed inch for an image stretched across `widthFt`. */
export const printPpi = (pixelWidth: number, widthFt: number) => pixelWidth / (widthFt * 12);

// Placeholder thresholds; agree the real numbers with the print team.
export const PPI_GOOD = 40;
export const PPI_OK = 20;

export function resolutionVerdict(ppi: number): "good" | "ok" | "low" {
  if (ppi >= PPI_GOOD) return "good";
  if (ppi >= PPI_OK) return "ok";
  return "low";
}

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export const formatInr = (n: number) => inr.format(n);
