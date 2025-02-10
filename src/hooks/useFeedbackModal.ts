import { useState, useCallback } from 'react';

export const useFeedbackModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ctaSource, setCtaSource] = useState('');

  const openModal = useCallback((source: string) => {
    setCtaSource(source);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    ctaSource,
    openModal,
    closeModal
  };
};