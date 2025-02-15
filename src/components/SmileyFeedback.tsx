import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

interface SmileyFeedbackProps {
  pageId: 'taxDeclaration' | 'budget' | 'wealth';
  onSubmit: () => void;
}

type SmileyRating = '😍' | '🙂' | '🥱' | '☹️';

interface SmileyOption {
  value: SmileyRating;
  label: string;
  description: string;
}

export const SmileyFeedback: React.FC<SmileyFeedbackProps> = ({ pageId, onSubmit }) => {
  const { t, i18n } = useTranslation();
  const [selectedRating, setSelectedRating] = useState<SmileyRating | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const smileys: SmileyOption[] = [
    { value: '😍', label: t('feedback.ratings.love'), description: t(`feedback.pages.${pageId}.ratings.love`) },
    { value: '🙂', label: t('feedback.ratings.like'), description: t(`feedback.pages.${pageId}.ratings.like`) },
    { value: '🥱', label: t('feedback.ratings.neutral'), description: t(`feedback.pages.${pageId}.ratings.neutral`) },
    { value: '☹️', label: t('feedback.ratings.dislike'), description: t(`feedback.pages.${pageId}.ratings.dislike`) }
  ];

  useEffect(() => {
    const checkPreviousVote = async () => {
      try {
        const fingerprint = await generateBrowserFingerprint();
        const { data, error } = await supabase
          .from('feature_ratings')
          .select('rating')
          .eq('browser_fingerprint', fingerprint)
          .eq('cta_source', `${pageId}.cta`)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking previous vote:', error);
          return;
        }

        if (data) {
          setSelectedRating(data.rating as SmileyRating);
          setHasVoted(true);
        }
      } catch (error) {
        console.error('Error checking previous vote:', error);
      }
    };

    checkPreviousVote();
  }, [pageId]);

  const generateBrowserFingerprint = async (): Promise<string> => {
    const components = [
      navigator.userAgent,
      navigator.language,
      new Date().getTimezoneOffset(),
      screen.width,
      screen.height,
      screen.colorDepth,
      navigator.hardwareConcurrency
    ];

    const fingerprint = components.join('|');
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprint);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const getDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  const handleSubmit = async (rating: SmileyRating) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const fingerprint = await generateBrowserFingerprint();
      const browserId = crypto.randomUUID();
      const visitorId = crypto.randomUUID();

      const { error: submitError } = await supabase
        .from('feature_ratings')
        .upsert({
          browser_id: browserId,
          visitor_id: visitorId,
          browser_fingerprint: fingerprint,
          cta_source: `${pageId}.cta`,
          rating,
          language: i18n.language,
          device_type: getDeviceType(),
          last_seen_at: new Date().toISOString()
        }, {
          onConflict: 'browser_fingerprint,cta_source'
        });

      if (submitError) throw submitError;

      setSelectedRating(rating);
      setHasVoted(true);
      onSubmit();

      // Track successful submission
      try {
        window.clarity?.('track', 'SmileyFeedback', {
          page: pageId,
          rating,
          isUpdate: hasVoted
        });
      } catch (error) {
        console.error('Error tracking feedback:', error);
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(t('feedback.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasVoted) {
    return (
      <div className="text-center animate-fade-in-up">
        <div className="inline-flex items-center gap-2 text-gray-700 font-medium bg-blue-50 px-6 py-3 rounded-lg">
          <span className="text-2xl">{selectedRating}</span>
          <span>{t(`feedback.pages.${pageId}.thankYou`)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t(`feedback.pages.${pageId}.question`)}
        </h3>
        <p className="text-gray-600">
          {t(`feedback.pages.${pageId}.description`)}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {smileys.map(({ value, label, description }) => (
          <button
            key={value}
            onClick={() => !isSubmitting && handleSubmit(value)}
            disabled={isSubmitting}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200
              ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300 hover:shadow-md'}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            `}
          >
            <div className="text-4xl mb-2 transform transition-transform hover:scale-110">
              {value}
            </div>
            <div className="text-sm font-medium text-gray-900 mb-1">{label}</div>
            <div className="text-xs text-gray-600">{description}</div>
          </button>
        ))}
      </div>

      {error && (
        <div className="text-center text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};