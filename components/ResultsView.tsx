import React from 'react';
import { TrialResult, SubjectInfo } from '../types';
import { calculateDeltaE, calculateDeltaH } from '../utils/colorMath';
import { Download, RefreshCw, Grid, Clock, User } from 'lucide-react';
import { csvFormat } from 'd3-dsv';

interface Props {
  results: TrialResult[];
  subjectInfo: SubjectInfo;
  randomSeed: number;
  onRestart: () => void;
}

export const ResultsView: React.FC<Props> = ({ results, subjectInfo, randomSeed, onRestart }) => {
  
  const downloadData = () => {
    // Flatten data for CSV with extended metrics
    const flatData = results.map(r => {
      // Calculate color metrics between Background A and Background B
      // These are the context drivers for simultaneous contrast
      const deltaE = calculateDeltaE(r.trial.bgAColor, r.trial.bgBColor);
      const deltaH = calculateDeltaH(r.trial.bgAColor, r.trial.bgBColor);

      return {
        // Subject Info
        subject_id: subjectInfo.id,
        subject_age: subjectInfo.age,
        subject_gender: subjectInfo.gender,
        
        // Experiment Meta
        trial_id: r.trialId,
        random_seed: randomSeed,
        
        // Responses
        reaction_time: r.duration, // renamed from duration
        perceived_same: r.perceivedSame === null ? 'TIMEOUT' : (r.perceivedSame ? 1 : 0),
        timed_out: r.timedOut ? 1 : 0,
        
        // Target Color Data
        target_mode: r.trial.targetColor.mode,
        target_css: r.trial.targetColor.css,
        target_h: r.trial.targetColor.h.toFixed(2),
        target_s: r.trial.targetColor.s.toFixed(2),
        target_l: r.trial.targetColor.l.toFixed(2),
        target_L: r.trial.targetColor.L.toFixed(2),
        target_a: r.trial.targetColor.a.toFixed(2),
        target_b: r.trial.targetColor.b.toFixed(2),

        // Background A Color Data
        bgA_css: r.trial.bgAColor.css,
        bgA_h: r.trial.bgAColor.h.toFixed(2),
        bgA_s: r.trial.bgAColor.s.toFixed(2),
        bgA_l: r.trial.bgAColor.l.toFixed(2),
        bgA_L: r.trial.bgAColor.L.toFixed(2),
        bgA_a: r.trial.bgAColor.a.toFixed(2),
        bgA_b: r.trial.bgAColor.b.toFixed(2),

        // Background B Color Data
        bgB_css: r.trial.bgBColor.css,
        bgB_h: r.trial.bgBColor.h.toFixed(2),
        bgB_s: r.trial.bgBColor.s.toFixed(2),
        bgB_l: r.trial.bgBColor.l.toFixed(2),
        bgB_L: r.trial.bgBColor.L.toFixed(2),
        bgB_a: r.trial.bgBColor.a.toFixed(2),
        bgB_b: r.trial.bgBColor.b.toFixed(2),

        // Calculated Color Differences (Context Difference)
        delta_E_ab: deltaE.toFixed(4),
        delta_H: deltaH.toFixed(4)
      };
    });

    const csv = csvFormat(flatData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiment_${subjectInfo.id}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const sameCount = results.filter(r => r.perceivedSame === true).length;
  const diffCount = results.filter(r => r.perceivedSame === false).length;
  const timeoutCount = results.filter(r => r.perceivedSame === null).length;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        <div className="p-8 border-b bg-gray-50 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">实验完成 (Experiment Complete)</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1"><User className="w-4 h-4"/> ID: {subjectInfo.id}</span>
              <span>Age: {subjectInfo.age}</span>
              <span>Sex: {subjectInfo.gender}</span>
            </div>
          </div>
          <div className="flex gap-3">
             <button onClick={onRestart} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
               <RefreshCw className="w-4 h-4" />
               重新配置
             </button>
             <button onClick={downloadData} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 text-white shadow">
               <Download className="w-4 h-4" />
               导出 CSV
             </button>
          </div>
        </div>

        <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-indigo-50 p-6 rounded-lg text-center">
            <div className="text-4xl font-bold text-indigo-600">{results.length}</div>
            <div className="text-sm text-indigo-400 uppercase tracking-wide mt-2">Total Trials</div>
          </div>
          <div className="bg-green-50 p-6 rounded-lg text-center">
            <div className="text-4xl font-bold text-green-600">{sameCount}</div>
            <div className="text-sm text-green-400 uppercase tracking-wide mt-2">Same</div>
          </div>
          <div className="bg-rose-50 p-6 rounded-lg text-center">
            <div className="text-4xl font-bold text-rose-600">{diffCount}</div>
            <div className="text-sm text-rose-400 uppercase tracking-wide mt-2">Different</div>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg text-center">
            <div className="text-4xl font-bold text-gray-600 flex items-center justify-center gap-2">
                 <Clock className="w-6 h-6" /> {timeoutCount}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wide mt-2">Timeouts</div>
          </div>
        </div>

        <div className="p-8">
           <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
             <Grid className="w-5 h-5" />
             结果概览 (Visual Gallery)
           </h3>
           <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
             {results.map((r, idx) => {
               let resultColor = 'bg-gray-100 text-gray-600';
               let resultText = 'TIMEOUT';
               if (r.perceivedSame === true) {
                   resultColor = 'bg-green-100 text-green-800';
                   resultText = 'SAME';
               } else if (r.perceivedSame === false) {
                   resultColor = 'bg-rose-100 text-rose-800';
                   resultText = 'DIFF';
               }

               return (
               <div key={idx} className="flex flex-col border rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex h-16 w-full">
                    <div className="flex-1 relative flex items-center justify-center" style={{ backgroundColor: r.trial.bgAColor.css }}>
                       <div className="w-4 h-4 rounded-full" style={{ backgroundColor: r.trial.targetColor.css }}></div>
                    </div>
                    <div className="flex-1 relative flex items-center justify-center" style={{ backgroundColor: r.trial.bgBColor.css }}>
                       <div className="w-4 h-4 rounded-full" style={{ backgroundColor: r.trial.targetColor.css }}></div>
                    </div>
                 </div>
                 <div className={`p-2 text-xs text-center font-bold ${resultColor}`}>
                   {resultText}
                 </div>
                 <div className="p-1 bg-gray-50 text-[10px] text-gray-500 text-center truncate flex justify-between px-2">
                   <span>#{idx + 1}</span>
                   <span>{r.duration}ms</span>
                 </div>
               </div>
             )})}
           </div>
        </div>
      </div>
    </div>
  );
};
