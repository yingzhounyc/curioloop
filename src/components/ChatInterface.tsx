'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatMessage, CurioLoopPhase, ExperimentProgress, SavedExperiment } from '@/types';
import { MessageBubble } from './MessageBubble';
import { ProgressTracker } from './ProgressTracker';
import { Bot, Send, Loader2, Plus, List, Play } from 'lucide-react';

interface ChatInterfaceProps {
  userId?: string;
}

export function ChatInterface({ userId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<CurioLoopPhase>('observe');
  const [progress, setProgress] = useState<ExperimentProgress>({
    currentPhase: 'observe',
    dayInExperiment: 1,
    totalDays: 7,
    isComplete: false,
    streakDays: 0,
    totalExperiments: 0
  });
  const [experimentSchedule, setExperimentSchedule] = useState<{
    startDate?: Date;
    duration?: number;
    checkInTime?: Date;
  }>({});
  const [isClient, setIsClient] = useState(false);
  const [savedExperiments, setSavedExperiments] = useState<SavedExperiment[]>([]);
  const [currentExperimentId, setCurrentExperimentId] = useState<string>('');
  const [showExperimentList, setShowExperimentList] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set client-side flag to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize conversation and load from localStorage
  useEffect(() => {
    const savedExperiments = localStorage.getItem('curioloop-experiments');
    const currentExperimentId = localStorage.getItem('curioloop-current-experiment-id') || '';

    if (savedExperiments) {
      try {
        const parsedExperiments: SavedExperiment[] = JSON.parse(savedExperiments);
        // Convert timestamp strings back to Date objects
        const experimentsWithDates = parsedExperiments.map(exp => ({
          ...exp,
          messages: exp.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setSavedExperiments(experimentsWithDates);

        // Load current experiment
        if (currentExperimentId) {
          const currentExp = experimentsWithDates.find(exp => exp.id === currentExperimentId);
          if (currentExp) {
            setCurrentExperimentId(currentExperimentId);
            setMessages(currentExp.messages);
            setCurrentPhase(currentExp.currentPhase);
            setProgress(prev => ({
              ...prev,
              currentPhase: currentExp.currentPhase,
              totalExperiments: experimentsWithDates.length
            }));
            return;
          }
        }
      } catch (error) {
        console.error('Error parsing saved experiments:', error);
      }
    }

    // First time user or no current experiment - show welcome message
    const welcomeMessage: ChatMessage = {
      id: '1',
      content: "Hey! I'm CurioBot - I help you turn curiosity into quick experiments. What's something you're curious about that you'd like to test or explore?",
      sender: 'bot',
      timestamp: new Date(),
      phase: 'observe'
    };
    setMessages([welcomeMessage]);
    setCurrentExperimentId('');
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) {
      console.log('Cannot send message:', { inputMessage: inputMessage.trim(), isLoading });
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
      phase: currentPhase
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          phase: currentPhase,
          userId: userId || 'demo-user',
          experimentId: currentExperimentId || 'demo-experiment',
          conversationHistory: messages.slice(-5).map(m => m.content)
        }),
      });

      const data = await response.json();
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        sender: 'bot',
        timestamp: new Date(),
        phase: data.nextPhase || currentPhase
      };

      const updatedMessages = [...messages, userMessage, botMessage];
      setMessages(updatedMessages);
      
      // Update or create experiment
      let experimentId = currentExperimentId;
      if (!experimentId) {
        experimentId = `exp_${Date.now()}`;
        setCurrentExperimentId(experimentId);
      }

      const newPhase = data.nextPhase || currentPhase;
      if (data.nextPhase && data.nextPhase !== currentPhase) {
        setCurrentPhase(newPhase);
        
        const updatedProgress = {
          ...progress,
          currentPhase: newPhase,
          dayInExperiment: newPhase === 'run' ? 1 : progress.dayInExperiment + 1,
          totalDays: data.experimentDetails?.duration || progress.totalDays
        };
        setProgress(updatedProgress);
      }

      // Store experiment scheduling details
      if (data.experimentDetails || data.followUpTime) {
        const scheduleData = {
          startDate: data.experimentDetails?.startDate,
          duration: data.experimentDetails?.duration,
          checkInTime: data.followUpTime
        };
        setExperimentSchedule(scheduleData);
      }

      // Save experiment
      saveExperiment(experimentId, updatedMessages, newPhase);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble connecting right now. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
        phase: currentPhase
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };


  const getPhaseDescription = (phase: CurioLoopPhase) => {
    const descriptions = {
      observe: "What caught your curiosity?",
      hypothesize: "What's your hypothesis?",
      commit: "Make your commitment",
      run: "Run your experiment",
      reflect: "What did you learn?",
      remix: "What's next?"
    };
    return descriptions[phase];
  };

  const saveExperiment = (experimentId: string, messages: ChatMessage[], phase: CurioLoopPhase) => {
    const experimentTitle = getExperimentTitle(messages);
    const curiosity = getExperimentCuriosity(messages);
    const hypothesis = getExperimentHypothesis(messages);

    const experiment: SavedExperiment = {
      id: experimentId,
      title: experimentTitle,
      curiosity,
      hypothesis,
      status: 'active',
      currentPhase: phase,
      startDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      messages
    };

    const updatedExperiments = savedExperiments.filter(exp => exp.id !== experimentId);
    updatedExperiments.push(experiment);
    setSavedExperiments(updatedExperiments);

    // Save to localStorage
    localStorage.setItem('curioloop-experiments', JSON.stringify(updatedExperiments));
    localStorage.setItem('curioloop-current-experiment-id', experimentId);
  };

  const getExperimentTitle = (messages: ChatMessage[]): string => {
    const firstUserMessage = messages.find(msg => msg.sender === 'user');
    return firstUserMessage ? firstUserMessage.content.slice(0, 50) + '...' : 'New Experiment';
  };

  const getExperimentCuriosity = (messages: ChatMessage[]): string => {
    const curiosityMessage = messages.find(msg => msg.sender === 'user' && msg.phase === 'observe');
    return curiosityMessage ? curiosityMessage.content : '';
  };

  const getExperimentHypothesis = (messages: ChatMessage[]): string => {
    const hypothesisMessage = messages.find(msg => msg.sender === 'user' && msg.phase === 'hypothesize');
    return hypothesisMessage ? hypothesisMessage.content : '';
  };


  const closeCurrentExperiment = () => {
    if (currentExperimentId) {
      const updatedExperiments = savedExperiments.map(exp => 
        exp.id === currentExperimentId 
          ? { ...exp, status: 'paused' as const, lastUpdated: new Date().toISOString() }
          : exp
      );
      setSavedExperiments(updatedExperiments);
      localStorage.setItem('curioloop-experiments', JSON.stringify(updatedExperiments));
    }

    // Start fresh
    const welcomeMessage: ChatMessage = {
      id: '1',
      content: "Hey! I'm CurioBot - I help you turn curiosity into quick experiments. What's something you're curious about that you'd like to test or explore?",
      sender: 'bot',
      timestamp: new Date(),
      phase: 'observe'
    };
    setMessages([welcomeMessage]);
    setCurrentExperimentId('');
    setCurrentPhase('observe');
    setExperimentSchedule({});
    localStorage.removeItem('curioloop-current-experiment-id');
  };

  const switchToExperiment = (experimentId: string) => {
    const experiment = savedExperiments.find(exp => exp.id === experimentId);
    if (experiment) {
      setCurrentExperimentId(experimentId);
      setMessages(experiment.messages);
      setCurrentPhase(experiment.currentPhase);
      setProgress(prev => ({
        ...prev,
        currentPhase: experiment.currentPhase,
        totalExperiments: savedExperiments.length
      }));
      localStorage.setItem('curioloop-current-experiment-id', experimentId);
      setShowExperimentList(false);
    }
  };

  const startNewExperiment = () => {
    closeCurrentExperiment();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">CurioBot</h1>
              <p className="text-sm text-gray-500">{getPhaseDescription(currentPhase)}</p>
              {experimentSchedule.startDate && experimentSchedule.duration && (
                <p className="text-xs text-green-600">
                  🗓️ Experiment: {experimentSchedule.startDate.toLocaleDateString()} for {experimentSchedule.duration} days
                </p>
              )}
              {experimentSchedule.checkInTime && (
                <p className="text-xs text-blue-600">
                  ⏰ Next check-in: {experimentSchedule.checkInTime.toLocaleString()}
                </p>
              )}
              {isClient && (
                <div className="flex items-center space-x-2 mt-1">
                  <button
                    onClick={() => setShowExperimentList(!showExperimentList)}
                    className="text-xs text-gray-400 hover:text-gray-600 underline flex items-center"
                  >
                    <List className="w-3 h-3 mr-1" />
                    Experiments ({savedExperiments.length})
                  </button>
                  {currentExperimentId && (
                    <button
                      onClick={startNewExperiment}
                      className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      New Experiment
                    </button>
                  )}
                  <button
                    onClick={() => {
                      localStorage.clear();
                      window.location.reload();
                    }}
                    className="text-xs text-gray-400 hover:text-gray-600 underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </div>
          <ProgressTracker progress={progress} />
        </div>
      </div>

      {/* Experiment List Dropdown */}
      {showExperimentList && (
        <div className="bg-white border-b border-gray-200 px-4 py-2 max-h-48 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Your Experiments</h3>
          {savedExperiments.length === 0 ? (
            <p className="text-xs text-gray-500">No experiments yet. Start your first one!</p>
          ) : (
            <div className="space-y-1">
              {savedExperiments.map((experiment) => (
                <div
                  key={experiment.id}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-50 ${
                    experiment.id === currentExperimentId ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                  onClick={() => switchToExperiment(experiment.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {experiment.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {experiment.status === 'active' ? '🟢 Active' : '⏸️ Paused'} • {experiment.currentPhase} • {new Date(experiment.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                  {experiment.id === currentExperimentId && (
                    <Play className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">CurioBot is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type your message..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[48px] max-h-32"
              disabled={isLoading}
              rows={1}
              style={{ minHeight: '48px' }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-h-[48px]"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
