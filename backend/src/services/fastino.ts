import axios, { AxiosInstance } from 'axios';

const FASTINO_API_URL = 'https://api.fastino.ai';

export interface FastinoUser {
  user_id: string;
  email: string;
  created_at: string;
  status: string;
}

export interface FastinoDocument {
  content: string;
  title: string;
  document_type: string;
  created_at: string;
}

export interface FastinoIngestRequest {
  user_id: string;
  source: string;
  documents: FastinoDocument[];
  options?: {
    dedupe?: boolean;
  };
}

export interface FastinoQueryRequest {
  user_id: string;
  question: string;
  use_cache?: boolean;
}

export interface FastinoChunksRequest {
  user_id: string;
  history: Array<{
    role: string;
    content: string;
  }>;
  k?: number;
  similarity_threshold?: number;
}

class FastinoService {
  private client: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.FASTINO_API_KEY || '';
    this.client = axios.create({
      baseURL: FASTINO_API_URL,
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  async registerUser(email: string, userId: string, name?: string): Promise<FastinoUser> {
    try {
      const response = await this.client.post('/register', {
        email,
        purpose: "Trading strategy optimization agent that learns user's behavioral patterns, trading edge, and decision-making style to create personalized hybrid strategies",
        traits: {
          name: name || email.split('@')[0],
          timezone: 'America/New_York',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Fastino register error:', error.response?.data || error.message);
      throw error;
    }
  }

  async ingestTrade(userId: string, tradeData: any): Promise<any> {
    try {
      const document: FastinoDocument = {
        content: `
          Trade Execution:
          Ticker: ${tradeData.ticker}
          Action: ${tradeData.action}
          Quantity: ${tradeData.quantity}
          Price: $${tradeData.price}
          Total Value: $${(tradeData.quantity * tradeData.price).toFixed(2)}
          
          Strategy Signal: ${tradeData.strategy_signal}
          User Reasoning: ${tradeData.user_reasoning || 'No reasoning provided'}
          Market Context: ${tradeData.market_context || 'Not captured'}
          
          ${tradeData.outcome ? `
          Outcome (after ${tradeData.outcome.duration_days} days):
          Exit Price: $${tradeData.outcome.exit_price}
          Return: ${tradeData.outcome.return_pct.toFixed(2)}%
          Result: ${tradeData.outcome.return_pct > 0 ? 'Profitable' : 'Loss'}
          ` : 'Outcome: Pending'}
        `,
        title: `Trade: ${tradeData.action} ${tradeData.ticker} on ${new Date(tradeData.created_at).toLocaleDateString()}`,
        document_type: 'document',
        created_at: new Date(tradeData.created_at).toISOString(),
      };

      const response = await this.client.post('/ingest', {
        user_id: userId,
        source: 'trading_activity',
        documents: [document],
        options: { dedupe: true },
      });

      return response.data;
    } catch (error: any) {
      console.error('Fastino ingest error:', error.response?.data || error.message);
      throw error;
    }
  }

  async queryBehavior(userId: string, question: string): Promise<{ answer: string }> {
    try {
      const response = await this.client.post('/query', {
        user_id: userId,
        question,
        use_cache: true,
      });
      return response.data;
    } catch (error: any) {
      console.error('Fastino query error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getChunks(userId: string, history: any[], k: number = 5): Promise<any> {
    try {
      const response = await this.client.post('/chunks', {
        user_id: userId,
        history,
        k,
        similarity_threshold: 0.3,
      });
      return response.data;
    } catch (error: any) {
      console.error('Fastino chunks error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getSummary(userId: string, maxChars: number = 500): Promise<{ summary: string }> {
    try {
      const response = await this.client.get('/summary', {
        params: {
          user_id: userId,
          max_chars: maxChars,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Fastino summary error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export const fastinoService = new FastinoService();

