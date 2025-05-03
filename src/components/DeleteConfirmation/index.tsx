import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Props for the DeleteConfirmation component
 * @interface DeleteConfirmationProps
 */
interface DeleteConfirmationProps {
  /** Name of the item to be deleted */
  name: string;
  /** Type of item to be deleted ('webhook' or 'history') */
  type: 'webhook' | 'history';
  /** Callback function to be called when deletion is confirmed */
  onConfirm: () => void;
  /** Callback function to be called when deletion is cancelled */
  onCancel: () => void;
}

/**
 * Modal component for confirming deletion of webhooks or chat histories
 * 
 * @component
 * @param {DeleteConfirmationProps} props - Component props
 * @returns {JSX.Element} The rendered confirmation dialog
 * 
 * @example
 * ```tsx
 * <DeleteConfirmation
 *   name="My Webhook"
 *   type="webhook"
 *   onConfirm={() => handleDelete(id)}
 *   onCancel={() => setShowConfirmation(false)}
 * />
 * ```
 */
const DeleteConfirmation = ({ name, type, onConfirm, onCancel }: DeleteConfirmationProps) => {
  // Determine title and message based on item type
  const title = type === 'webhook' ? 'Delete Webhook' : 'Delete Chat History';
  const message = type === 'webhook'
    ? `Are you sure you want to delete the webhook "${name}"?`
    : `Are you sure you want to delete the chat history for "${name}"?`;

  return (
    <div className="popup-overlay" onClick={onCancel}>
      <div className="popup-content delete-confirmation" onClick={e => e.stopPropagation()}>
        <div className="popup-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={onCancel}>
            <FontAwesomeIcon icon="times" />
          </button>
        </div>
        
        <div className="confirmation-message">
          {message}
          <br />
          This action cannot be undone.
        </div>
        
        <div className="confirmation-actions">
          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button className="delete-button" onClick={onConfirm}>
            Delete {type === 'webhook' ? 'Webhook' : 'Chat History'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
