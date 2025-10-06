'use client';

import { ChatMessage } from '@/types';
import { Bot, User } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isBot = message.sender === 'bot';
  
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${isBot ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isBot 
            ? 'bg-blue-100 text-blue-600' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>
        
        {/* Message */}
        <div className={`px-4 py-2 rounded-lg ${
          isBot
            ? 'bg-white border border-gray-200 text-gray-900'
            : 'bg-blue-600 text-white'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
          
          {/* Phase indicator for bot messages */}
          {isBot && message.phase && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                {getPhaseLabel(message.phase)}
              </span>
            </div>
          )}
          
          {/* Timestamp */}
          <div className={`text-xs mt-1 ${
            isBot ? 'text-gray-500' : 'text-blue-100'
          }`}>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function getPhaseLabel(phase: string): string {
  const labels = {
    observe: '🔍 Observe',
    hypothesize: '💡 Hypothesize',
    commit: '📜 Commit',
    run: '🔄 Run',
    reflect: '🪞 Reflect',
    remix: '🧩 Remix'
  };
  return labels[phase as keyof typeof labels] || phase;
}
