export interface User {
  id: string;
  email: string;
  created_at: string;
  current_experiment_id?: string;
  total_experiments: number;
  streak_days: number;
  last_active: string;
}

export interface Experiment {
  id: string;
  user_id: string;
  title: string;
  curiosity: string;
  hypothesis: string;
  commitment: string;
  status: 'active' | 'completed' | 'abandoned' | 'paused';
  start_date: string;
  end_date?: string;
  created_at: string;
  last_updated: string;
  current_phase: CurioLoopPhase;
  duration?: number;
}

export interface Conversation {
  id: string;
  user_id: string;
  experiment_id: string;
  message_type: 'user' | 'bot' | 'system';
  content: string;
  phase: 'observe' | 'hypothesize' | 'commit' | 'run' | 'reflect' | 'remix';
  created_at: string;
}

export interface DailyEntry {
  id: string;
  experiment_id: string;
  entry_type: 'observation' | 'action' | 'reflection';
  content: string;
  date: string;
  created_at: string;
}

export type CurioLoopPhase = 'observe' | 'hypothesize' | 'commit' | 'run' | 'reflect' | 'remix';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  phase?: CurioLoopPhase;
}

export interface ExperimentProgress {
  currentPhase: CurioLoopPhase;
  dayInExperiment: number;
  totalDays: number;
  isComplete: boolean;
  streakDays: number;
  totalExperiments: number;
}

export interface CurioBotResponse {
  message: string;
  nextPhase?: CurioLoopPhase;
  suggestions?: string[];
  isComplete?: boolean;
  followUpTime?: Date;
  experimentDetails?: {
    startDate?: Date;
    duration?: number; // in days
    checkInFrequency?: 'daily' | 'every_other_day' | 'weekly';
  };
}

export interface SavedExperiment {
  id: string;
  title: string;
  curiosity: string;
  hypothesis: string;
  status: 'active' | 'completed' | 'abandoned' | 'paused';
  currentPhase: CurioLoopPhase;
  startDate: string;
  lastUpdated: string;
  messages: ChatMessage[];
}
