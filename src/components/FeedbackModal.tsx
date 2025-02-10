import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  ctaSource: string;
  onSubmitSuccess?: () => void;
}

interface FormErrors {
  newsletter?: string;
  interview?: string;
  email?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ 
  isOpen, 
  onClose, 
  ctaSource,
  onSubmitSuccess 
}) => {
  const { t, i18n } = useTranslation();
  const [newsletterPreference, setNewsletterPreference] = useState<string>('');
  const [interviewInterest, setInterviewInterest] = useState<string>('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [browserId] = useState(() => crypto.randomUUID());
  const [fingerprint, setFingerprint] = useState<string>('');

  // Generate and store fingerprint on mount
  useEffect(() => {
    const generateFingerprint = async () => {
      const fp = await generateBrowserFingerprint();
      setFingerprint(fp);
    };
    generateFingerprint();
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setSubmitError(null);
      setShowThankYou(false);
      
      if (!hasSubmitted) {
        setNewsletterPreference('');
        setInterviewInterest('');
        setEmail('');
      }
    }
  }, [isOpen, hasSubmitted]);

  // Check for previous feedback when modal opens
  useEffect(() => {
    if (isOpen && fingerprint) {
      const checkPreviousFeedback = async () => {
        try {
          const { data, error } = await supabase
            .from('user_feedback')
            .select('newsletter_preference, interview_interest, email')
            .eq('browser_fingerprint', fingerprint)
            .eq('cta_source', ctaSource)
            .maybeSingle();

          if (error) {
            if (error.code === 'PGRST116') { // No rows returned - not an error
              setNewsletterPreference('');
              setInterviewInterest('');
              setEmail('');
              setHasSubmitted(false);
              return;
            }
            console.error('Error checking previous feedback:', error);
            return;
          }

          if (data) {
            setNewsletterPreference(data.newsletter_preference);
            setInterviewInterest(data.interview_interest);
            setEmail(data.email || '');
            setHasSubmitted(true);
          }
        } catch (error) {
          console.error('Error checking previous feedback:', error);
        }
      };

      checkPreviousFeedback();
    }
  }, [isOpen, fingerprint, ctaSource]);

  const validateEmail = (email: string): boolean => {
    // RFC 5322 compliant email regex
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email.trim());
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate newsletter preference
    if (!newsletterPreference) {
      newErrors.newsletter = t('feedback.signup.errors.required');
      isValid = false;
    }

    // Validate interview interest
    if (!interviewInterest) {
      newErrors.interview = t('feedback.signup.errors.required');
      isValid = false;
    }

    // Validate email
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = t('feedback.signup.errors.required');
      isValid = false;
    } else if (!validateEmail(trimmedEmail)) {
      newErrors.email = t('feedback.signup.errors.invalidEmail');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setErrors({});

    if (!validateForm() || !fingerprint) {
      return;
    }

    setIsSubmitting(true);

    try {
      const visitorId = crypto.randomUUID();
      const trimmedEmail = email.trim();

      const { error: submitError } = await supabase
        .from('user_feedback')
        .upsert({
          browser_id: browserId,
          visitor_id: visitorId,
          browser_fingerprint: fingerprint,
          cta_source: ctaSource,
          newsletter_preference: newsletterPreference,
          interview_interest: interviewInterest,
          email: trimmedEmail,
          language: i18n.language,
          last_seen_at: new Date().toISOString()
        }, {
          onConflict: 'browser_fingerprint,cta_source'
        });

      if (submitError) throw submitError;
      
      setShowThankYou(true);
      setHasSubmitted(true);

      // Notify parent component of successful submission after delay
      if (onSubmitSuccess) {
        setTimeout(() => {
          onSubmitSuccess();
          onClose();
        }, 2000); // Show thank you message for 2 seconds before closing
      }

      // Track successful submission
      try {
        window.clarity?.('track', 'FeedbackSubmitted', {
          source: ctaSource,
          isUpdate: hasSubmitted
        });
      } catch (error) {
        console.error('Error tracking feedback:', error);
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setSubmitError(t('feedback.signup.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear email error when user starts typing
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
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
            <h2 className="text-xl font-semibold mb-4">{t('feedback.signup.thankYou')}</h2>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all"
            >
              {t('feedback.signup.close')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <h2 className="text-xl font-semibold mb-6">{t('feedback.signup.title')}</h2>
              <div className="space-y-2">
                <label className="block">
                  <input
                    type="radio"
                    name="newsletter"
                    value="yes"
                    checked={newsletterPreference === 'yes'}
                    onChange={(e) => setNewsletterPreference(e.target.value)}
                    className="mr-2"
                  />
                  {t('feedback.signup.newsletter.option1')}
                </label>
                <label className="block">
                  <input
                    type="radio"
                    name="newsletter"
                    value="no"
                    checked={newsletterPreference === 'no'}
                    onChange={(e) => setNewsletterPreference(e.target.value)}
                    className="mr-2"
                  />
                  {t('feedback.signup.newsletter.option2')}
                </label>
                {errors.newsletter && (
                  <p className="text-red-500 text-sm mt-1">{errors.newsletter}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">{t('feedback.signup.interview.title')}</h3>
              <div className="space-y-2">
                <label className="block">
                  <input
                    type="radio"
                    name="interview"
                    value="yes"
                    checked={interviewInterest === 'yes'}
                    onChange={(e) => setInterviewInterest(e.target.value)}
                    className="mr-2"
                  />
                  {t('feedback.signup.interview.option1')}
                </label>
                <label className="block">
                  <input
                    type="radio"
                    name="interview"
                    value="maybe"
                    checked={interviewInterest === 'maybe'}
                    onChange={(e) => setInterviewInterest(e.target.value)}
                    className="mr-2"
                  />
                  {t('feedback.signup.interview.option2')}
                </label>
                <label className="block">
                  <input
                    type="radio"
                    name="interview"
                    value="no"
                    checked={interviewInterest === 'no'}
                    onChange={(e) => setInterviewInterest(e.target.value)}
                    className="mr-2"
                  />
                  {t('feedback.signup.interview.option3')}
                </label>
                {errors.interview && (
                  <p className="text-red-500 text-sm mt-1">{errors.interview}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('feedback.signup.email.label')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => {
                  if (email && !validateEmail(email.trim())) {
                    setErrors(prev => ({
                      ...prev,
                      email: t('feedback.signup.errors.invalidEmail')
                    }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={t('feedback.signup.email.placeholder')}
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {submitError && (
              <p className="text-red-500 text-sm text-center">{submitError}</p>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 font-medium hover:text-gray-800"
              >
                {t('feedback.signup.close')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 font-medium rounded-lg transition-all ${
                  !isSubmitting
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting 
                  ? t('common.loading') 
                  : hasSubmitted 
                    ? t('feedback.signup.update')
                    : t('feedback.signup.submit')
                }
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};