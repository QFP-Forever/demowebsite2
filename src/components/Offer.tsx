import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, PiggyBank, TrendingUp } from 'lucide-react';

export const Offer: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const offers = [
    {
      icon: FileText,
      title: t('offer.block1.title1'),
      description: t('offer.block1.title2'),
      link: '/tax-declaration'
    },
    {
      icon: PiggyBank,
      title: t('offer.block2.title1'),
      description: t('offer.block2.title2'),
      link: '/budget'
    },
    {
      icon: TrendingUp,
      title: t('offer.block3.title1'),
      description: t('offer.block3.title2'),
      link: '/wealth'
    }
  ];

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    // First navigate to the new route
    navigate(path);
    // Then scroll to top immediately
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  return (
    <section id="offer" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12 animate-fade-in-up">
          {t('offer.title')}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {offers.map((offer, index) => (
            <div 
              key={index} 
              className={`bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up-${index + 1}`}
            >
              <div className="mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 transform transition-transform group-hover:scale-110">
                  <offer.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{offer.title}</h3>
                <p className="text-gray-600 mb-4">{offer.description}</p>
              </div>
              <a
                href={offer.link}
                onClick={(e) => handleNavigation(e, offer.link)}
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors inline-flex items-center"
              >
                {t('common.learnMore')} →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};