import { create } from 'zustand';
import type { User, Strategy, Trade, EvolutionEvent } from '../types';

interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;

  // Strategy state
  strategies: Strategy[];
  currentStrategy: Strategy | null;
  setStrategies: (strategies: Strategy[]) => void;
  setCurrentStrategy: (strategy: Strategy | null) => void;

  // Trade state
  trades: Trade[];
  setTrades: (trades: Trade[]) => void;
  addTrade: (trade: Trade) => void;

  // Evolution state
  evolutionHistory: EvolutionEvent[];
  setEvolutionHistory: (history: EvolutionEvent[]) => void;
  addEvolutionEvent: (event: EvolutionEvent) => void;

  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // User state
  user: null,
  setUser: (user) => set({ user }),

  // Strategy state
  strategies: [],
  currentStrategy: null,
  setStrategies: (strategies) => set({ strategies }),
  setCurrentStrategy: (strategy) => set({ currentStrategy: strategy }),

  // Trade state
  trades: [],
  setTrades: (trades) => set({ trades }),
  addTrade: (trade) => set((state) => ({ trades: [...state.trades, trade] })),

  // Evolution state
  evolutionHistory: [],
  setEvolutionHistory: (history) => set({ evolutionHistory: history }),
  addEvolutionEvent: (event) =>
    set((state) => ({ evolutionHistory: [...state.evolutionHistory, event] })),

  // UI state
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  error: null,
  setError: (error) => set({ error }),
}));

