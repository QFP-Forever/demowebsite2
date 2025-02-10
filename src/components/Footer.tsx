import React from 'react';
import { useTranslation } from 'react-i18next';

interface FooterProps {
  onFeedback: (source: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onFeedback }) => {
  const { t } = useTranslation();

  const handleFeedbackClick = () => {
    onFeedback('footer.newsletter');
  };

  const mainNavItems = Object.entries(t('header.nav', { returnObjects: true }));
  const serviceItems = [
    { key: 'tax_declaration', href: '#tax-declaration' },
    { key: 'budget', href: '#budget' },
    { key: 'investment', href: '#wealth' },
  ];

  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Navigation */}
          <div>
            <h3 className="text-xl font-bold mb-4">BudgetEase</h3>
            <nav className="space-y-2">
              {mainNavItems.map(([key, value]) => (
                key !== 'services' && (
                  <a
                    key={key}
                    href={`#${key}`}
                    className="block text-gray-400 hover:text-white transition-colors"
                  >
                    {value}
                  </a>
                )
              ))}
            </nav>
          </div>

          {/* Services Navigation */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('header.nav.services')}</h3>
            <nav className="space-y-2">
              {serviceItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  {t(`services.${item.key}`)}
                </a>
              ))}
            </nav>
          </div>

          {/* Newsletter Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('footer.newsletter.title')}</h3>
            <div className="space-y-4">
              <button
                onClick={handleFeedbackClick}
                className="w-full px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                {t('footer.newsletter.submit')}
              </button>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} BudgetEase. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
};