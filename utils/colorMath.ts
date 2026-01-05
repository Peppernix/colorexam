import { ColorDef } from '../types';

/**
 * Calculates Euclidean distance in Lab space (CIE76 Delta E)
 */
export const calculateDeltaE = (c1: ColorDef, c2: ColorDef): number => {
  const dL = c1.L - c2.L;
  const da = c1.a - c2.a;
  const db = c1.b - c2.b;
  return Math.sqrt(dL * dL + da * da + db * db);
};

/**
 * Calculates Metric Hue Difference (Delta H*)
 * Formula: Delta H* = sqrt((Delta E*)^2 - (Delta L*)^2 - (Delta C*)^2)
 */
export const calculateDeltaH = (c1: ColorDef, c2: ColorDef): number => {
  const dE = calculateDeltaE(c1, c2);
  const dL = Math.abs(c1.L - c2.L);
  
  // Chroma
  const C1 = Math.sqrt(c1.a * c1.a + c1.b * c1.b);
  const C2 = Math.sqrt(c2.a * c2.a + c2.b * c2.b);
  const dC = Math.abs(C1 - C2);

  // Term under square root
  const term = (dE * dE) - (dL * dL) - (dC * dC);
  
  // Handle floating point errors that might result in slightly negative numbers
  if (term < 0) return 0;
  
  return Math.sqrt(term);
};
