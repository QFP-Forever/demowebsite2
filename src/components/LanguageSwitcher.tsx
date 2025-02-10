import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, X } from 'lucide-react';

const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language);

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <>
      {/* Desktop Dropdown */}
      <div className="relative hidden md:block group">
        <button 
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
          aria-label="Select language"
        >
          <Globe className="w-5 h-5" />
          <span>{currentLanguage?.name}</span>
        </button>
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <span className="mr-2">{lang.flag}</span>
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Fixed Button */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 text-gray-700"
          aria-label="Select language"
        >
          <Globe className="w-5 h-5" />
          <span className="text-sm">{currentLanguage?.flag}</span>
        </button>

        {/* Mobile Full-screen Modal */}
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm">
            <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-xl">
              <div className="relative p-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-4 top-4 p-2 text-gray-500 hover:text-gray-700"
                  aria-label="Close language selector"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <h3 className="text-lg font-semibold mb-4 text-center">
                  Select Language
                </h3>
                
                <div className="space-y-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`flex items-center justify-between w-full p-4 rounded-lg transition-colors ${
                        lang.code === i18n.language
                          ? 'bg-blue-50 text-blue-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-xl mr-3">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                      </div>
                      {lang.code === i18n.language && (
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};