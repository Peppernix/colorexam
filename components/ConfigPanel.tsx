
import React, { useEffect } from 'react';
import { ExperimentConfig, EntityConfig, ParameterConfig } from '../types';
import { Settings, Play, SlidersHorizontal, ArrowRight, Link as LinkIcon, List } from 'lucide-react';

interface Props {
  config: ExperimentConfig;
  setConfig: React.Dispatch<React.SetStateAction<ExperimentConfig>>;
  onStart: () => void;
  trialCount: number;
}

// 1. Standard Range/Fixed Input (For Target H and Background B)
const StandardParamInput: React.FC<{
  label: string;
  subLabel: string;
  config: ParameterConfig;
  onChange: (c: ParameterConfig) => void;
  min: number;
  max: number;
}> = ({ label, subLabel, config, onChange, min, max }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
       <div className="flex justify-between items-center">
        <div>
          <span className="font-bold text-gray-700">{label}</span>
          <span className="text-xs text-gray-400 ml-1">({subLabel})</span>
        </div>
        <label className="flex items-center cursor-pointer">
            <span className="text-xs text-gray-500 mr-2">{config.isRange ? 'Range' : 'Fixed'}</span>
            <input
              type="checkbox"
              className="accent-indigo-600"
              checked={config.isRange}
              onChange={(e) => onChange({ ...config, isRange: e.target.checked })}
            />
        </label>
      </div>

      {!config.isRange ? (
        <div className="flex items-center gap-3">
           <input 
              type="range" min={min} max={max} value={config.value}
              onChange={(e) => onChange({ ...config, value: Number(e.target.value) })}
              className="flex-1 accent-gray-600"
           />
           <input 
              type="number" min={min} max={max} value={config.value}
              onChange={(e) => onChange({ ...config, value: Number(e.target.value) })}
              className="w-16 text-center border rounded p-1"
           />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col">
                <span className="text-[10px] uppercase text-gray-400">Start</span>
                <input type="number" min={min} max={max} value={config.start}
                  onChange={(e) => onChange({...config, start: Number(e.target.value)})}
                  className="border rounded p-1 text-sm"
                />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] uppercase text-gray-400">End</span>
                <input type="number" min={min} max={max} value={config.end}
                  onChange={(e) => onChange({...config, end: Number(e.target.value)})}
                  className="border rounded p-1 text-sm"
                />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] uppercase text-gray-400">Steps</span>
                <input type="number" min={1} max={20} value={config.steps}
                  onChange={(e) => onChange({...config, steps: Number(e.target.value)})}
                  className="border rounded p-1 text-sm font-bold text-indigo-600 bg-indigo-50"
                />
            </div>
        </div>
      )}
    </div>
  );
};

// 2. List Input (For Target S/L and BgA Delta H)
const ListParamInput: React.FC<{
  label: string;
  subLabel: string;
  values: number[];
  onChange: (vals: number[]) => void;
  placeholder?: string;
}> = ({ label, subLabel, values, onChange, placeholder }) => {
  const handleChange = (str: string) => {
    // Split by comma, filter non-numbers
    const nums = str.split(',')
      .map(s => s.trim())
      .filter(s => s !== '' && !isNaN(Number(s)))
      .map(Number);
    onChange(nums);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
        <div className="flex items-center gap-2">
            <List className="w-4 h-4 text-indigo-500" />
            <div>
                <span className="font-bold text-gray-700">{label}</span>
                <span className="text-xs text-gray-400 ml-1">({subLabel})</span>
            </div>
        </div>
        <input 
            type="text"
            className="w-full border border-gray-300 rounded p-2 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
            value={values.join(', ')}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder || "e.g. 20, 50, 60"}
        />
        <div className="text-[10px] text-gray-400 text-right">
            Count: {values.length}
        </div>
    </div>
  );
};

// 3. Mapping Input (For BgA S/L relative to Target)
const MappingParamInput: React.FC<{
  label: string;
  subLabel: string;
  targetValues: number[]; // The 'keys' (Target S or L list)
  mapping: { target: number; value: number }[];
  onChange: (newMapping: { target: number; value: number }[]) => void;
  min: number;
  max: number;
}> = ({ label, subLabel, targetValues, mapping, onChange, min, max }) => {

  // Sync mapping with targetValues if targetValues changed (Target S/L list updated)
  useEffect(() => {
     let needsUpdate = false;
     const currentTargets = mapping.map(m => m.target);
     
     // Check if all target values exist in mapping
     const missing = targetValues.filter(t => !currentTargets.includes(t));
     // Check if mapping has orphans
     const orphans = currentTargets.filter(t => !targetValues.includes(t));

     if (missing.length > 0 || orphans.length > 0) {
        let newMap = mapping.filter(m => targetValues.includes(m.target));
        missing.forEach(t => {
            newMap.push({ target: t, value: 50 }); // Default 50
        });
        // Sort by target for UI cleanliness
        newMap.sort((a, b) => a.target - b.target);
        onChange(newMap);
     }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetValues, mapping]); // Dependencies need care to avoid infinite loops, but here logic is stable

  const handleValueChange = (targetKey: number, newValue: number) => {
    const newMap = mapping.map(m => m.target === targetKey ? { ...m, value: newValue } : m);
    onChange(newMap);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-rose-500" />
            <div>
                <span className="font-bold text-gray-700">{label}</span>
                <span className="text-xs text-gray-400 ml-1">({subLabel})</span>
            </div>
        </div>
        <p className="text-xs text-gray-500 mb-2">Set Background value for each Target value:</p>
        
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            {mapping.length === 0 && <span className="text-xs text-gray-400 italic">No Target values defined.</span>}
            {mapping.map((m) => (
                <div key={m.target} className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-100">
                    <div className="w-16 text-right text-xs font-bold text-gray-600">
                        Target {m.target}:
                    </div>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    <div className="flex-1 flex items-center gap-2">
                         <span className="text-xs font-bold text-rose-600">Bg:</span>
                         <input 
                            type="number" min={min} max={max}
                            value={m.value}
                            onChange={(e) => handleValueChange(m.target, Number(e.target.value))}
                            className="w-16 border rounded p-1 text-sm"
                         />
                         <input 
                            type="range" min={min} max={max}
                            value={m.value}
                            onChange={(e) => handleValueChange(m.target, Number(e.target.value))}
                            className="flex-1 h-1 bg-rose-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-500"
                         />
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};


export const ConfigPanel: React.FC<Props> = ({ config, setConfig, onStart, trialCount }) => {
  
  // Helper updates
  const updateTarget = (key: keyof EntityConfig, newP: ParameterConfig) => {
      setConfig(prev => ({ ...prev, target: { ...prev.target, [key]: newP } }));
  };
  const updateBgA = (key: keyof EntityConfig, newP: ParameterConfig) => {
      setConfig(prev => ({ ...prev, backgroundA: { ...prev.backgroundA, [key]: newP } }));
  };
  const updateBgB = (key: keyof EntityConfig, newP: ParameterConfig) => {
      setConfig(prev => ({ ...prev, backgroundB: { ...prev.backgroundB, [key]: newP } }));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 pb-32 space-y-8">
      
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Settings className="w-8 h-8 text-gray-400" />
            实验参数配置
        </h2>
        <p className="text-gray-500 mt-2">
            配置 HSL 空间下的视觉错觉参数。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* 1. Target Column */}
        <div className="space-y-6">
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                <h3 className="font-bold text-indigo-900">Target (目标)</h3>
                <p className="text-xs text-indigo-700">Configured via Lists & Ranges</p>
            </div>

            {/* Target H - Range */}
            <StandardParamInput 
                label="Hue" subLabel="H" min={0} max={360}
                config={config.target.h}
                onChange={(c) => updateTarget('h', c)}
            />

            {/* Target S - List */}
            <ListParamInput 
                label="Saturation" subLabel="S List"
                values={config.target.s.listValues}
                onChange={(vals) => updateTarget('s', { ...config.target.s, listValues: vals })}
            />

            {/* Target L - List */}
            <ListParamInput 
                label="Lightness" subLabel="L List"
                values={config.target.l.listValues}
                onChange={(vals) => updateTarget('l', { ...config.target.l, listValues: vals })}
            />
        </div>

        {/* 2. Background A Column (Dependent) */}
        <div className="space-y-6">
            <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-lg">
                <h3 className="font-bold text-rose-900">Background A</h3>
                <p className="text-xs text-rose-700">Relative to Target</p>
            </div>

            {/* BgA H - Delta List */}
            <ListParamInput 
                label="Hue Delta" subLabel="ΔH List"
                values={config.backgroundA.h.listValues}
                onChange={(vals) => updateBgA('h', { ...config.backgroundA.h, listValues: vals })}
                placeholder="e.g. 60, 120, 180"
            />

            {/* BgA S - Mapping */}
            <MappingParamInput 
                label="Saturation" subLabel="S Mapping"
                targetValues={config.target.s.listValues}
                mapping={config.backgroundA.s.mappingValues}
                onChange={(map) => updateBgA('s', { ...config.backgroundA.s, mappingValues: map })}
                min={0} max={100}
            />

            {/* BgA L - Mapping */}
            <MappingParamInput 
                label="Lightness" subLabel="L Mapping"
                targetValues={config.target.l.listValues}
                mapping={config.backgroundA.l.mappingValues}
                onChange={(map) => updateBgA('l', { ...config.backgroundA.l, mappingValues: map })}
                min={0} max={100}
            />
        </div>

        {/* 3. Background B Column (Independent) */}
        <div className="space-y-6">
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg">
                <h3 className="font-bold text-emerald-900">Background B</h3>
                <p className="text-xs text-emerald-700">Independent Controls</p>
            </div>

            <StandardParamInput 
                label="Hue" subLabel="H" min={0} max={360}
                config={config.backgroundB.h}
                onChange={(c) => updateBgB('h', c)}
            />
             <StandardParamInput 
                label="Saturation" subLabel="S" min={0} max={100}
                config={config.backgroundB.s}
                onChange={(c) => updateBgB('s', c)}
            />
             <StandardParamInput 
                label="Lightness" subLabel="L" min={0} max={100}
                config={config.backgroundB.l}
                onChange={(c) => updateBgB('l', c)}
            />
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
             <div className="flex items-center gap-4">
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-indigo-600 w-4 h-4"
                        checked={config.randomizeOrder}
                        onChange={(e) => setConfig(prev => ({...prev, randomizeOrder: e.target.checked}))}
                    />
                    <span className="text-sm font-medium text-gray-700">随机顺序</span>
                 </label>
                 <div className="h-6 w-px bg-gray-300"></div>
                 <div className="text-sm text-gray-600">
                    Estimated Trials: <span className="font-bold text-indigo-600 text-lg">{trialCount}</span>
                 </div>
             </div>

             <button 
              onClick={onStart}
              disabled={trialCount === 0}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              生成并开始
            </button>
        </div>
      </div>
    </div>
  );
};
