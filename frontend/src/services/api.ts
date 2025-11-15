import axios from 'axios';
import type {
  Strategy,
  Trade,
  EvolutionEvent,
  MarketIntelligence,
  UserBehavioralInsight,
  ApiResponse,
  User
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth & User APIs
export const authApi = {
  register: async (email: string, name: string): Promise<ApiResponse<User>> => {
    const response = await api.post('/auth/register', { email, name });
    return response.data;
  },

  login: async (email: string): Promise<ApiResponse<User>> => {
    const response = await api.post('/auth/login', { email });
    return response.data;
  },

  getProfile: async (userId: string): Promise<ApiResponse<User>> => {
    const response = await api.get(`/user/${userId}/profile`);
    return response.data;
  },
};

// Strategy APIs
export const strategyApi = {
  getAll: async (): Promise<ApiResponse<Strategy[]>> => {
    const response = await api.get('/strategies');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Strategy>> => {
    const response = await api.get(`/strategies/${id}`);
    return response.data;
  },

  generate: async (baseStrategyId?: string): Promise<ApiResponse<Strategy[]>> => {
    const response = await api.post('/strategies/generate', { baseStrategyId });
    return response.data;
  },

  backtest: async (strategyId: string): Promise<ApiResponse<Strategy>> => {
    const response = await api.post('/strategies/backtest', { strategyId });
    return response.data;
  },
};

// Evolution APIs
export const evolutionApi = {
  optimize: async (): Promise<ApiResponse<Strategy>> => {
    const response = await api.post('/evolution/optimize');
    return response.data;
  },

  synthesize: async (userId: string): Promise<ApiResponse<Strategy>> => {
    const response = await api.post('/evolution/synthesize', { userId });
    return response.data;
  },

  getHistory: async (): Promise<ApiResponse<EvolutionEvent[]>> => {
    const response = await api.get('/evolution/history');
    return response.data;
  },
};

// Trade APIs
export const tradeApi = {
  getAll: async (userId: string): Promise<ApiResponse<Trade[]>> => {
    const response = await api.get(`/trades?userId=${userId}`);
    return response.data;
  },

  create: async (trade: Omit<Trade, 'id' | 'created_at'>): Promise<ApiResponse<Trade>> => {
    const response = await api.post('/trades', trade);
    return response.data;
  },

  getOutcome: async (tradeId: string): Promise<ApiResponse<Trade>> => {
    const response = await api.get(`/trades/${tradeId}/outcome`);
    return response.data;
  },
};

// Market Intelligence APIs
export const marketApi = {
  getNews: async (ticker: string, days: number = 7): Promise<ApiResponse<MarketIntelligence>> => {
    const response = await api.post('/market/news', { ticker, days });
    return response.data;
  },

  getSentiment: async (ticker: string): Promise<ApiResponse<{ sentiment: string; analysis: string }>> => {
    const response = await api.post('/market/sentiment', { ticker });
    return response.data;
  },

  getMacroEvents: async (): Promise<ApiResponse<MarketIntelligence>> => {
    const response = await api.post('/market/macro');
    return response.data;
  },
};

// Insights APIs (Fastino)
export const insightsApi = {
  query: async (userId: string, question: string): Promise<ApiResponse<{ answer: string }>> => {
    const response = await api.post('/insights/query', { userId, question });
    return response.data;
  },

  getChunks: async (userId: string, context: string): Promise<ApiResponse<UserBehavioralInsight[]>> => {
    const response = await api.post('/insights/chunks', { userId, context });
    return response.data;
  },
};

export default api;

