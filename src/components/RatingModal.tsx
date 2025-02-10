import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  ctaSource: string;
  onSubmitSuccess?: () => void;
}

type Rating = '😍' | '🙂' | '😐' | '😕';

export const RatingModal: React.FC<RatingModalProps> = ({ 
  isOpen, 
  onClose, 
  ctaSource,
  onSubmitSuccess 
}) => {
  const { t, i18n } = useTranslation();
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [browserId] = useState(() => crypto.randomUUID());
  const [fingerprint, setFingerprint] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  // Generate and store fingerprint on mount
  useEffect(() => {
    const generateFingerprint = async () => {
      const fp = await generateBrowserFingerprint();
      setFingerprint(fp);
    };
    generateFingerprint();
  }, []);

  // Check previous vote when modal opens with retry logic
  useEffect(() => {
    if (!isOpen || !fingerprint) return;

    const checkPreviousVote = async () => {
      try {
        const { data, error } = await supabase
          .from('feature_ratings')
          .select('rating')
          .eq('browser_fingerprint', fingerprint)
          .eq('cta_source', ctaSource)
          .maybeSingle();

        if (error) {
          // Handle specific error cases
          if (error.code === 'PGRST116') {
            // No data found - not an error
            setSelectedRating(null);
            setHasVoted(false);
            return;
          }

          if (retryCount < MAX_RETRIES) {
            // Retry with exponential backoff
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, RETRY_DELAY * Math.pow(2, retryCount));
            return;
          }

          // After max retries, log error but don't show to user
          console.error('Error checking vote status:', error);
          return;
        }

        // Reset retry count on success
        setRetryCount(0);

        if (data) {
          setSelectedRating(data.rating as Rating);
          setHasVoted(true);
        } else {
          setSelectedRating(null);
          setHasVoted(false);
        }
      } catch (error) {
        // Handle unexpected errors
        console.error('Unexpected error checking vote status:', error);
      }
    };

    checkPreviousVote();
  }, [isOpen, fingerprint, ctaSource, retryCount]);

  const ratings: { value: Rating; label: string }[] = [
    { value: '😍', label: t('rating.strongInterest') },
    { value: '🙂', label: t('rating.lightInterest') },
    { value: '😐', label: t('rating.neutral') },
    { value: '😕', label: t('rating.notInterested') }
  ];

  const handleSubmit = async () => {
    if (!selectedRating || !fingerprint) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const visitorId = crypto.randomUUID();

      const { error: submitError } = await supabase
        .from('feature_ratings')
        .upsert({
          browser_id: browserId,
          visitor_id: visitorId,
          browser_fingerprint: fingerprint,
          cta_source: ctaSource,
          rating: selectedRating,
          language: i18n.language,
          last_seen_at: new Date().toISOString()
        }, {
          onConflict: 'browser_fingerprint,cta_source'
        });

      if (submitError) throw submitError;

      setShowThankYou(true);
      setHasVoted(true);

      // Notify parent component of successful submission after delay
      if (onSubmitSuccess) {
        setTimeout(() => {
          onSubmitSuccess();
          onClose();
        }, 2000); // Show thank you message for 2 seconds before closing
      }

      // Track successful rating
      try {
        window.clarity?.('track', 'FeatureRating', { 
          feature: ctaSource,
          rating: selectedRating,
          isUpdate: hasVoted
        });
      } catch (error) {
        console.error('Error tracking rating:', error);
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError(t('rating.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        {showThankYou ? (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-4">{t('rating.thankYou.title')}</h2>
            <p className="text-gray-600 mb-6">{t('rating.thankYou.message')}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all"
            >
              {t('rating.close')}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">{t('rating.title')}</h2>
              <p className="text-gray-600">{t('rating.subtitle')}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {ratings.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setSelectedRating(value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedRating === value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{value}</div>
                  <div className="text-sm text-gray-600">{label}</div>
                </button>
              ))}
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 font-medium hover:text-gray-800"
              >
                {t('rating.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedRating || isSubmitting}
                className={`px-6 py-2 font-medium rounded-lg transition-all ${
                  selectedRating && !isSubmitting
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? t('common.loading') : hasVoted ? t('rating.update') : t('rating.submit')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};