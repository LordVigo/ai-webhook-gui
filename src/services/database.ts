/**
 * Interface representing a webhook configuration
 * @interface Webhook
 */
export interface Webhook {
  /** Unique identifier for the webhook */
  id?: number;
  /** Display name for the webhook */
  name: string;
  /** URL endpoint for the webhook */
  url: string;
  /** JWT passphrase for authentication */
  passphrase: string;
  /** Timestamp when the webhook was created */
  createdAt: Date;
}

/**
 * Interface representing a chat message
 * @interface ChatMessage
 */
export interface ChatMessage {
  /** Unique identifier for the message */
  id?: number;
  /** ID of the chat history this message belongs to */
  chatHistoryId: number;
  /** Content of the message */
  content: string;
  /** Whether the message was sent by the user (true) or received from webhook (false) */
  isUser: boolean;
  /** Timestamp when the message was sent/received */
  timestamp: Date;
  /** File data for messages containing files */
  data?: { [key: string]: FileData };
}

export interface FileData {
  /** MIME type of the file */
  mimeType: string;
  /** Type of file (e.g., "image") */
  fileType: string;
  /** File extension */
  fileExtension: string;
  /** Base64 encoded file data */
  data: string;
  /** Name of the file */
  fileName: string;
  /** Size of the file as a string */
  fileSize: string;
}

/**
 * Interface representing a chat history session
 * @interface ChatHistory
 */
export interface ChatHistory {
  /** Unique identifier for the chat history */
  id?: number;
  /** ID of the webhook this chat history belongs to */
  webhookId: number;
  /** Name of the webhook at the time of chat creation */
  webhookName: string;
  /** Timestamp when the chat was created */
  createdAt: Date;
}

/**
 * Database class for managing webhooks, chat histories, and messages using SQLite backend
 */
class WebhookDatabase {
  private readonly API_URL = '/api';

  /**
   * Adds a new webhook to the database
   * @async
   * @param {Omit<Webhook, 'id' | 'createdAt'>} webhook - The webhook data to add
   * @returns {Promise<number>} The ID of the newly created webhook
   * @throws {Error} If a webhook with the same name already exists
   * @throws {Error} If the URL format is invalid
   */
  async addWebhook(webhook: Omit<Webhook, 'id' | 'createdAt'>): Promise<number> {
    try {
      new URL(webhook.url);
    } catch {
      throw new Error('Invalid URL format');
    }

    const response = await fetch(`${this.API_URL}/webhooks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhook)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add webhook');
    }

    const data = await response.json();
    return data.id;
  }

  /**
   * Retrieves all webhooks from the database, excluding their passphrases
   * @async
   * @returns {Promise<Omit<Webhook, 'passphrase'>[]>} Array of webhooks without passphrases
   */
  async getAllWebhooks(): Promise<Omit<Webhook, 'passphrase'>[]> {
    const response = await fetch(`${this.API_URL}/webhooks`);
    if (!response.ok) {
      throw new Error('Failed to fetch webhooks');
    }
    const webhooks = await response.json();
    return webhooks.map((webhook: any) => ({
      ...webhook,
      createdAt: new Date(webhook.createdAt)
    }));
  }

  /**
   * Retrieves a specific webhook by its ID
   * @async
   * @param {number} id - The ID of the webhook to retrieve
   * @returns {Promise<Webhook | undefined>} The webhook if found, undefined otherwise
   */
  async getWebhookById(id: number): Promise<Webhook | undefined> {
    const response = await fetch(`${this.API_URL}/webhooks/${id}`);
    if (!response.ok) {
      if (response.status === 404) return undefined;
      throw new Error('Failed to fetch webhook');
    }
    const webhook = await response.json();
    return {
      ...webhook,
      createdAt: new Date(webhook.createdAt)
    };
  }

  /**
   * Deletes a webhook and all its associated chat histories
   * @async
   * @param {number} id - The ID of the webhook to delete
   */
  async deleteWebhook(id: number): Promise<void> {
    const response = await fetch(`${this.API_URL}/webhooks/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('Failed to delete webhook');
    }
  }

  /**
   * Creates a new chat history for a webhook
   * @async
   * @param {number} webhookId - The ID of the webhook to create chat history for
   * @returns {Promise<number>} The ID of the newly created chat history
   */
  async createChatHistory(webhookId: number): Promise<number> {
    const response = await fetch(`${this.API_URL}/chatHistories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create chat history');
    }

    const data = await response.json();
    return data.id;
  }

  /**
   * Retrieves all chat histories, sorted by creation date (newest first)
   * @async
   * @returns {Promise<ChatHistory[]>} Array of chat histories
   */
  async getAllChatHistories(): Promise<ChatHistory[]> {
    const response = await fetch(`${this.API_URL}/chatHistories`);
    if (!response.ok) {
      throw new Error('Failed to fetch chat histories');
    }
    const histories = await response.json();
    return histories.map((history: any) => ({
      ...history,
      createdAt: new Date(history.createdAt)
    }));
  }

  /**
   * Deletes a chat history and all its messages
   * @async
   * @param {number} id - The ID of the chat history to delete
   */
  async deleteChatHistory(id: number): Promise<void> {
    const response = await fetch(`${this.API_URL}/chatHistories/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('Failed to delete chat history');
    }
  }

  /**
   * Saves a new message to the database
   * @async
   * @param {Omit<ChatMessage, 'id'>} message - The message to save
   * @returns {Promise<number>} The ID of the newly created message
   */
  async saveMessage(message: Omit<ChatMessage, 'id'>): Promise<number> {
    const response = await fetch(`${this.API_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...message,
        timestamp: message.timestamp.toISOString()
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save message');
    }

    const data = await response.json();
    return data.id;
  }

  /**
   * Retrieves all messages for a specific chat history
   * @async
   * @param {number} chatHistoryId - The ID of the chat history
   * @returns {Promise<ChatMessage[]>} Array of messages, sorted by timestamp
   */
  async getMessagesForChat(chatHistoryId: number): Promise<ChatMessage[]> {
    const response = await fetch(`${this.API_URL}/chatHistories/${chatHistoryId}/messages`);
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    const messages = await response.json();
    return messages.map((message: any) => ({
      ...message,
      isUser: Boolean(message.isUser),
      timestamp: new Date(message.timestamp)
    }));
  }

  /**
   * Updates the name of a chat history
   * @async
   * @param {number} id - The ID of the chat history to update
   * @param {string} name - The new name for the chat history
   */
  async updateChatHistoryName(id: number, name: string): Promise<void> {
    const response = await fetch(`${this.API_URL}/chatHistories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (!response.ok) {
      throw new Error('Failed to update chat history name');
    }
  }

  /**
   * Checks if a chat history has any messages
   * @async
   * @param {number} chatHistoryId - The ID of the chat history to check
   * @returns {Promise<boolean>} True if this is the first message, false otherwise
   */
  async isFirstMessage(chatHistoryId: number): Promise<boolean> {
    const messages = await this.getMessagesForChat(chatHistoryId);
    return messages.length === 0;
  }
}

// Initialize the database
export const db = new WebhookDatabase();
