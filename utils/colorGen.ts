
import { ColorDef, ColorMode, EntityConfig, ParameterConfig, Trial, ExperimentConfig } from '../types';
import { hsl, lab } from 'd3-color';

// Helper to generate a sequence of numbers (Classic Range)
const generateRangeSteps = (config: ParameterConfig): number[] => {
  if (!config.isRange || config.steps <= 1) {
    return [config.value];
  }
  const { start, end, steps } = config;
  const stepSize = (end - start) / (steps - 1);
  const result: number[] = [];
  for (let i = 0; i < steps; i++) {
    result.push(Number((start + (i * stepSize)).toFixed(2)));
  }
  return result;
};

// Convert internal ColorDef to usable object with CSS
const createColorDef = (h: number, s: number, l: number): ColorDef => {
  // Normalize H to 0-360
  const normH = ((h % 360) + 360) % 360;
  
  const c = hsl(normH, s / 100, l / 100);
  const cssString = c.formatRgb();
  
  // Calculate Lab for export data
  const labC = lab(c);

  return {
    mode: 'HSL',
    h: normH, 
    s, 
    l,
    L: labC.l,
    a: labC.a,
    b: labC.b,
    css: cssString
  };
};

export const generateTrials = (config: ExperimentConfig): Trial[] => {
  const trials: Trial[] = [];
  let idCounter = 0;

  // 1. Get Target Values
  // H is Range, S is List, L is List
  const targetHs = generateRangeSteps(config.target.h);
  const targetSs = config.target.s.listValues;
  const targetLs = config.target.l.listValues;

  // 2. Get Background B Values (Classic Independent)
  const bgBHs = generateRangeSteps(config.backgroundB.h);
  const bgBSs = generateRangeSteps(config.backgroundB.s);
  const bgBLs = generateRangeSteps(config.backgroundB.l);

  // 3. Background A is Dependent on Target
  // We need to fetch the configuration for BgA
  const bgADeltaHs = config.backgroundA.h.listValues; // Deltas
  const bgASMap = config.backgroundA.s.mappingValues; // Mapping
  const bgALMap = config.backgroundA.l.mappingValues; // Mapping

  // Nested Loop Generation
  targetHs.forEach(tH => {
    targetSs.forEach(tS => {
      targetLs.forEach(tL => {
        
        const targetColor = createColorDef(tH, tS, tL);
        const targetParamStr = `H:${tH.toFixed(0)}, S:${tS}, L:${tL}`;

        // Resolve BgA Values based on current Target values
        
        // BgA H: Iterate through Deltas
        bgADeltaHs.forEach(deltaH => {
            const aH = tH + deltaH; 
            
            // BgA S: Find mapping for current tS
            const sMapping = bgASMap.find(m => m.target === tS);
            const aS = sMapping ? sMapping.value : tS; // Fallback to same if mapping missing

            // BgA L: Find mapping for current tL
            const lMapping = bgALMap.find(m => m.target === tL);
            const aL = lMapping ? lMapping.value : tL; // Fallback to same

            const bgAColor = createColorDef(aH, aS, aL);
            const bgAParamStr = `H:${aH.toFixed(0)} (Δ${deltaH}), S:${aS}, L:${aL}`;

            // Resolve BgB Values (Cartesian product with independent BgB)
            bgBHs.forEach(bH => {
                bgBSs.forEach(bS => {
                    bgBLs.forEach(bL => {
                        const bgBColor = createColorDef(bH, bS, bL);
                        const bgBParamStr = `H:${bH.toFixed(0)}, S:${bS}, L:${bL}`;

                        idCounter++;
                        trials.push({
                            id: `trial-${idCounter}`,
                            targetColor,
                            bgAColor,
                            bgBColor,
                            params: {
                                target: targetParamStr,
                                bgA: bgAParamStr,
                                bgB: bgBParamStr
                            }
                        });
                    });
                });
            });
        });
      });
    });
  });

  if (config.randomizeOrder) {
    for (let i = trials.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [trials[i], trials[j]] = [trials[j], trials[i]];
    }
  }

  return trials;
};

// Updated Defaults per requirements
export const DEFAULT_CONFIG: ExperimentConfig = {
  mode: 'HSL',
  randomizeOrder: true,
  target: {
    mode: 'HSL',
    h: { value: 0, start: 0, end: 360, steps: 4, isRange: true, listValues: [], mappingValues: [] }, // Range Mode
    s: { value: 0, start: 0, end: 0, steps: 0, isRange: false, listValues: [20, 50, 60], mappingValues: [] }, // List Mode
    l: { value: 0, start: 0, end: 0, steps: 0, isRange: false, listValues: [30, 50], mappingValues: [] }, // List Mode
  },
  backgroundA: {
    mode: 'HSL',
    // Hue is Delta List
    h: { value: 0, start: 0, end: 0, steps: 0, isRange: false, listValues: [60, 120, 180], mappingValues: [] }, 
    // Saturation is Mapping (Values relative to Target S default [20, 50, 60])
    s: { value: 0, start: 0, end: 0, steps: 0, isRange: false, listValues: [], 
         mappingValues: [{ target: 20, value: 80 }, { target: 50, value: 50 }, { target: 60, value: 40 }] }, 
    // Lightness is Mapping (Values relative to Target L default [30, 50])
    l: { value: 0, start: 0, end: 0, steps: 0, isRange: false, listValues: [], 
         mappingValues: [{ target: 30, value: 70 }, { target: 50, value: 50 }] },
  },
  backgroundB: {
    mode: 'HSL',
    // Unchanged - Classic controls
    h: { value: 60, start: 0, end: 360, steps: 1, isRange: false, listValues: [], mappingValues: [] }, 
    s: { value: 30, start: 0, end: 100, steps: 1, isRange: false, listValues: [], mappingValues: [] },
    l: { value: 80, start: 0, end: 100, steps: 1, isRange: false, listValues: [], mappingValues: [] }, 
  },
};
