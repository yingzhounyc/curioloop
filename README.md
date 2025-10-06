# CurioLoop MVP

A digital platform that helps people cultivate curiosity and an experimental mindset through daily self-directed reflection and action.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env.local
   ```
   
   Then edit `.env.local` with your API keys:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - `OPENAI_API_KEY` - Your OpenAI API key

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧭 The CurioLoop Process

CurioLoop guides users through a 6-phase journey:

1. **🔍 Observe** - Notice what catches your curiosity
2. **💡 Hypothesize** - Turn curiosity into a testable idea
3. **📜 Commit** - Make a personal pledge
4. **🔄 Run** - Execute your experiment (7 days)
5. **🪞 Reflect** - Learn from the experience
6. **🧩 Remix** - Design your next experiment

## 🤖 CurioBot Features

- **Conversational AI** powered by GPT-4
- **Structured guidance** through each phase
- **Progress tracking** with streaks and completion metrics
- **Mobile-responsive** chat interface
- **No signup required** for MVP testing

## 🏗️ Tech Stack

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Next.js API routes
- **Database:** Supabase (PostgreSQL)
- **AI:** OpenAI GPT-4 API
- **Deployment:** Vercel (recommended)

## 📱 MVP Features

### Core Functionality
- ✅ Single-page chat interface
- ✅ CurioBot conversation flow
- ✅ 6-phase CurioLoop process
- ✅ Progress tracking visualization
- ✅ Mobile-responsive design

### Planned Features (Phase 2)
- [ ] User authentication & data persistence
- [ ] Experiment history & analytics
- [ ] Daily check-in reminders
- [ ] Social sharing capabilities
- [ ] Advanced AI coaching

## 🎯 Success Metrics

- **Engagement:** Users return for 7+ days
- **Completion:** Users finish full CurioLoop cycles
- **Retention:** Regular usage patterns
- **Behavioral Change:** Users describe increased curiosity

## 🚀 Deployment

1. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Set environment variables** in Vercel dashboard

3. **Configure Supabase** with your production database

## 🔧 Development

### Project Structure
```
src/
├── app/                 # Next.js app router
│   ├── api/            # API endpoints
│   ├── chat/           # Chat interface page
│   └── page.tsx        # Landing page
├── components/         # React components
│   ├── ChatInterface.tsx
│   ├── MessageBubble.tsx
│   └── ProgressTracker.tsx
├── lib/                # Utilities
│   ├── curiobot.ts    # AI conversation logic
│   └── supabase.ts    # Database client
└── types/              # TypeScript definitions
    └── index.ts
```

### Key Components

- **ChatInterface:** Main chat UI with message handling
- **CurioBot:** AI conversation logic with phase management
- **ProgressTracker:** Visual progress indicators
- **MessageBubble:** Individual message display

## 📊 Database Schema

```sql
-- Users table
users (
  id: uuid (primary key)
  email: string
  current_experiment_id: uuid (nullable)
  total_experiments: integer
  streak_days: integer
  last_active: timestamp
)

-- Experiments table
experiments (
  id: uuid (primary key)
  user_id: uuid (foreign key)
  title: string
  curiosity: text
  hypothesis: text
  commitment: text
  status: enum (active, completed, abandoned)
  start_date: timestamp
  end_date: timestamp (nullable)
)

-- Conversations table
conversations (
  id: uuid (primary key)
  user_id: uuid (foreign key)
  experiment_id: uuid (foreign key)
  message_type: enum (user, bot, system)
  content: text
  phase: enum (observe, hypothesize, commit, run, reflect, remix)
  created_at: timestamp
)
```

## 🧪 Testing the MVP

1. **Start a conversation** with CurioBot
2. **Follow the 6-phase process** from observation to remix
3. **Test mobile responsiveness** on different devices
4. **Validate conversation flow** and phase transitions
5. **Check progress tracking** functionality

## 🤝 Contributing

This is an MVP for validation purposes. For production features:
1. Add comprehensive error handling
2. Implement proper authentication
3. Add data persistence
4. Enhance AI conversation logic
5. Add analytics and monitoring

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for curious minds everywhere**