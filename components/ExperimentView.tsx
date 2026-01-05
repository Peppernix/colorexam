import React, { useState, useEffect, useRef } from 'react';
import { Trial, TrialResult } from '../types';
import { Check, X, RotateCcw, Timer } from 'lucide-react';

interface Props {
  trials: Trial[];
  onComplete: (results: TrialResult[]) => void;
  onExit: () => void;
}

const TIMEOUT_MS = 5000;

export const ExperimentView: React.FC<Props> = ({ trials, onComplete, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<TrialResult[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [timeLeft, setTimeLeft] = useState<number>(TIMEOUT_MS);
  const [isFinished, setIsFinished] = useState(false);
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset for new trial
    setStartTime(Date.now());
    setTimeLeft(TIMEOUT_MS);
    
    // Clear existing timer if any
    if (timerRef.current) window.clearInterval(timerRef.current);

    // Start countdown
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100) {
          // Trigger timeout handling inside the interval
          // We need to clear interval immediately to avoid double calls
          if (timerRef.current) window.clearInterval(timerRef.current);
          handleResponse(null, true);
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const handleResponse = (perceivedSame: boolean | null, isTimeout: boolean = false) => {
    if (isFinished) return;

    // Clear timer immediately
    if (timerRef.current) window.clearInterval(timerRef.current);

    const endTime = Date.now();
    const duration = isTimeout ? TIMEOUT_MS : endTime - startTime;
    
    const result: TrialResult = {
      trialId: trials[currentIndex].id,
      trial: trials[currentIndex],
      perceivedSame,
      timedOut: isTimeout,
      timestamp: endTime,
      duration
    };

    const newResults = [...results, result];
    setResults(newResults);

    if (currentIndex < trials.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
      onComplete(newResults);
    }
  };

  const handleUndo = () => {
    if (currentIndex > 0 && !isFinished) {
      // Remove last result
      setResults(prev => prev.slice(0, -1));
      // Go back one step (this triggers useEffect to reset timer)
      setCurrentIndex(prev => prev - 1);
    }
  };

  const currentTrial = trials[currentIndex];

  if (!currentTrial || isFinished) return <div className="p-10 text-center">Processing results...</div>;

  const progress = ((currentIndex + 1) / trials.length) * 100;
  
  // Visual calculation for timer bar
  const timeProgress = (timeLeft / TIMEOUT_MS) * 100;
  const isUrgent = timeLeft < 2000;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <span className="font-bold text-gray-700">Trial {currentIndex + 1} / {trials.length}</span>
          <div className="w-64 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <button 
          onClick={onExit}
          className="text-sm text-gray-500 hover:text-red-500 underline"
        >
          中止实验
        </button>
      </div>

      {/* Main Stimuli Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        
        {/* Timer Display */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className={`text-5xl font-mono font-black tabular-nums transition-colors duration-200 ${isUrgent ? 'text-red-500 scale-110' : 'text-gray-300'}`}>
                {(timeLeft / 1000).toFixed(1)}s
            </div>
            {isUrgent && <span className="text-xs font-bold text-red-400 mt-1 animate-pulse">快做出选择!</span>}
        </div>

        <div className="text-center mb-8 mt-12">
           <h2 className="text-2xl font-bold text-gray-800 mb-2">两个圆形的颜色看起来是否相同？</h2>
           <p className="text-gray-500">请忽略背景，5秒内仅凭直觉判断中心圆颜色。</p>
        </div>

        <div className="flex flex-col md:flex-row gap-12 items-center justify-center mb-12">
          {/* Stimulus A */}
          <div 
            className="relative flex items-center justify-center shadow-lg transition-colors duration-200"
            style={{ 
              width: '300px', 
              height: '300px', 
              backgroundColor: currentTrial.bgAColor.css 
            }}
          >
            <div 
              className="rounded-full shadow-sm"
              style={{ 
                width: '76px', 
                height: '76px', 
                backgroundColor: currentTrial.targetColor.css 
              }}
            ></div>
            <span className="absolute -bottom-8 text-sm text-gray-400 font-mono">Background A</span>
          </div>

          {/* Stimulus B */}
          <div 
            className="relative flex items-center justify-center shadow-lg transition-colors duration-200"
            style={{ 
              width: '300px', 
              height: '300px', 
              backgroundColor: currentTrial.bgBColor.css 
            }}
          >
            <div 
              className="rounded-full shadow-sm"
              style={{ 
                width: '76px', 
                height: '76px', 
                backgroundColor: currentTrial.targetColor.css 
              }}
            ></div>
            <span className="absolute -bottom-8 text-sm text-gray-400 font-mono">Background B</span>
          </div>
        </div>

        {/* Response Controls */}
        <div className="relative flex items-center justify-center">
            {/* Undo Button - Absolute positioned to left of controls */}
            {currentIndex > 0 && (
                <button
                    onClick={handleUndo}
                    className="absolute -left-24 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors flex flex-col items-center gap-1 group"
                    title="撤回上一组 (Undo)"
                >
                    <RotateCcw className="w-5 h-5" />
                    <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">撤销</span>
                </button>
            )}

            <div className="flex gap-8">
                {/* Different (Left) */}
                <button
                    onClick={() => handleResponse(false)}
                    className="flex flex-col items-center justify-center w-40 h-32 bg-white border-2 border-gray-200 rounded-xl hover:border-rose-500 hover:bg-rose-50 hover:shadow-lg transition-all group active:scale-95"
                >
                    <X className="w-10 h-10 text-gray-400 group-hover:text-rose-600 mb-2" />
                    <span className="text-lg font-bold text-gray-700 group-hover:text-rose-700">不同 (Different)</span>
                    <span className="text-xs text-gray-400 mt-1">看起来颜色不一样</span>
                </button>

                {/* Same (Right) */}
                <button
                    onClick={() => handleResponse(true)}
                    className="flex flex-col items-center justify-center w-40 h-32 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-lg transition-all group active:scale-95"
                >
                    <Check className="w-10 h-10 text-gray-400 group-hover:text-indigo-600 mb-2" />
                    <span className="text-lg font-bold text-gray-700 group-hover:text-indigo-700">相同 (Same)</span>
                    <span className="text-xs text-gray-400 mt-1">看起来颜色一样</span>
                </button>
            </div>
        </div>

        {/* Timer Bar (Bottom Visual Cue) */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-200">
             <div 
               className={`h-full transition-all duration-100 linear ${isUrgent ? 'bg-red-500' : 'bg-indigo-400'}`}
               style={{ width: `${timeProgress}%` }}
             ></div>
        </div>

        <div className="mt-12 text-gray-400 text-xs font-mono">
          Trial ID: {currentTrial.id}
        </div>
      </div>
    </div>
  );
};