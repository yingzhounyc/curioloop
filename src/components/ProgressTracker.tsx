'use client';

import { ExperimentProgress } from '@/types';
import { CheckCircle, Flame } from 'lucide-react';

interface ProgressTrackerProps {
  progress: ExperimentProgress;
}

export function ProgressTracker({ progress }: ProgressTrackerProps) {
  const phases = [
    { key: 'observe', label: 'Observe', icon: '🔍' },
    { key: 'hypothesize', label: 'Hypothesize', icon: '💡' },
    { key: 'commit', label: 'Commit', icon: '📜' },
    { key: 'run', label: 'Run', icon: '🔄' },
    { key: 'reflect', label: 'Reflect', icon: '🪞' },
    { key: 'remix', label: 'Remix', icon: '🧩' }
  ] as const;

  const getPhaseStatus = (phaseKey: string) => {
    const currentIndex = phases.findIndex(p => p.key === progress.currentPhase);
    const phaseIndex = phases.findIndex(p => p.key === phaseKey);
    
    if (phaseIndex < currentIndex) return 'completed';
    if (phaseIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Streak Counter */}
      {progress.streakDays > 0 && (
        <div className="flex items-center space-x-1 text-orange-600">
          <Flame className="w-4 h-4" />
          <span className="text-sm font-medium">{progress.streakDays}</span>
        </div>
      )}
      
      {/* Experiment Counter */}
      {progress.totalExperiments > 0 && (
        <div className="text-sm text-gray-600">
          {progress.totalExperiments} experiment{progress.totalExperiments !== 1 ? 's' : ''}
        </div>
      )}
      
      {/* Phase Progress */}
      <div className="flex items-center space-x-2">
        {phases.map((phase, index) => {
          const status = getPhaseStatus(phase.key);
          const isLast = index === phases.length - 1;
          
          return (
            <div key={phase.key} className="flex items-center">
              {/* Phase Icon with Label */}
              <div className="flex flex-col items-center">
                <div className={`relative w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  status === 'completed' 
                    ? 'bg-green-100 text-green-600' 
                    : status === 'current'
                    ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-300'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {status === 'completed' ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <span>{phase.icon}</span>
                  )}
                </div>
                {/* Phase Label */}
                <span className={`text-xs mt-1 ${
                  status === 'current' ? 'text-blue-600 font-medium' : 'text-gray-500'
                }`}>
                  {phase.label}
                </span>
              </div>
              
              {/* Connector Line */}
              {!isLast && (
                <div className={`w-6 h-0.5 mx-1 ${
                  status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Compact version for mobile
export function CompactProgressTracker({ progress }: ProgressTrackerProps) {
  return (
    <div className="flex items-center space-x-2 text-sm">
      {progress.streakDays > 0 && (
        <div className="flex items-center space-x-1 text-orange-600">
          <Flame className="w-3 h-3" />
          <span>{progress.streakDays}</span>
        </div>
      )}
      
      <div className="text-gray-600">
        {progress.totalExperiments} exp{progress.totalExperiments !== 1 ? 's' : ''}
      </div>
      
      <div className="flex items-center space-x-1">
        {['observe', 'hypothesize', 'commit', 'run', 'reflect', 'remix'].map((phase, index) => {
          const isCurrent = phase === progress.currentPhase;
          const isCompleted = index < ['observe', 'hypothesize', 'commit', 'run', 'reflect', 'remix'].indexOf(progress.currentPhase);
          
          return (
            <div key={phase} className="flex items-center">
              <div className={`w-2 h-2 rounded-full ${
                isCompleted 
                  ? 'bg-green-400' 
                  : isCurrent
                  ? 'bg-blue-400'
                  : 'bg-gray-300'
              }`} />
              {index < 5 && <div className="w-1 h-0.5 bg-gray-200 mx-0.5" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
