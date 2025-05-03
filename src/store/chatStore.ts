import { create } from 'zustand';
import { db, Webhook } from '../services/database';
import { useChatHistoryStore } from './chatHistoryStore';

export interface FileData {
  mimeType: string;
  fileType: string;
  fileExtension: string;
  data: string; // Base64 encoded data
  fileName: string;
  fileSize: string;
}

interface Message {
  id: number;
  content: string;
  isUser: boolean;
  timestamp: Date;
  data?: { [key: string]: FileData }; // For files in messages
}

interface ChatState {
  activeWebhook: Webhook | null;
  activeChatHistoryId: number | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  setActiveWebhook: (webhookId: number | null) => Promise<void>;
  setActiveChatHistoryId: (id: number | null) => void;
  loadChatHistory: (chatHistoryId: number) => Promise<void>;
  sendMessage: (content: string, files?: File[]) => Promise<void>;
  clearChat: () => void;
}

let nextMessageId = 1;

export const useChatStore = create<ChatState>((set, get) => ({
  activeWebhook: null,
  activeChatHistoryId: null,
  messages: [],
  isLoading: false,
  error: null,

  setActiveChatHistoryId: (id: number | null) => {
    set({ activeChatHistoryId: id });
  },

  setActiveWebhook: async (webhookId: number | null) => {
    set({ isLoading: true, error: null });
    try {
      if (webhookId === null) {
        // Load dummy content
        set({
          activeWebhook: null,
          activeChatHistoryId: null,
          messages: [
            {
              id: nextMessageId++,
              content: "Hello! Please select a Webhook or Chat from the History.",
              isUser: false,
              timestamp: new Date()
            }
          ],
          isLoading: false
        });
        return;
      }

      const webhook = await db.getWebhookById(webhookId);
      if (!webhook) {
        throw new Error('Webhook not found');
      }

      set({
        activeWebhook: webhook,
        messages: [], // Clear messages for new chat
        isLoading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  loadChatHistory: async (chatHistoryId: number) => {
    set({ isLoading: true, error: null });
    try {
      const messages = await db.getMessagesForChat(chatHistoryId);
      set({
        messages: messages.map(msg => ({
          id: nextMessageId++,
          content: msg.content,
          isUser: msg.isUser,
          timestamp: msg.timestamp,
          data: msg.data
        })),
        activeChatHistoryId: chatHistoryId,
        isLoading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  sendMessage: async (content: string, files?: File[]) => {
    const { activeWebhook } = get();
    if (!activeWebhook) {
      throw new Error('No active webhook');
    }

    set({ isLoading: true, error: null });
    try {
      const timestamp = new Date();
      const chatHistoryId = get().activeChatHistoryId;

      // Convert image files to FileData format
      let uploadedFileData: { [key: string]: FileData } | undefined = undefined;
      if (files && files.length > 0) {
        uploadedFileData = {};
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            const base64Data = await new Promise<string>((resolve) => {
              reader.onload = () => {
                if (reader.result) {
                  const base64 = reader.result.toString();
                  const base64Data = base64.split(',')[1] || '';
                  resolve(base64Data);
                } else {
                  resolve('');
                }
              };
              reader.readAsDataURL(file);
            });

            uploadedFileData[`data${i}`] = {
              mimeType: file.type,
              fileType: 'image',
              fileExtension: file.name.split('.').pop() || '',
              data: base64Data,
              fileName: file.name,
              fileSize: `${(file.size / 1024).toFixed(1)} KB`
            };
          }
        }
        if (Object.keys(uploadedFileData).length === 0) {
          uploadedFileData = undefined;
        }
      }

      // Add user message immediately
      const userMessage: Message = {
        id: nextMessageId++,
        content,
        isUser: true,
        timestamp,
        data: uploadedFileData
      };
      set(state => ({
        messages: [...state.messages, userMessage],
        isLoading: true
      }));

      // Save message and update chat history in parallel
      const [isFirstMessage] = await Promise.all([
        chatHistoryId ? db.isFirstMessage(chatHistoryId) : Promise.resolve(false),
        chatHistoryId ? db.saveMessage({
          chatHistoryId,
          content,
          isUser: true,
          timestamp,
          data: uploadedFileData
        }) : Promise.resolve()
      ]);

      // Update chat history name if it's the first message
      if (chatHistoryId && isFirstMessage) {
        const truncatedName = content.length > 20 
          ? content.substring(0, 20) + '...'
          : content;
        const chatHistoryStore = useChatHistoryStore.getState();
        await chatHistoryStore.updateChatHistoryName(chatHistoryId, truncatedName);
      }

      // Prepare request data
      let requestData;
      let headers: HeadersInit = {
        'Authorization': `Bearer ${activeWebhook.passphrase}`
      };

      if (files && files.length > 0) {
        // Use FormData for file uploads
        const formData = new FormData();
        formData.append('message', content);
        formData.append('UUID', get().activeChatHistoryId?.toString() || '');
        
        // Add files to the data field as binary
        files.forEach((file) => {
          formData.append('data', file);
        });
        
        requestData = formData;
      } else {
        // Use JSON for text-only messages
        headers['Content-Type'] = 'application/json';
        requestData = JSON.stringify({
          message: content,
          UUID: get().activeChatHistoryId
        });
      }

      // Send request to webhook URL
      const response = await fetch(activeWebhook.url, {
        method: 'POST',
        headers,
        body: requestData
      });

      if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.statusText}`);
      }

      const responseData = await response.json();
      
      // Handle array response format from n8n
      let messageContent = '';
      let responseFileData = null;

      if (Array.isArray(responseData) && responseData.length > 0) {
        // Extract from first item in array
        const firstItem = responseData[0];
        messageContent = firstItem.message || firstItem.response || JSON.stringify(firstItem);
        
        // Extract file data if present
        if (firstItem.data) {
          // Check if data contains multiple files
          if (typeof firstItem.data === 'object' && Object.keys(firstItem.data).some(key => key.startsWith('data'))) {
            responseFileData = firstItem.data;
          } else {
            // Single file case - wrap in data0 object to maintain consistency
            responseFileData = { data0: firstItem.data };
          }
        }
      } else {
        // Fallback for direct object responses
        messageContent = responseData.message || responseData.response || JSON.stringify(responseData);
        
        // Extract file data if present
        if (responseData.data) {
          // Check if data contains multiple files
          if (typeof responseData.data === 'object' && Object.keys(responseData.data).some(key => key.startsWith('data'))) {
            responseFileData = responseData.data;
          } else {
            // Single file case - wrap in data0 object to maintain consistency
            responseFileData = { data0: responseData.data };
          }
        }
      }

      const responseTimestamp = new Date();
      // Add webhook response
      const webhookMessage: Message = {
        id: nextMessageId++,
        content: messageContent,
        isUser: false,
        timestamp: responseTimestamp,
        data: responseFileData
      };

      set(state => ({
        messages: [...state.messages, webhookMessage],
        isLoading: false
      }));

      // Save webhook response to database if we have a chat history
      if (get().activeChatHistoryId) {
        await db.saveMessage({
          chatHistoryId: get().activeChatHistoryId!,
          content: messageContent,
          isUser: false,
          timestamp: responseTimestamp,
          data: responseFileData
        });
      }
    } catch (error) {
      set(state => ({
        error: (error as Error).message,
        isLoading: false,
        messages: [...state.messages, {
          id: nextMessageId++,
          content: `Error: ${(error as Error).message}`,
          isUser: false,
          timestamp: new Date()
        }]
      }));
    }
  },

  clearChat: () => {
    set({ messages: [], error: null });
  }
}));
