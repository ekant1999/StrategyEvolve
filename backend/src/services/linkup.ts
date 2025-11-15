import axios, { AxiosInstance } from 'axios';

const LINKUP_API_URL = 'https://api.linkup.so/v1/search';

export interface LinkUpSearchRequest {
  q: string;
  depth: 'standard' | 'deep';
  outputType: 'searchResults' | 'sourcedAnswer' | 'structured';
  structuredOutputSchema?: string;
  includeSources?: boolean;
  includeImages?: boolean;
  fromDate?: string;
  toDate?: string;
  includeDomains?: string[];
  excludeDomains?: string[];
  maxResults?: number;
}

export interface NewsItem {
  type: 'text';
  name: string;
  url: string;
  content: string;
}

export interface SourcedAnswer {
  answer: string;
  sources: Array<{
    name: string;
    url: string;
    snippet: string;
  }>;
}

class LinkUpService {
  private client: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.LINKUP_API_KEY || '';
    this.client = axios.create({
      baseURL: LINKUP_API_URL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async getTickerNews(ticker: string, days: number = 7): Promise<SourcedAnswer> {
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const response = await this.client.post('', {
        q: `${ticker} stock latest news, earnings, analyst ratings, market events and price movements`,
        depth: 'standard',
        outputType: 'sourcedAnswer',
        fromDate: fromDate.toISOString().split('T')[0],
        includeDomains: ['seekingalpha.com', 'finance.yahoo.com', 'bloomberg.com', 'reuters.com'],
        maxResults: 10,
      });

      return response.data;
    } catch (error: any) {
      console.error('LinkUp ticker news error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getSentiment(ticker: string): Promise<SourcedAnswer> {
    try {
      const response = await this.client.post('', {
        q: `Market sentiment and investor opinion on ${ticker} stock right now`,
        depth: 'standard',
        outputType: 'sourcedAnswer',
        fromDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        maxResults: 5,
      });

      return response.data;
    } catch (error: any) {
      console.error('LinkUp sentiment error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getMacroEvents(): Promise<SourcedAnswer> {
    try {
      const response = await this.client.post('', {
        q: 'Latest Federal Reserve announcements, interest rate decisions, GDP data, unemployment, inflation news affecting stock market',
        depth: 'deep',
        outputType: 'sourcedAnswer',
        fromDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        maxResults: 10,
      });

      return response.data;
    } catch (error: any) {
      console.error('LinkUp macro events error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getEarningsData(ticker: string): Promise<SourcedAnswer> {
    try {
      const response = await this.client.post('', {
        q: `${ticker} quarterly earnings report, revenue, EPS, earnings beat or miss, guidance`,
        depth: 'deep',
        outputType: 'sourcedAnswer',
        fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        includeDomains: ['seekingalpha.com', 'finance.yahoo.com', 'investor.com'],
        maxResults: 5,
      });

      return response.data;
    } catch (error: any) {
      console.error('LinkUp earnings error:', error.response?.data || error.message);
      throw error;
    }
  }

  async searchGeneral(query: string, depth: 'standard' | 'deep' = 'standard'): Promise<SourcedAnswer> {
    try {
      const response = await this.client.post('', {
        q: query,
        depth,
        outputType: 'sourcedAnswer',
        maxResults: 10,
      });

      return response.data;
    } catch (error: any) {
      console.error('LinkUp general search error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export const linkUpService = new LinkUpService();

