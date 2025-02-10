import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Shield, Calculator, PiggyBank } from 'lucide-react';

interface TaxDeclarationProps {
  onFeedback: (source: string) => void;
}

export const TaxDeclaration: React.FC<TaxDeclarationProps> = ({ onFeedback }) => {
  const { t } = useTranslation();
  const [showAcknowledgment, setShowAcknowledgment] = useState(false);

  useEffect(() => {
    const handleFeedbackSubmitted = () => {
      setShowAcknowledgment(true);
    };

    const element = document.getElementById('tax-declaration');
    element?.addEventListener('feedbackSubmitted', handleFeedbackSubmitted);

    return () => {
      element?.removeEventListener('feedbackSubmitted', handleFeedbackSubmitted);
    };
  }, []);

  const handleCtaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onFeedback('taxDeclaration.cta');
  };

  const features = [
    {
      icon: FileText,
      title: t('taxDeclaration.features.simplified.title'),
      description: t('taxDeclaration.features.simplified.description')
    },
    {
      icon: Shield,
      title: t('taxDeclaration.features.compliance.title'),
      description: t('taxDeclaration.features.compliance.description')
    },
    {
      icon: Calculator,
      title: t('taxDeclaration.features.deductions.title'),
      description: t('taxDeclaration.features.deductions.description')
    },
    {
      icon: PiggyBank,
      title: t('taxDeclaration.features.pricing.title'),
      description: t('taxDeclaration.features.pricing.description')
    }
  ];

  return (
    <section id="tax-declaration" className="py-20 px-4 bg-gradient-to-br from-emerald-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 animate-fade-in-up">
            {t('taxDeclaration.title1')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up-1">
            {t('taxDeclaration.title2')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`flex gap-6 animate-fade-in-up-${index + 1} group`}
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center transform transition-transform group-hover:scale-110">
                  <feature.icon className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          {showAcknowledgment ? (
            <div className="text-gray-700 font-medium animate-fade-in-up">
              {t('feedback.acknowledgment.tax')}
            </div>
          ) : (
            <button
              onClick={handleCtaClick}
              className="inline-block px-8 py-4 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-all hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:transform active:scale-95"
              aria-label={t('taxDeclaration.cta')}
            >
              {t('taxDeclaration.cta')}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};