import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ChevronDown, LineChart, Calculator, PiggyBank, TrendingUp, Wallet, MessageCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
  type: 'assistant' | 'user';
}

export const Hero: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const conversationStarted = useRef(false);
  const timeoutIds = useRef<NodeJS.Timeout[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  const handleScroll = () => {
    const offerSection = document.getElementById('offer');
    if (offerSection) {
      offerSection.scrollIntoView({ behavior: 'smooth' });
      setShowScrollIndicator(false);
    }
  };

  // Hide scroll indicator when user scrolls
  useEffect(() => {
    const handlePageScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollIndicator(false);
      } else {
        setShowScrollIndicator(true);
      }
    };

    window.addEventListener('scroll', handlePageScroll);
    return () => window.removeEventListener('scroll', handlePageScroll);
  }, []);

  // Reset chat when language changes
  useEffect(() => {
    setMessages([]);
    conversationStarted.current = false;
    timeoutIds.current.forEach(id => clearTimeout(id));
    timeoutIds.current = [];
  }, [i18n.language]);

  // Intersection Observer for animation triggering
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Chat conversation simulation
  useEffect(() => {
    if (conversationStarted.current || !isVisible) return;
    conversationStarted.current = true;

    const conversation = [
      { id: 'init-msg-1', text: t('chat.greeting'), type: 'assistant' as const },
      { id: 'init-msg-2', text: t('chat.userQuery'), type: 'user' as const },
      { id: 'init-msg-3', text: t('chat.response1'), type: 'assistant' as const },
      { id: 'init-msg-4', text: t('chat.userFollow'), type: 'user' as const },
      { id: 'init-msg-5', text: t('chat.response2'), type: 'assistant' as const }
    ];

    const addMessage = (index: number) => {
      if (index >= conversation.length) return;

      setIsTyping(true);

      const typingTimeout = setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => {
          const message = conversation[index];
          if (prev.some(msg => msg.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });

        if (index + 1 < conversation.length) {
          const nextMessageTimeout = setTimeout(() => addMessage(index + 1), 1000);
          timeoutIds.current.push(nextMessageTimeout);
        }
      }, 1500);

      timeoutIds.current.push(typingTimeout);
    };

    addMessage(0);

    return () => {
      timeoutIds.current.forEach(id => clearTimeout(id));
      timeoutIds.current = [];
      conversationStarted.current = false;
    };
  }, [isVisible, t, i18n.language]);

  const isRTL = i18n.dir() === 'rtl';

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center pt-16 overflow-hidden"
      dir={i18n.dir()}
    >
      {/* Background with responsive grid */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50"></div>
        <div className="absolute inset-0">
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern 
                id="grid" 
                width="clamp(20px, 2.5vw, 40px)" 
                height="clamp(20px, 2.5vw, 40px)" 
                patternUnits="userSpaceOnUse"
              >
                <path 
                  d="M 40 0 L 0 0 0 40" 
                  fill="none" 
                  stroke="rgba(59, 130, 246, 0.05)" 
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 py-12 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content Column */}
          <div className={`max-w-2xl mx-auto lg:mx-0 text-center lg:text-${isRTL ? 'right' : 'left'}`}>
            <h1 className={`animate-fade-up ${isVisible ? 'opacity-100' : 'opacity-0'} text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight`}>
              {t('hero.title1')}
            </h1>
            <p className={`animate-fade-up animation-delay-200 ${isVisible ? 'opacity-100' : 'opacity-0'} text-lg sm:text-xl lg:text-2xl text-gray-600 leading-relaxed mb-8 sm:mb-10`}>
              {t('hero.title2')}
            </p>
            <div className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-${isRTL ? 'end' : 'start'} animate-fade-up animation-delay-400 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
              <a
                href={t('hero.cta_url')}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span>{t('hero.cta')}</span>
                <ArrowRight className={`${isRTL ? 'mr-2 rotate-180' : 'ml-2'} w-5 h-5 transform transition-transform group-hover:translate-x-1`} />
              </a>
              <button
                onClick={handleScroll}
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 font-medium rounded-xl border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {t('common.learnMore')}
              </button>
            </div>
          </div>

          {/* Dashboard Interface with Chat */}
          <div className={`relative hidden lg:block ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} transition-all duration-1000 ease-out`}>
            <div className="relative bg-white rounded-2xl shadow-2xl p-6">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
              </div>

              {/* Chat Interface */}
              <div className={`bg-gray-50 rounded-xl p-4 mb-6 ${isRTL ? 'rtl' : 'ltr'}`}>
                <div className="flex items-center space-x-2 mb-4">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-700">{t('chat.title')}</span>
                </div>
                <div className="space-y-4 mb-4 h-48 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 shadow-sm'
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-700 p-3 rounded-lg shadow-sm">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Wallet className="w-6 h-6 text-blue-600 mb-2" />
                  <div className="w-16 h-2 bg-blue-200 rounded mb-1"></div>
                  <div className="w-12 h-2 bg-blue-100 rounded"></div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <PiggyBank className="w-6 h-6 text-green-600 mb-2" />
                  <div className="w-16 h-2 bg-green-200 rounded mb-1"></div>
                  <div className="w-12 h-2 bg-green-100 rounded"></div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
                  <div className="w-16 h-2 bg-purple-200 rounded mb-1"></div>
                  <div className="w-12 h-2 bg-purple-100 rounded"></div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -right-4 -bottom-4 w-full h-full bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl -z-10 transform rotate-3"></div>
            <div className="absolute -left-4 -top-4 w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl -z-10 transform -rotate-3"></div>
          </div>
        </div>

        {/* Mobile Scroll Indicator */}
        <div 
          className={`md:hidden fixed left-1/2 bottom-8 transform -translate-x-1/2 transition-opacity duration-300 ${
            showScrollIndicator ? 'opacity-70' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            onClick={handleScroll}
            className="p-3 rounded-full bg-white/80 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group"
            aria-label={t('common.learnMore')}
          >
            <ChevronDown className="w-6 h-6 text-blue-600 animate-bounce group-hover:text-blue-700" />
          </button>
        </div>
      </div>
    </section>
  );
};