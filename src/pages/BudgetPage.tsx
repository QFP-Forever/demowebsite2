import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Target, LineChart, Lightbulb, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { SmileyFeedback } from '../components/SmileyFeedback';

interface BudgetPageProps {
  onFeedback: (source: string) => void;
}

export const BudgetPage: React.FC<BudgetPageProps> = ({ onFeedback }) => {
  const { t } = useTranslation();
  const [showAcknowledgment, setShowAcknowledgment] = useState(false);

  useEffect(() => {
    const handleFeedbackSubmitted = () => {
      setShowAcknowledgment(true);
    };

    const element = document.getElementById('budget');
    element?.addEventListener('feedbackSubmitted', handleFeedbackSubmitted);

    return () => {
      element?.removeEventListener('feedbackSubmitted', handleFeedbackSubmitted);
    };
  }, []);

  const features = [
    {
      icon: Target,
      title: t('budget.features.projects.title'),
      description: t('budget.features.projects.description')
    },
    {
      icon: LineChart,
      title: t('budget.features.planning.title'),
      description: t('budget.features.planning.description')
    },
    {
      icon: Lightbulb,
      title: t('budget.features.tracking.title'),
      description: t('budget.features.tracking.description')
    },
    {
      icon: ArrowUpRight,
      title: t('budget.features.ai.title'),
      description: t('budget.features.ai.description')
    }
  ];

  return (
    <div className="min-h-screen pt-16">
      <section id="budget" className="relative py-20 px-4 bg-gradient-to-br from-[#EDF2F7] to-white overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 z-0 opacity-50">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2D3748" strokeWidth="0.5" strokeOpacity="0.1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Modern Budget Illustration */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 -translate-x-1/4 w-1/2 h-1/2 opacity-10 md:opacity-20 pointer-events-none select-none">
          <svg
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            aria-hidden="true"
            role="presentation"
          >
            <g className="animate-float">
              {/* Graph Background */}
              <rect
                x="50"
                y="50"
                width="300"
                height="300"
                rx="20"
                fill="#4299E1"
                fillOpacity="0.1"
                className="animate-draw"
              />
              {/* Graph Lines */}
              <g stroke="#4299E1" strokeWidth="4" strokeLinecap="round" className="animate-draw">
                <path
                  d="M100 300 L160 220 L220 260 L280 180"
                  fill="none"
                  strokeOpacity="0.3"
                />
                <path
                  d="M100 250 L160 200 L220 230 L280 150"
                  fill="none"
                  strokeOpacity="0.2"
                />
                {/* Vertical Grid Lines */}
                <line x1="160" y1="300" x2="160" y2="100" strokeOpacity="0.1" strokeDasharray="4 4" />
                <line x1="220" y1="300" x2="220" y2="100" strokeOpacity="0.1" strokeDasharray="4 4" />
                <line x1="280" y1="300" x2="280" y2="100" strokeOpacity="0.1" strokeDasharray="4 4" />
              </g>
              {/* Data Points */}
              <g className="animate-draw">
                <circle cx="160" cy="220" r="6" fill="#4299E1" fillOpacity="0.3" />
                <circle cx="220" cy="260" r="6" fill="#4299E1" fillOpacity="0.3" />
                <circle cx="280" cy="180" r="6" fill="#4299E1" fillOpacity="0.3" />
              </g>
            </g>
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="tax-title mb-6 animate-fade-in-up leading-[1.2] py-2">
              {t('budget.title1')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up-1">
              {t('budget.title2')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up-${index + 1}`}
              >
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-[#EDF2F7] flex items-center justify-center transform transition-transform group-hover:scale-110 group-hover:bg-[#4299E1] group-hover:text-white">
                      <feature.icon className="w-6 h-6 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-[#2D3748]">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            {showAcknowledgment ? (
              <div className="inline-flex items-center gap-2 text-gray-700 font-medium bg-blue-50 px-6 py-3 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                {t('feedback.acknowledgment.budget')}
              </div>
            ) : (
              <SmileyFeedback pageId="budget" onSubmit={() => setShowAcknowledgment(true)} />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};