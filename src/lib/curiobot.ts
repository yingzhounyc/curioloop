import OpenAI from 'openai';
import { CurioLoopPhase, CurioBotResponse } from '@/types';

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

export class CurioBot {
  private getSystemPrompt(phase: CurioLoopPhase): string {
    const basePersonality = `You are CurioBot, a warm and action-oriented AI companion that helps people turn curiosity into quick learning experiments. Your personality is:
- Warm but direct - you move people to action quickly
- Action-oriented - you focus on getting users experimenting fast
- Practical - you help create simple, doable experiments
- Encouraging - you celebrate progress and learning

The CurioLoop has 6 phases: Observe → Hypothesize → Commit → Run → Reflect → Remix

IMPORTANT: Move quickly through the early phases. Don't over-analyze. Get users from curiosity to action in 2-3 exchanges max.`;

    const phasePrompts = {
      observe: `Phase 1: Observe (BE QUICK - 1-2 exchanges max)
Help the user quickly identify ONE specific thing they're curious about. Don't over-analyze. Just get them to name something specific they want to explore. Move to hypothesize immediately.`,
      
      hypothesize: `Phase 2: Hypothesize (BE QUICK - 1-2 exchanges max)
Help the user turn their curiosity into a specific, testable hypothesis. Focus on making it:
- ACTIONABLE: Clear steps they can take
- MEASURABLE: How they'll know if it worked
- SIMPLE: Easy to execute

Get them to a clear "What if I [specific action] and I measure [specific outcome]?" statement.`,
      
      commit: `Phase 3: Commit (BE QUICK - 1-2 exchanges max)
Help the user make a quick commitment and set a timeline. Get them to commit to trying their experiment for a specific short period (1-7 days max). Move them to action.`,
      
      run: `Phase 4: Run
Support the user during their experiment with brief, encouraging check-ins. Ask simple questions about what they're noticing. Keep it light and supportive.`,
      
      reflect: `Phase 5: Reflect
Guide the user through a quick reflection on their experiment. Focus on one key insight or learning. Don't over-analyze.`,
      
      remix: `Phase 6: Remix
Help the user decide what to do next - a new experiment, refine this one, or explore something new. Keep it simple and action-oriented.`
    };

    return `${basePersonality}\n\n${phasePrompts[phase]}`;
  }

  async generateResponse(
    userMessage: string,
    phase: CurioLoopPhase,
    conversationHistory: string[] = []
  ): Promise<CurioBotResponse> {
    // Fallback responses when OpenAI is not configured
    if (!openai) {
      return this.getFallbackResponse(phase, userMessage);
    }

    try {
      const systemPrompt = this.getSystemPrompt(phase);
      
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...conversationHistory.map(msg => ({ role: 'user' as const, content: msg })),
        { role: 'user' as const, content: userMessage }
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      });

      const response = completion.choices[0]?.message?.content || 'I apologize, but I need a moment to process that. Could you please try again?';
      
      // Determine if we should move to next phase
      const nextPhase = this.determineNextPhase(userMessage, response, phase);
      
      return {
        message: response,
        nextPhase,
        isComplete: phase === 'remix'
      };
    } catch (error) {
      console.error('Error generating CurioBot response:', error);
      return this.getFallbackResponse(phase, userMessage);
    }
  }

  private getFallbackResponse(phase: CurioLoopPhase, userMessage: string): CurioBotResponse {
    // Handle commit phase specially to capture experiment timing
    if (phase === 'commit') {
      return this.handleCommitPhase(userMessage);
    }

    const fallbackResponses = {
      observe: "Great! I can see your curiosity about that. Let's turn this into a quick experiment. What specific aspect of this do you want to test or explore?",
      hypothesize: "Perfect! Now let's make this specific and measurable. What exactly will you do? And how will you know if it's working? (Example: 'What if I wake up 30 minutes earlier and I measure how energetic I feel on a 1-10 scale?')",
      commit: "Excellent! Now let's commit to trying this. How many days do you want to run this experiment? (I recommend 3-7 days to start)",
      run: "How's your experiment going? What have you tried and what are you noticing?",
      reflect: "Nice work completing your experiment! What's the biggest thing you learned or discovered?",
      remix: "Great insights! What would you like to explore next - refine this experiment, try something new, or start a different curiosity?"
    };

    // Simple phase progression for demo
    const phaseProgression: Record<CurioLoopPhase, CurioLoopPhase> = {
      observe: 'hypothesize',
      hypothesize: 'commit',
      commit: 'run',
      run: 'run', // Stay in run phase for multiple interactions
      reflect: 'remix',
      remix: 'observe'
    };

    // Check if user seems ready to move to next phase (simple keyword detection)
    const readyKeywords = {
      observe: ['ready', 'curious about', 'want to explore', 'hypothesis', 'experiment'],
      hypothesize: ['commit', 'ready to try', "let's do it", 'pledge', 'promise'],
      commit: ['start', 'begin', 'day 1', 'experiment', 'trying'],
      run: ['reflect', 'learned', 'insights', 'done', 'finished', 'complete'],
      reflect: ['next', 'new experiment', 'remix', 'try again', 'continue'],
      remix: ['start over', 'new curiosity', 'begin again', 'observe']
    };

    const keywords = readyKeywords[phase] || [];
    const isReady = keywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword)
    );

    const nextPhase = isReady ? phaseProgression[phase] : undefined;

    return {
      message: fallbackResponses[phase],
      nextPhase,
      isComplete: phase === 'remix'
    };
  }

  private handleCommitPhase(userMessage: string): CurioBotResponse {
    // Check if this is the first commitment message or a follow-up with timing details
    const hasCommitment = ['commit', 'pledge', 'promise', 'will try', 'going to'].some(keyword => 
      userMessage.toLowerCase().includes(keyword)
    );

    if (hasCommitment) {
      // First commitment - ask for timing details
      return {
        message: `Perfect! Now let's set a timeline. When do you want to start and how long?

Quick examples:
- "Tomorrow for 5 days"
- "Today for 3 days" 
- "Monday for 1 week"

Keep it short - 3-7 days is usually perfect for learning something new!`,
        nextPhase: 'commit' // Stay in commit phase until we get timing
      };
    }

    // Check for timing information
    const timingKeywords = {
      start: ['start', 'begin', 'starting', 'tomorrow', 'today', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      duration: ['days', 'weeks', 'week', 'day', 'for', 'duration', 'length', 'period']
    };

    const hasStartTime = timingKeywords.start.some(keyword => 
      userMessage.toLowerCase().includes(keyword)
    );
    const hasDuration = timingKeywords.duration.some(keyword => 
      userMessage.toLowerCase().includes(keyword)
    );

    if (hasStartTime && hasDuration) {
      // Extract timing details (simplified parsing)
      const startDate = this.extractStartDate(userMessage);
      const duration = this.extractDuration(userMessage);
      
      const startTime = new Date(startDate);
      const checkInTime = new Date(startTime.getTime() + (24 * 60 * 60 * 1000)); // 24 hours later

      return {
        message: `Awesome! Your experiment starts ${this.formatStartTime(startDate)} for ${duration} days.

I'll check in with you tomorrow to see how it's going. 

Ready to start experimenting? 🚀`,
        nextPhase: 'run',
        followUpTime: checkInTime,
        experimentDetails: {
          startDate: startTime,
          duration: duration,
          checkInFrequency: 'daily'
        }
      };
    } else {
      // Still need timing information
      return {
        message: `Almost there! Just need timing details:

When do you want to start? (today, tomorrow, Monday, etc.)
How long? (3-7 days recommended)

Example: "Tomorrow for 5 days"`,
        nextPhase: 'commit'
      };
    }
  }

  private extractStartDate(message: string): Date {
    const now = new Date();
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('today')) {
      return now;
    } else if (lowerMessage.includes('tomorrow')) {
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    } else if (lowerMessage.includes('monday')) {
      const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
      return new Date(now.getTime() + daysUntilMonday * 24 * 60 * 60 * 1000);
    } else {
      // Default to tomorrow if unclear
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  private extractDuration(message: string): number {
    const lowerMessage = message.toLowerCase();
    
    // Look for numbers followed by "day" or "week"
    const dayMatch = lowerMessage.match(/(\d+)\s*day/);
    if (dayMatch) {
      return parseInt(dayMatch[1]);
    }
    
    const weekMatch = lowerMessage.match(/(\d+)\s*week/);
    if (weekMatch) {
      return parseInt(weekMatch[1]) * 7;
    }
    
    // Default to 7 days
    return 7;
  }

  private formatStartTime(startDate: Date): string {
    const now = new Date();
    const diffTime = startDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'today';
    } else if (diffDays === 1) {
      return 'tomorrow';
    } else {
      return `in ${diffDays} days`;
    }
  }

  private determineNextPhase(
    userMessage: string,
    botResponse: string,
    currentPhase: CurioLoopPhase
  ): CurioLoopPhase | undefined {
    // Simple phase progression logic
    // In a real implementation, this would be more sophisticated
    const phaseProgression: Record<CurioLoopPhase, CurioLoopPhase> = {
      observe: 'hypothesize',
      hypothesize: 'commit',
      commit: 'run',
      run: 'run', // Stay in run phase for multiple days
      reflect: 'remix',
      remix: 'observe' // Start new cycle
    };

    // Check if user seems ready to move to next phase
    const readyKeywords = {
      observe: ['ready', 'curious about', 'want to explore', 'hypothesis'],
      hypothesize: ['commit', 'ready to try', 'let\'s do it', 'pledge'],
      commit: ['start', 'begin', 'day 1', 'experiment'],
      run: ['reflect', 'learned', 'insights', 'done'],
      reflect: ['next', 'new experiment', 'remix', 'try again'],
      remix: ['start over', 'new curiosity', 'begin again']
    };

    const keywords = readyKeywords[currentPhase] || [];
    const isReady = keywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword) ||
      botResponse.toLowerCase().includes(keyword)
    );

    return isReady ? phaseProgression[currentPhase] : undefined;
  }

  async generatePhaseTransitionMessage(
    fromPhase: CurioLoopPhase,
    toPhase: CurioLoopPhase
  ): Promise<string> {
    const transitions = {
      'observe→hypothesize': "Great! Now let's turn that curiosity into a testable experiment. What do you think might happen if you explored this further?",
      'hypothesize→commit': "Perfect! You've got a solid experiment planned. Now let's make a commitment. Write a one-line pledge about your commitment to this curiosity experiment.",
      'commit→run': "Excellent! Your experiment starts now. I'll check in with you each day to see how it's going. What did you try today?",
      'run→reflect': "Congratulations on completing your experiment! Let's reflect on what you learned. What insights did you gain?",
      'reflect→remix': "Based on your reflection, what would you like to explore next? A new experiment, a refinement, or something completely different?",
      'remix→observe': "Let's start a new curiosity journey! What's something that caught your attention recently?"
    };

    const transitionKey = `${fromPhase}→${toPhase}`;
    return transitions[transitionKey as keyof typeof transitions] || 
           "Let's move to the next phase of your CurioLoop journey.";
  }
}
