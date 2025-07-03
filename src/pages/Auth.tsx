import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { 
  User, 
  TrendingUp, 
  Shield, 
  Target,
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  fields: {
    name: string;
    label: string;
    type: string;
    options?: string[];
    required: boolean;
  }[];
}

const Auth: React.FC = () => {
  const { state: userState, signup } = useUser();
  const [username, setUsername] = useState('');
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    tradingStyle: '',
    riskTolerance: 'medium',
    experienceLevel: 'beginner',
    preferredMarkets: [] as string[],
    tradingGoals: [] as string[]
  });

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'trading-style',
      title: 'Trading Style',
      description: 'What type of trader are you?',
      icon: <TrendingUp className="w-8 h-8 text-primary-400" />,
      fields: [
        {
          name: 'tradingStyle',
          label: 'Trading Style',
          type: 'select',
          options: ['Day Trader', 'Swing Trader', 'Position Trader', 'Scalper', 'Investor'],
          required: true
        }
      ]
    },
    {
      id: 'risk-tolerance',
      title: 'Risk Tolerance',
      description: 'How much risk are you comfortable with?',
      icon: <Shield className="w-8 h-8 text-primary-400" />,
      fields: [
        {
          name: 'riskTolerance',
          label: 'Risk Tolerance',
          type: 'select',
          options: ['Conservative', 'Moderate', 'Aggressive'],
          required: true
        }
      ]
    },
    {
      id: 'experience',
      title: 'Experience Level',
      description: 'How long have you been trading?',
      icon: <Target className="w-8 h-8 text-primary-400" />,
      fields: [
        {
          name: 'experienceLevel',
          label: 'Experience Level',
          type: 'select',
          options: ['Beginner (0-1 years)', 'Intermediate (1-3 years)', 'Advanced (3+ years)'],
          required: true
        }
      ]
    },
    {
      id: 'markets',
      title: 'Preferred Markets',
      description: 'Which markets do you trade?',
      icon: <TrendingUp className="w-8 h-8 text-primary-400" />,
      fields: [
        {
          name: 'preferredMarkets',
          label: 'Markets',
          type: 'multiselect',
          options: ['Forex', 'Stocks', 'Crypto', 'Commodities', 'Indices', 'Options'],
          required: true
        }
      ]
    }
  ];

  const handleOnboardingChange = (field: string, value: any) => {
    setOnboardingData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }
    
    setIsOnboarding(true);
  };

  const handleOnboardingSubmit = async () => {
    try {
      // Complete signup with username and onboarding data
      await signup(username, onboardingData);
      console.log('Signup completed:', { username, onboardingData });
    } catch (error) {
      console.error('Signup error:', error);
      alert(error instanceof Error ? error.message : 'Signup failed');
    }
  };

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleOnboardingSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = onboardingSteps[currentStep];

  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Step {currentStep + 1} of {onboardingSteps.length}</span>
              <span className="text-sm text-primary-400">{Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-dark-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-dark-800/50 backdrop-blur-lg rounded-xl p-8 border border-dark-700">
            <div className="text-center mb-6">
              {currentStepData.icon}
              <h2 className="text-2xl font-bold text-white mt-4">{currentStepData.title}</h2>
              <p className="text-gray-400 mt-2">{currentStepData.description}</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-6">
              {currentStepData.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {field.label}
                  </label>
                  
                  {field.type === 'select' && (
                    <select
                      value={onboardingData[field.name as keyof typeof onboardingData] as string}
                      onChange={(e) => handleOnboardingChange(field.name, e.target.value)}
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                      required={field.required}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  )}

                  {field.type === 'multiselect' && (
                    <div className="space-y-2">
                      {field.options?.map((option) => (
                        <label key={option} className="flex items-center space-x-3 p-3 bg-dark-700 rounded-lg border border-dark-600 hover:border-primary-500/50 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(onboardingData[field.name as keyof typeof onboardingData] as string[]).includes(option)}
                            onChange={(e) => {
                              const current = onboardingData[field.name as keyof typeof onboardingData] as string[];
                              const updated = e.target.checked
                                ? [...current, option]
                                : current.filter(item => item !== option);
                              handleOnboardingChange(field.name, updated);
                            }}
                            className="w-4 h-4 text-primary-600 bg-dark-600 border-dark-500 rounded focus:ring-primary-500 focus:ring-2"
                          />
                          <span className="text-white">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex items-center justify-between pt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 rounded-lg text-white font-medium transition-all duration-300 hover:shadow-holographic"
                >
                  <span>{currentStep === onboardingSteps.length - 1 ? 'Complete' : 'Next'}</span>
                  {currentStep === onboardingSteps.length - 1 ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
            TradeNote
          </h1>
          <p className="text-gray-400 mt-2">Your AI-Powered Trading Journal</p>
        </div>

        {/* Signup Form */}
        <div className="bg-dark-800/50 backdrop-blur-lg rounded-xl p-8 border border-dark-700">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Welcome to TradeNote</h2>
            <p className="text-gray-400 mt-2">Create your trading profile to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Choose a Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={userState.isLoading || !username.trim()}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 rounded-lg text-white font-medium transition-all duration-300 hover:shadow-holographic disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {userState.isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                'Get Started'
              )}
            </button>

            {userState.error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {userState.error}
              </div>
            )}
          </form>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 gap-4">
          <div className="bg-dark-800/30 backdrop-blur-lg rounded-lg p-4 border border-dark-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">AI-Powered Insights</h3>
                <p className="text-gray-400 text-sm">Get intelligent trading recommendations</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-800/30 backdrop-blur-lg rounded-lg p-4 border border-dark-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-secondary-500/20 rounded-lg">
                <Shield className="w-5 h-5 text-secondary-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Risk Management</h3>
                <p className="text-gray-400 text-sm">Advanced risk analysis and alerts</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-800/30 backdrop-blur-lg rounded-lg p-4 border border-dark-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Target className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Performance Tracking</h3>
                <p className="text-gray-400 text-sm">Comprehensive analytics and metrics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth; 