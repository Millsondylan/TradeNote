import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import localDatabase, { Trade as TradeType } from '../lib/localDatabase';
import { useUser } from '../contexts/UserContext';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, MessageSquare, Send, Loader } from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'analysis' | 'recommendation' | 'warning' | 'tip';
  title: string;
  content: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
}

interface AIConversation {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
}

const AICoach: React.FC = () => {
  const { state: userState } = useUser();
  const [trades, setTrades] = useState<TradeType[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await localDatabase.initialize();
      const allTrades = await localDatabase.getTrades();
      setTrades(allTrades);
      
      // Generate initial insights
      generateInsights(allTrades);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const generateInsights = async (tradeData: TradeType[]) => {
    setIsGeneratingInsights(true);
    try {
      // Simulate AI analysis - in real app, this would use aiStreamService
      const mockInsights: AIInsight[] = [
        {
          id: '1',
          type: 'analysis',
          title: 'Portfolio Performance Analysis',
          content: `Your portfolio shows a ${tradeData.length > 0 ? 'positive' : 'neutral'} trend. ${tradeData.length} trades analyzed with focus on risk management.`,
          timestamp: new Date().toISOString(),
          priority: 'medium'
        },
        {
          id: '2',
          type: 'recommendation',
          title: 'Risk Management Suggestion',
          content: 'Consider implementing tighter stop-losses on your swing trades to protect against market volatility.',
          timestamp: new Date().toISOString(),
          priority: 'high'
        },
        {
          id: '3',
          type: 'tip',
          title: 'Trading Psychology Tip',
          content: 'Your recent trades show good discipline. Remember to stick to your trading plan and avoid emotional decisions.',
          timestamp: new Date().toISOString(),
          priority: 'low'
        }
      ];
      
      setInsights(mockInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const askAI = async () => {
    if (!currentQuestion.trim()) return;

    setIsLoading(true);
    try {
      // Simulate AI response - in real app, this would use aiStreamService
      const mockAnswer = `Based on your trading history, here's my analysis: ${currentQuestion.includes('risk') ? 'Focus on position sizing and stop-losses.' : 'Consider market conditions and your trading strategy.'}`;
      
      const newConversation: AIConversation = {
        id: Date.now().toString(),
        question: currentQuestion,
        answer: mockAnswer,
        timestamp: new Date().toISOString()
      };
      
      setConversations(prev => [newConversation, ...prev]);
      setCurrentQuestion('');
    } catch (error) {
      console.error('Error asking AI:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'analysis':
        return <TrendingUp className="w-5 h-5 text-primary-400" />;
      case 'recommendation':
        return <Lightbulb className="w-5 h-5 text-yellow-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'tip':
        return <Brain className="w-5 h-5 text-green-400" />;
      default:
        return <Brain className="w-5 h-5 text-primary-400" />;
    }
  };

  const getPriorityColor = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-500/50 bg-red-500/10';
      case 'medium':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'low':
        return 'border-green-500/50 bg-green-500/10';
      default:
        return 'border-primary-500/50 bg-primary-500/10';
    }
  };

  return (
    <div className="px-4 pt-4 pb-24 min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-primary-300 drop-shadow-glow">AI Coach</h1>
        <button
          onClick={() => generateInsights(trades)}
          disabled={isGeneratingInsights}
          className="bg-primary-500 hover:bg-primary-600 text-white rounded-full px-4 py-2 shadow-holographic transition-all duration-200 active:scale-95 disabled:opacity-50"
        >
          {isGeneratingInsights ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Brain className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border border-dark-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Trades</span>
            <span className="text-lg font-bold text-white">{trades.length}</span>
          </div>
          <div className="text-xs text-gray-400">Analyzed by AI</div>
        </div>

        <div className="bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border border-dark-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">AI Insights</span>
            <span className="text-lg font-bold text-primary-400">{insights.length}</span>
          </div>
          <div className="text-xs text-gray-400">Active recommendations</div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">AI Insights</h2>
        <div className="space-y-4">
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No insights yet. Generate insights to get started.</p>
            </div>
          ) : (
            insights.map(insight => (
              <div
                key={insight.id}
                className={`bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border ${getPriorityColor(insight.priority)}`}
              >
                <div className="flex items-start space-x-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{insight.title}</h3>
                    <p className="text-gray-300 text-sm mb-2">{insight.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {new Date(insight.timestamp).toLocaleDateString()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        insight.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        insight.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {insight.priority} priority
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Chat */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Ask AI Coach</h2>
        
        {/* Chat Input */}
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={currentQuestion}
            onChange={(e) => setCurrentQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && askAI()}
            placeholder="Ask about your trading strategy, risk management, or market analysis..."
            className="flex-1 px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
            disabled={isLoading}
          />
          <button
            onClick={askAI}
            disabled={isLoading || !currentQuestion.trim()}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Chat History */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Start a conversation with your AI coach</p>
            </div>
          ) : (
            conversations.map(conversation => (
              <div key={conversation.id} className="space-y-3">
                {/* Question */}
                <div className="flex justify-end">
                  <div className="bg-primary-500/20 border border-primary-500/50 rounded-lg p-3 max-w-xs">
                    <p className="text-white text-sm">{conversation.question}</p>
                  </div>
                </div>
                
                {/* Answer */}
                <div className="flex justify-start">
                  <div className="bg-dark-700 border border-dark-600 rounded-lg p-3 max-w-xs">
                    <p className="text-gray-300 text-sm">{conversation.answer}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/add-trade')}
            className="bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border border-dark-700 hover:border-primary-500/50 transition-colors"
          >
            <TrendingUp className="w-6 h-6 text-primary-400 mx-auto mb-2" />
            <span className="text-white text-sm">Add Trade</span>
          </button>
          
          <button
            onClick={() => navigate('/history')}
            className="bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border border-dark-700 hover:border-primary-500/50 transition-colors"
          >
            <Brain className="w-6 h-6 text-primary-400 mx-auto mb-2" />
            <span className="text-white text-sm">View History</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICoach; 