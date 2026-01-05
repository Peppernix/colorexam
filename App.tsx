import React, { useState, useMemo } from 'react';
import { ExperimentConfig, Trial, TrialResult, SubjectInfo } from './types';
import { generateTrials, DEFAULT_CONFIG } from './utils/colorGen';
import { ConfigPanel } from './components/ConfigPanel';
import { ExperimentView } from './components/ExperimentView';
import { ResultsView } from './components/ResultsView';
import { GalleryView } from './components/GalleryView';
import { SubjectForm } from './components/SubjectForm';
import { Eye, LayoutGrid } from 'lucide-react';

type ViewState = 'CONFIG' | 'GALLERY' | 'SUBJECT_INFO' | 'EXPERIMENT' | 'RESULTS';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('CONFIG');
  const [config, setConfig] = useState<ExperimentConfig>(DEFAULT_CONFIG);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [results, setResults] = useState<TrialResult[]>([]);
  const [randomSeed, setRandomSeed] = useState<number>(0);
  
  const [subjectInfo, setSubjectInfo] = useState<SubjectInfo>({
    id: '',
    age: '',
    gender: 'female'
  });

  // Memoize trial generation so it updates only when config changes
  const estimatedCount = useMemo(() => {
    const getSteps = (e: any) => (e.mode === 'HSL' 
      ? (e.h.isRange ? e.h.steps : 1) * (e.s.isRange ? e.s.steps : 1) * (e.l.isRange ? e.l.steps : 1)
      : (e.L.isRange ? e.L.steps : 1) * (e.a.isRange ? e.a.steps : 1) * (e.b.isRange ? e.b.steps : 1)
    );
    return getSteps(config.target) * getSteps(config.backgroundA) * getSteps(config.backgroundB);
  }, [config]);

  const handleGenerateAndPreview = () => {
    // Generate trials for preview (don't set seed yet, or set temp seed)
    const t = generateTrials(config);
    setTrials(t);
    setView('GALLERY');
  };

  const handleInitiateExperiment = () => {
    // Generate fresh set of trials with current config
    const t = generateTrials(config);
    setTrials(t);
    
    // Set a "Random Seed" (timestamp) to track this specific generation instance
    setRandomSeed(Date.now());

    // Navigate to Subject Info entry
    setView('SUBJECT_INFO');
  };

  const handleSubjectSubmit = (info: SubjectInfo) => {
    setSubjectInfo(info);
    setView('EXPERIMENT');
  };

  const handleComplete = (res: TrialResult[]) => {
    setResults(res);
    setView('RESULTS');
  };

  const handleRestart = () => {
    setResults([]);
    // Reset subject info? Maybe keep it for consecutive runs. 
    // Let's keep subject info but reset trials.
    setView('CONFIG');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header (except in experiment mode or subject form) */}
      {view !== 'EXPERIMENT' && view !== 'SUBJECT_INFO' && (
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <Eye size={20} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-gray-800">色彩视错觉实验室 <span className="text-xs font-normal text-gray-500 ml-2">v1.0</span></h1>
            </div>
            <nav className="flex gap-4">
              {view === 'CONFIG' && (
                <button 
                  onClick={handleGenerateAndPreview}
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  <LayoutGrid size={16} />
                  预览序列 ({estimatedCount})
                </button>
              )}
            </nav>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main>
        {view === 'CONFIG' && (
          <ConfigPanel 
            config={config} 
            setConfig={setConfig} 
            onStart={handleInitiateExperiment}
            trialCount={estimatedCount}
          />
        )}

        {view === 'GALLERY' && (
          <GalleryView 
            trials={trials} 
            onBack={() => setView('CONFIG')}
            onStartExperiment={handleInitiateExperiment}
          />
        )}

        {view === 'SUBJECT_INFO' && (
          <SubjectForm 
            onSubmit={handleSubjectSubmit}
            onCancel={() => setView('CONFIG')}
          />
        )}

        {view === 'EXPERIMENT' && (
          <ExperimentView 
            trials={trials} 
            onComplete={handleComplete}
            onExit={() => setView('CONFIG')}
          />
        )}

        {view === 'RESULTS' && (
          <ResultsView 
            results={results} 
            subjectInfo={subjectInfo}
            randomSeed={randomSeed}
            onRestart={handleRestart}
          />
        )}
      </main>
    </div>
  );
};

export default App;
