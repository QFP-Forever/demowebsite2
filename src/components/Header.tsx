import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ChevronDown, Menu, X } from 'lucide-react';

interface HeaderProps {
  onFeedback: (source: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onFeedback }) => {
  const { t } = useTranslation();
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = {
    offer: t('header.nav.offer'),
    howItWorks: t('header.nav.howItWorks'),
    pricing: t('header.nav.pricing')
  };

  const serviceItems = [
    { key: 'tax_declaration', href: '/tax-declaration' },
    { key: 'budget', href: '/budget' },
    { key: 'investment', href: '/wealth' },
  ];

  const handleSignupClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onFeedback('header.signup');
  };

  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleServiceNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    setIsServicesOpen(false);
    setIsMobileMenuOpen(false);
    
    navigate(path);
    
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  return (
    <header className="fixed w-full bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link 
              to="/" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-2xl font-bold text-blue-600"
            >
              BudgetEase
            </Link>
          </div>
          
          {/* Mobile menu button and language switcher */}
          <div className="flex items-center gap-4 md:hidden">
            <LanguageSwitcher />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex items-center space-x-6">
              {Object.entries(navItems).map(([key, value]) => (
                <a
                  key={key}
                  href={`#${key}`}
                  onClick={(e) => handleNavigation(e, key)}
                  className="text-gray-600 hover:text-gray-900 transition-colors relative group"
                >
                  {value}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </a>
              ))}
              
              <div className="relative group">
                <button
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
                  onMouseEnter={() => setIsServicesOpen(true)}
                  onMouseLeave={() => setIsServicesOpen(false)}
                >
                  <span>{t('header.nav.services')}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                <div
                  className={`absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg transition-all duration-200 ${
                    isServicesOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                  }`}
                  onMouseEnter={() => setIsServicesOpen(true)}
                  onMouseLeave={() => setIsServicesOpen(false)}
                >
                  <div className="py-1">
                    {serviceItems.map((item) => (
                      <a
                        key={item.key}
                        href={item.href}
                        onClick={(e) => handleServiceNavigation(e, item.href)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        {t(`services.${item.key}`)}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </nav>
            
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <button
                onClick={handleSignupClick}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all hover:scale-105 shadow-sm hover:shadow-md"
              >
                {t('header.signup')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden bg-white`}
      >
        <div className="px-4 pt-2 pb-3 space-y-1 border-t">
          {Object.entries(navItems).map(([key, value]) => (
            <a
              key={key}
              href={`#${key}`}
              onClick={(e) => {
                handleNavigation(e, key);
                handleMobileNavClick();
              }}
              className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            >
              {value}
            </a>
          ))}
          
          <div className="space-y-1">
            <div className="px-3 py-2 text-base font-medium text-gray-600">
              {t('header.nav.services')}
            </div>
            {serviceItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                onClick={(e) => handleServiceNavigation(e, item.href)}
                className="block px-3 py-2 pl-6 text-base text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              >
                {t(`services.${item.key}`)}
              </a>
            ))}
          </div>
          
          <div className="pt-4">
            <div className="px-3">
              <button
                onClick={(e) => {
                  handleSignupClick(e);
                  handleMobileNavClick();
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all text-center"
              >
                {t('header.signup')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};