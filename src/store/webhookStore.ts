import { create } from 'zustand';
import { db, Webhook } from '../services/database';

interface WebhookState {
  webhooks: Omit<Webhook, 'passphrase'>[];
  isLoading: boolean;
  error: string | null;
  loadWebhooks: () => Promise<void>;
  addWebhook: (webhook: Omit<Webhook, 'id' | 'createdAt'>) => Promise<void>;
  deleteWebhook: (id: number) => Promise<void>;
}

export const useWebhookStore = create<WebhookState>((set) => ({
  webhooks: [],
  isLoading: false,
  error: null,

  loadWebhooks: async () => {
    set({ isLoading: true, error: null });
    try {
      const webhooks = await db.getAllWebhooks();
      set({ webhooks, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addWebhook: async (webhook) => {
    set({ isLoading: true, error: null });
    try {
      await db.addWebhook(webhook);
      const webhooks = await db.getAllWebhooks();
      set({ webhooks, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error; // Re-throw to handle in the form
    }
  },

  deleteWebhook: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await db.deleteWebhook(id);
      const webhooks = await db.getAllWebhooks();
      set({ webhooks, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
}));
