import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, FileText, Compass, Sparkles } from 'lucide-react';
import { supabase, withRetries } from '../lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js';

export const Pricing: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [browserId] = useState(() => crypto.randomUUID());

  const plans = [
    {
      id: 'tax',
      icon: FileText,
      name: t('pricing.plans.tax.name'),
      description: t('pricing.plans.tax.description'),
      features: t('pricing.plans.tax.features', { returnObjects: true }) as string[]
    },
    {
      id: 'discovery',
      icon: Compass,
      name: t('pricing.plans.discovery.name'),
      description: t('pricing.plans.discovery.description'),
      features: t('pricing.plans.discovery.features', { returnObjects: true }) as string[]
    },
    {
      id: 'complete',
      icon: Sparkles,
      name: t('pricing.plans.complete.name'),
      description: t('pricing.plans.complete.description'),
      features: t('pricing.plans.complete.features', { returnObjects: true }) as string[]
    }
  ];

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

  useEffect(() => {
    let isMounted = true;

    const checkVoteStatus = async () => {
      try {
        const { data, error } = await withRetries(async () => 
          supabase
            .from('pricing_votes')
            .select('plan_id')
            .eq('browser_id', browserId)
            .maybeSingle()
        );

        if (error) {
          if (error.code === 'PGRST116') {
            return;
          }
          
          if (isMounted) {
            console.error('Error checking vote status:', {
              code: error.code,
              message: error.message,
              details: error.details
            });
            setError(t('pricing.error'));
          }
          return;
        }

        if (isMounted && data) {
          setSelectedPlan(data.plan_id);
          setHasVoted(true);
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('Error checking vote status:', { message: errorMessage });
          setError(t('pricing.error'));
        }
      }
    };

    checkVoteStatus();

    return () => {
      isMounted = false;
    };
  }, [browserId, t]);

  const handleVote = async (planId: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const fingerprint = await generateBrowserFingerprint();
      const visitorId = crypto.randomUUID();

      const { error: upsertError } = await withRetries(async () =>
        supabase
          .from('pricing_votes')
          .upsert(
            {
              browser_id: browserId,
              visitor_id: visitorId,
              browser_fingerprint: fingerprint,
              plan_id: planId,
              language: i18n.language,
              last_seen_at: new Date().toISOString()
            },
            {
              onConflict: 'browser_id'
            }
          )
      );

      if (upsertError) {
        throw upsertError;
      }

      setSelectedPlan(planId);
      setHasVoted(true);

      try {
        window.clarity?.('track', 'PricingVote', { plan: planId });
      } catch (trackError) {
        console.error('Error tracking vote:', trackError instanceof Error ? trackError.message : 'Unknown error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error submitting vote:', { message: errorMessage });
      setError(t('pricing.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="pricing" className="py-12 sm:py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 animate-fade-in-up">
            {t('pricing.title1')}
          </h2>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`group animate-fade-in-up-${index + 1}`}
            >
              <div className={`bg-white rounded-2xl shadow-lg p-6 sm:p-8 h-full flex flex-col transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${
                selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''
              }`}>
                <div className="mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <plan.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900">{plan.name}</h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-6">{plan.description}</p>
                </div>

                <div className="flex-grow">
                  <ul className="space-y-4 mb-8">
                    {Array.isArray(plan.features) && plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                        <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  {hasVoted && selectedPlan === plan.id ? (
                    <div className="text-center text-green-600 font-medium">
                      {t('pricing.thankYou')}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleVote(plan.id)}
                      disabled={isSubmitting}
                      className="w-full px-4 sm:px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {isSubmitting ? t('common.loading') : hasVoted ? t('pricing.updateVote') : t('pricing.vote')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};