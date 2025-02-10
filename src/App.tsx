import React, { useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Offer } from './components/Offer';
import { HowItWorks } from './components/HowItWorks';
import { Pricing } from './components/Pricing';
import { Footer } from './components/Footer';
import { FeedbackModal } from './components/FeedbackModal';
import { RatingModal } from './components/RatingModal';
import { TaxDeclarationPage } from './pages/TaxDeclarationPage';
import { BudgetPage } from './pages/BudgetPage';
import { WealthPage } from './pages/WealthPage';
import { useFeedbackModal } from './hooks/useFeedbackModal';
import { useRatingModal } from './hooks/useRatingModal';
import './i18n';

declare global {
  interface Window {
    clarity: any;
  }
}

function ScrollToSection() {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      // Clear the state after scrolling
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return null;
}

function App() {
  const { isOpen: isFeedbackOpen, ctaSource: feedbackSource, openModal: openFeedback, closeModal: closeFeedback } = useFeedbackModal();
  const { isOpen: isRatingOpen, ctaSource: ratingSource, openModal: openRating, closeModal: closeRating } = useRatingModal();

  useEffect(() => {
    // Microsoft Clarity initialization
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "pws7ncyw1n");
    `;
    document.head.appendChild(script);
  }, []);

  const handleFeedbackSuccess = useCallback(() => {
    if (!feedbackSource) return;
    
    // Find the component that triggered the feedback and update its state
    const source = feedbackSource.split('.')[0];
    const sectionId = source === 'taxDeclaration' ? 'tax-declaration' : source;
    const component = document.getElementById(sectionId);
    if (component) {
      const event = new CustomEvent('feedbackSubmitted');
      component.dispatchEvent(event);
    }
  }, [feedbackSource]);

  const HomePage = () => (
    <>
      <Hero />
      <Offer />
      <HowItWorks />
      <Pricing />
    </>
  );

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header onFeedback={openFeedback} />
        <ScrollToSection />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tax-declaration" element={<TaxDeclarationPage onFeedback={openRating} />} />
          <Route path="/budget" element={<BudgetPage onFeedback={openRating} />} />
          <Route path="/wealth" element={<WealthPage onFeedback={openRating} />} />
        </Routes>
        <Footer onFeedback={openFeedback} />
        <FeedbackModal
          isOpen={isFeedbackOpen}
          onClose={closeFeedback}
          ctaSource={feedbackSource}
          onSubmitSuccess={handleFeedbackSuccess}
        />
        <RatingModal
          isOpen={isRatingOpen}
          onClose={closeRating}
          ctaSource={ratingSource}
        />
      </div>
    </Router>
  );
}

export default App;