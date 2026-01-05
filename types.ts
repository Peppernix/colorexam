// Supported color spaces - Reduced to HSL only per request
export type ColorMode = 'HSL';

// A single value configuration
export interface ParameterConfig {
  // Classic Range/Fixed
  value: number; 
  start: number;
  end: number;
  steps: number; 
  isRange: boolean;
  
  // New: List Mode (for Target S/L and BgA Delta H)
  listValues: number[]; 
  
  // New: Mapping Mode (for BgA S/L relative to Target)
  // Stores the target value and the corresponding background value
  mappingValues: { target: number; value: number }[];
}

// Configuration for one color entity
export interface EntityConfig {
  mode: ColorMode;
  h: ParameterConfig;
  s: ParameterConfig;
  l: ParameterConfig;
}

// Global Experiment Configuration
export interface ExperimentConfig {
  mode: ColorMode;
  target: EntityConfig;
  backgroundA: EntityConfig;
  backgroundB: EntityConfig;
  randomizeOrder: boolean;
}

// A generic color object for internal use
export interface ColorDef {
  mode: ColorMode;
  h: number;
  s: number;
  l: number;
  // We keep Lab values calculated for analysis/export
  L: number;
  a: number;
  b: number;
  css: string;
}

// A generated trial
export interface Trial {
  id: string;
  targetColor: ColorDef;
  bgAColor: ColorDef;
  bgBColor: ColorDef;
  params: { 
    target: string;
    bgA: string;
    bgB: string;
  };
}

// User response
export interface TrialResult {
  trialId: string;
  trial: Trial;
  perceivedSame: boolean | null; 
  timedOut?: boolean; 
  timestamp: number;
  duration: number; 
}

export interface SubjectInfo {
  id: string;
  age: string;
  gender: string;
}
