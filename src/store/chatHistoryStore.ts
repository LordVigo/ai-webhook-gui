import { create } from 'zustand';
import { db, ChatHistory } from '../services/database';

interface ChatHistoryState {
  chatHistories: ChatHistory[];
  isLoading: boolean;
  error: string | null;
  loadChatHistories: () => Promise<void>;
  createChatHistory: (webhookId: number) => Promise<number>;
  deleteChatHistory: (id: number) => Promise<void>;
  updateChatHistoryName: (id: number, name: string) => Promise<void>;
}

export const useChatHistoryStore = create<ChatHistoryState>((set) => ({
  chatHistories: [],
  isLoading: false,
  error: null,

  loadChatHistories: async () => {
    set({ isLoading: true, error: null });
    try {
      const chatHistories = await db.getAllChatHistories();
      set({ chatHistories, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createChatHistory: async (webhookId: number) => {
    set({ isLoading: true, error: null });
    try {
      const historyId = await db.createChatHistory(webhookId);
      const chatHistories = await db.getAllChatHistories();
      set({ chatHistories, isLoading: false });
      return historyId;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  deleteChatHistory: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await db.deleteChatHistory(id);
      const chatHistories = await db.getAllChatHistories();
      set({ chatHistories, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateChatHistoryName: async (id: number, name: string) => {
    set({ isLoading: true, error: null });
    try {
      await db.updateChatHistoryName(id, name);
      const chatHistories = await db.getAllChatHistories();
      set({ chatHistories, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
}));
