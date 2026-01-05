import React from 'react';
import { Trial } from '../types';
import { ArrowLeft, Play } from 'lucide-react';

interface Props {
  trials: Trial[];
  onBack: () => void;
  onStartExperiment: () => void;
}

export const GalleryView: React.FC<Props> = ({ trials, onBack, onStartExperiment }) => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-gray-50/95 backdrop-blur py-4 z-10 border-b">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
          返回配置
        </button>
        <h2 className="text-xl font-bold">实验序列预览 ({trials.length} Trials)</h2>
        <button 
          onClick={onStartExperiment} 
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-lg"
        >
          <Play className="w-4 h-4" />
          确认并开始
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {trials.map((trial, index) => (
          <div key={trial.id} className="bg-white rounded-lg shadow-sm border p-2 hover:shadow-md transition-all">
             <div className="flex aspect-video w-full mb-2 rounded border border-gray-100 overflow-hidden">
                <div 
                  className="flex-1 flex items-center justify-center" 
                  style={{ backgroundColor: trial.bgAColor.css }}
                >
                  <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: trial.targetColor.css }}></div>
                </div>
                <div 
                  className="flex-1 flex items-center justify-center" 
                  style={{ backgroundColor: trial.bgBColor.css }}
                >
                  <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: trial.targetColor.css }}></div>
                </div>
             </div>
             <div className="space-y-1">
               <div className="text-xs font-mono text-gray-500 truncate" title={trial.params.target}>
                 <span className="font-bold">T:</span> {trial.params.target}
               </div>
               <div className="text-xs font-mono text-gray-500 truncate" title={trial.params.bgA}>
                 <span className="font-bold">A:</span> {trial.params.bgA}
               </div>
               <div className="text-xs font-mono text-gray-500 truncate" title={trial.params.bgB}>
                 <span className="font-bold">B:</span> {trial.params.bgB}
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
