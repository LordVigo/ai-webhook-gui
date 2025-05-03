import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useWebhookStore } from '../../store/webhookStore';
import { useChatStore } from '../../store/chatStore';
import { db } from '../../services/database';
import { useChatHistoryStore } from '../../store/chatHistoryStore';
import DeleteConfirmation from '../DeleteConfirmation';

/**
 * Props for the Sidebar component
 * @interface SidebarProps
 */
interface SidebarProps {
  /** Callback function to be called when the add button is clicked */
  onAddClick: () => void;
  /** Whether the sidebar is visible on mobile */
  isVisible?: boolean;
  /** Callback function to be called when the sidebar should be hidden */
  onHide?: () => void;
}

/**
 * Interface for items that can be deleted
 * @interface DeleteItem
 */
interface DeleteItem {
  /** ID of the item to delete */
  id: number;
  /** Display name of the item */
  name: string;
  /** Type of item ('webhook' or 'history') */
  type: 'webhook' | 'history';
}

/**
 * Sidebar component displaying webhooks and chat histories
 * 
 * @component
 * @param {SidebarProps} props - Component props
 * @returns {JSX.Element} The rendered sidebar
 * 
 * @example
 * ```tsx
 * <Sidebar onAddClick={() => setShowWebhookForm(true)} />
 * ```
 */
const Sidebar = ({ onAddClick, isVisible = true, onHide }: SidebarProps) => {
  // Access store states and actions
  const { webhooks, loadWebhooks, deleteWebhook } = useWebhookStore();
  const { chatHistories, loadChatHistories, createChatHistory, deleteChatHistory } = useChatHistoryStore();
  const { setActiveWebhook, setActiveChatHistoryId, loadChatHistory } = useChatStore();

  // Local state for delete confirmation
  const [itemToDelete, setItemToDelete] = useState<DeleteItem | null>(null);

  /**
   * Load webhooks and chat histories on component mount
   */
  useEffect(() => {
    loadWebhooks();
    loadChatHistories();
  }, [loadWebhooks, loadChatHistories]);

  /**
   * Handles deletion of webhooks and chat histories
   */
  const handleDelete = async () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'webhook') {
        await deleteWebhook(itemToDelete.id);
      } else {
        await deleteChatHistory(itemToDelete.id);
      }
      setItemToDelete(null);
    }
  };

  /**
   * Handles webhook selection and creates a new chat history
   * @param {number} webhookId - ID of the selected webhook
   */
  const handleWebhookClick = async (webhookId: number) => {
    try {
      // First set the active webhook
      await setActiveWebhook(webhookId);
      // Then create chat history and get its ID
      const historyId = await createChatHistory(webhookId);
      // Finally set the chat history ID
      setActiveChatHistoryId(historyId);
      // Hide sidebar on mobile
      if (onHide) onHide();
    } catch (error) {
      console.error('Failed to handle webhook click:', error);
      // Reset states on error
      setActiveWebhook(null);
      setActiveChatHistoryId(null);
    }
  };

  /**
   * Formats a relative time string (e.g., "5 m" or "2 h")
   * @param {Date} date - The date to format
   * @returns {string} Formatted relative time
   */
  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60));
    if (minutes < 60) {
      return `${minutes} m`;
    }
    return `${Math.floor(minutes / 60)} h`;
  };

  return (
    <div className={`sidebar ${isVisible ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out fixed top-0 left-0 h-full bg-white shadow-lg z-50 md:translate-x-0 md:static`}>
      <div className="sidebar-title">
        <img src="/logo.png" alt="AI Webhook GUI" className="sidebar-logo" />
        <span>AI Webhook GUI</span>
      </div>
      
      <div className="section-title">Webhooks</div>
      
      <div className="agent-list">
        {webhooks.map(webhook => (
          <div 
            key={webhook.id} 
            className="agent-item"
            onClick={() => handleWebhookClick(webhook.id!)}
          >
            <div className="agent-icon">
              <FontAwesomeIcon icon="file" />
            </div>
            <div>{webhook.name}</div>
            <button 
              className="delete-icon"
              onClick={(e) => {
                e.stopPropagation();
                setItemToDelete({ id: webhook.id!, name: webhook.name, type: 'webhook' });
              }}
            >
              <FontAwesomeIcon icon="trash" className="text-red-500" />
            </button>
          </div>
        ))}
      </div>
      
      <div className="section-title">Chat History</div>
      
      <div className="chat-history">
        {chatHistories.map(history => (
          <div 
            key={history.id} 
            className="history-item"
            onClick={async () => {
              try {
                // Get the webhook for this chat history
                const webhook = await db.getWebhookById(history.webhookId);
                if (webhook) {
                  // Set the active webhook first
                  await setActiveWebhook(webhook.id!);
                  // Then load the chat history
                  if (history.id !== undefined) {
                    await loadChatHistory(history.id);
                  }
                  // Hide sidebar on mobile
                  if (onHide) onHide();
                }
              } catch (error) {
                console.error('Failed to load chat history:', error);
              }
            }}
          >
            <span>{history.id}</span>
            <span style={{ marginLeft: '15px' }}>{history.webhookName}</span>
            <span className="time-ago">
              {getTimeAgo(history.createdAt)}
            </span>
            <button 
              className="delete-icon"
              onClick={(e) => {
                e.stopPropagation();
                setItemToDelete({ id: history.id!, name: history.webhookName, type: 'history' });
              }}
            >
              <FontAwesomeIcon icon="trash" className="text-red-500" />
            </button>
          </div>
        ))}
      </div>
      
      {itemToDelete && (
        <DeleteConfirmation
          name={itemToDelete.name}
          type={itemToDelete.type}
          onConfirm={handleDelete}
          onCancel={() => setItemToDelete(null)}
        />
      )}
      
      <div className="add-button" onClick={onAddClick}>
        <FontAwesomeIcon icon="plus" />
      </div>
    </div>
  );
};

export default Sidebar;
