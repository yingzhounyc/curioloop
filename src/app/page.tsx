import Link from "next/link";
import { Bot, Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Bot className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-blue-600">CurioLoop</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Turn your curiosity into learning through structured experiments. 
              CurioBot guides you through a 6-phase journey from observation to insight.
            </p>
          </div>

          {/* CurioLoop Process */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">
              The CurioLoop Process
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { phase: '🔍 Observe', title: 'Notice what catches your curiosity', desc: 'Build awareness of what sparks your interest' },
                { phase: '💡 Hypothesize', title: 'Turn curiosity into a testable idea', desc: 'Create actionable experiments with clear outcomes' },
                { phase: '📜 Commit', title: 'Make a personal pledge', desc: 'Strengthen intent and accountability' },
                { phase: '🔄 Run', title: 'Execute your experiment', desc: 'Take action and track daily progress' },
                { phase: '🪞 Reflect', title: 'Learn from the experience', desc: 'Extract insights and key learnings' },
                { phase: '🧩 Remix', title: 'Design your next experiment', desc: 'Build on learnings to explore further' }
              ].map((step, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="text-2xl mb-3">{step.phase}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Ready to start your curiosity journey?
            </h3>
            <p className="text-gray-600 mb-6">
              Chat with CurioBot and begin your first experiment today. 
              No signup required - just start exploring!
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              Start Chatting with CurioBot
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-xl">🎯</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Structured Learning</h4>
              <p className="text-gray-600 text-sm">
                Follow a proven framework that turns random curiosity into meaningful insights
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 text-xl">🤖</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">AI Companion</h4>
              <p className="text-gray-600 text-sm">
                CurioBot guides you through each phase with personalized questions and encouragement
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 text-xl">📈</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Track Progress</h4>
              <p className="text-gray-600 text-sm">
                Build streaks, complete experiments, and see your curiosity skills grow over time
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}