import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useWebhookStore } from '../../store/webhookStore';

/**
 * Props for the WebhookForm component
 * @interface WebhookFormProps
 */
interface WebhookFormProps {
  /** Callback function to be called when the form is closed */
  onClose: () => void;
}

/**
 * Interface for form validation errors
 * @interface FormErrors
 */
interface FormErrors {
  /** Error message for the name field */
  name?: string;
  /** Error message for the URL field */
  url?: string;
  /** Error message for the passphrase field */
  passphrase?: string;
  /** General error message */
  general?: string;
}

/**
 * Form component for creating and editing webhooks
 * 
 * @component
 * @param {WebhookFormProps} props - Component props
 * @returns {JSX.Element} The rendered form component
 * 
 * @example
 * ```tsx
 * <WebhookForm onClose={() => setIsFormOpen(false)} />
 * ```
 */
const WebhookForm = ({ onClose }: WebhookFormProps) => {
  // Access the webhook store
  const addWebhook = useWebhookStore(state => state.addWebhook);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    passphrase: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validates the form data
   * @returns {boolean} True if the form is valid, false otherwise
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Validate URL
    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = 'Please enter a valid URL';
      }
    }

    // Validate passphrase
    if (!formData.passphrase.trim()) {
      newErrors.passphrase = 'Passphrase is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await addWebhook(formData);
      onClose();
    } catch (error) {
      if ((error as Error).message.includes('name already exists')) {
        setErrors(prev => ({ ...prev, name: 'A webhook with this name already exists' }));
      } else {
        setErrors(prev => ({ ...prev, general: (error as Error).message }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles input field changes
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    // Clear error when user starts typing
    if (errors[id as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [id]: undefined }));
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <div className="popup-header">
          <h2>Add Webhook</h2>
          <button className="close-button" onClick={onClose}>
            <FontAwesomeIcon icon="times" />
          </button>
        </div>
        
        <form className="webhook-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter webhook name"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="url">URL</label>
            <input
              type="text"
              id="url"
              className={`form-input ${errors.url ? 'error' : ''}`}
              placeholder="Enter webhook URL"
              value={formData.url}
              onChange={handleChange}
            />
            {errors.url && <span className="error-message">{errors.url}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="passphrase">Bearer Token</label>
            <input
              type="password"
              id="passphrase"
              className={`form-input ${errors.passphrase ? 'error' : ''}`}
              placeholder="Enter Bearer Token for Header Auth"
              value={formData.passphrase}
              onChange={handleChange}
            />
            {errors.passphrase && <span className="error-message">{errors.passphrase}</span>}
            <small className="form-help">
              From N8N Webhooks: Bearer Token for header auth
            </small>
          </div>
          
          {errors.general && <div className="error-message general">{errors.general}</div>}
          
          <button 
            type="submit" 
            className="save-button" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Webhook'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WebhookForm;
