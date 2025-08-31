import { useState, useCallback } from 'react';

/**
 * Custom hook for managing dialog state and form data
 */
export const useDialog = (initialFormData = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openDialog = useCallback(() => {
    setIsOpen(true);
    setFormData(initialFormData);
  }, [initialFormData]);

  const closeDialog = useCallback(() => {
    if (!isSubmitting) {
      setIsOpen(false);
      setFormData(initialFormData);
    }
  }, [isSubmitting, initialFormData]);

  const updateFormData = useCallback((updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const handleSubmit = useCallback(async (submitFn) => {
    try {
      setIsSubmitting(true);
      await submitFn(formData);
      closeDialog();
    } catch (error) {
      // Let the caller handle the error
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, closeDialog]);

  return {
    isOpen,
    formData,
    isSubmitting,
    openDialog,
    closeDialog,
    updateFormData,
    handleSubmit
  };
};