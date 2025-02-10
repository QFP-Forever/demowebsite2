import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, BarChart, TrendingUp, Compass, CheckCircle2 } from 'lucide-react';
import { SmileyFeedback } from '../components/SmileyFeedback';

interface WealthPageProps {
  onFeedback: (source: string) => void;
}

export const WealthPage: React.FC<WealthPageProps> = ({ onFeedback }) => {
  const { t } = useTranslation();
  const [showAcknowledgment, setShowAcknowledgment] = useState(false);

  useEffect(() => {
    const handleFeedbackSubmitted = () => {
      setShowAcknowledgment(true);
    };

    const element = document.getElementById('wealth');
    element?.addEventListener('feedbackSubmitted', handleFeedbackSubmitted);

    return () => {
      element?.removeEventListener('feedbackSubmitted', handleFeedbackSubmitted);
    };
  }, []);

  const features = [
    {
      icon: Search,
      title: t('wealth.features.opportunities.title'),
      description: t('wealth.features.opportunities.description')
    },
    {
      icon: BarChart,
      title: t('wealth.features.planning.title'),
      description: t('wealth.features.planning.description')
    },
    {
      icon: TrendingUp,
      title: t('wealth.features.returns.title'),
      description: t('wealth.features.returns.description')
    },
    {
      icon: Compass,
      title: t('wealth.features.guidance.title'),
      description: t('wealth.features.guidance.description')
    }
  ];

  return (
    <div className="min-h-screen pt-16">
      <section id="wealth" className="relative py-20 px-4 bg-gradient-to-br from-[#EDF2F7] to-white overflow-hidden">
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

        {/* Modern Wealth Illustration */}
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
              {/* Circular Progress */}
              <circle
                cx="200"
                cy="200"
                r="150"
                stroke="#4299E1"
                strokeWidth="4"
                strokeOpacity="0.1"
                fill="none"
                className="animate-draw"
              />
              <path
                d="M200 50 A150 150 0 1 1 50 200"
                stroke="#4299E1"
                strokeWidth="4"
                strokeOpacity="0.3"
                fill="none"
                className="animate-draw"
              />
              {/* Investment Icons */}
              <g className="animate-draw">
                {/* Stock Chart */}
                <path
                  d="M150 200 L180 170 L210 190 L240 160"
                  stroke="#4299E1"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeOpacity="0.3"
                  fill="none"
                />
                {/* Coin Stack */}
                <circle cx="180" cy="250" r="20" stroke="#4299E1" strokeWidth="4" strokeOpacity="0.2" fill="none" />
                <circle cx="180" cy="240" r="20" stroke="#4299E1" strokeWidth="4" strokeOpacity="0.2" fill="none" />
                <circle cx="180" cy="230" r="20" stroke="#4299E1" strokeWidth="4" strokeOpacity="0.2" fill="none" />
              </g>
            </g>
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="tax-title mb-6 animate-fade-in-up leading-[1.2] py-2">
              {t('wealth.title1')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up-1">
              {t('wealth.title2')}
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
                {t('feedback.acknowledgment.wealth')}
              </div>
            ) : (
              <SmileyFeedback pageId="wealth" onSubmit={() => setShowAcknowledgment(true)} />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};