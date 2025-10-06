import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          current_experiment_id?: string;
          total_experiments: number;
          streak_days: number;
          last_active: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          current_experiment_id?: string;
          total_experiments?: number;
          streak_days?: number;
          last_active?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          current_experiment_id?: string;
          total_experiments?: number;
          streak_days?: number;
          last_active?: string;
        };
      };
      experiments: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          curiosity: string;
          hypothesis: string;
          commitment: string;
          status: 'active' | 'completed' | 'abandoned';
          start_date: string;
          end_date?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          curiosity: string;
          hypothesis: string;
          commitment: string;
          status?: 'active' | 'completed' | 'abandoned';
          start_date?: string;
          end_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          curiosity?: string;
          hypothesis?: string;
          commitment?: string;
          status?: 'active' | 'completed' | 'abandoned';
          start_date?: string;
          end_date?: string;
          created_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          experiment_id: string;
          message_type: 'user' | 'bot' | 'system';
          content: string;
          phase: 'observe' | 'hypothesize' | 'commit' | 'run' | 'reflect' | 'remix';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          experiment_id: string;
          message_type: 'user' | 'bot' | 'system';
          content: string;
          phase: 'observe' | 'hypothesize' | 'commit' | 'run' | 'reflect' | 'remix';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          experiment_id?: string;
          message_type?: 'user' | 'bot' | 'system';
          content?: string;
          phase?: 'observe' | 'hypothesize' | 'commit' | 'run' | 'reflect' | 'remix';
          created_at?: string;
        };
      };
      daily_entries: {
        Row: {
          id: string;
          experiment_id: string;
          entry_type: 'observation' | 'action' | 'reflection';
          content: string;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          experiment_id: string;
          entry_type: 'observation' | 'action' | 'reflection';
          content: string;
          date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          experiment_id?: string;
          entry_type?: 'observation' | 'action' | 'reflection';
          content?: string;
          date?: string;
          created_at?: string;
        };
      };
    };
  };
};
