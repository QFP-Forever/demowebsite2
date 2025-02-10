import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileCheck, Target, Coffee } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const { t } = useTranslation();

  const steps = [
    {
      number: '01',
      icon: FileCheck,
      heading: t('howItWorks.step1.heading'),
      description: t('howItWorks.step1.description')
    },
    {
      number: '02',
      icon: Target,
      heading: t('howItWorks.step2.heading'),
      description: t('howItWorks.step2.description')
    },
    {
      number: '03',
      icon: Coffee,
      heading: t('howItWorks.step3.heading'),
      description: t('howItWorks.step3.description')
    }
  ];

  const handleCtaClick = () => {
    try {
      window.clarity?.('track', 'HowItWorksCtaClick');
    } catch (error) {
      console.error('Error tracking CTA click:', error);
    }
  };

  return (
    <section id="howItWorks" className="py-16 md:py-24 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12 md:mb-20 animate-fade-in-up">
          {t('howItWorks.title')}
        </h2>

        <div className="space-y-8 md:space-y-20 max-w-3xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={`step-${index}`}
              className={`relative group animate-fade-in-up-${index + 1}`}
            >
              {/* Mobile Layout */}
              <div className="md:hidden">
                <div className="flex flex-col items-center text-center px-4">
                  {/* Horizontal alignment of number and icon */}
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <span className="text-4xl font-bold text-blue-200 select-none min-w-[3rem] text-right">
                      {step.number}
                    </span>
                    <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 shadow-lg">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  {/* Content below the number-icon pair */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      {step.heading}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:block">
                <div className="flex items-start gap-8">
                  <div className="flex items-start gap-6">
                    <span className="text-5xl font-bold text-blue-200 select-none w-16 text-right shrink-0">
                      {step.number}
                    </span>
                    <div className="w-20 h-20 bg-blue-600 rounded-xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 shadow-lg shrink-0">
                      <step.icon className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 pt-3">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {step.heading}
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connecting Line (Desktop Only) */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[4.5rem] top-28 w-0.5 h-24 bg-gradient-to-b from-blue-200 to-transparent"></div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* CTA Button */}
        <div className="text-center mt-12 md:mt-20 animate-fade-in-up-4">
          <a
            href={t('howItWorks.cta_url')}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCtaClick}
            className="inline-block px-8 py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95"
            aria-label={t('howItWorks.cta')}
          >
            {t('howItWorks.cta')}
          </a>
        </div>
      </div>
    </section>
  );
};