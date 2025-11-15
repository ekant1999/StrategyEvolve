import axios, { AxiosInstance } from 'axios';

// Using Alpha Vantage for historical stock data (free tier available)
const ALPHA_VANTAGE_API_URL = 'https://www.alphavantage.co/query';
const FINNHUB_API_URL = 'https://finnhub.io/api/v1';

export interface StockPrice {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockDataProvider {
  getHistoricalData(ticker: string, days: number): Promise<StockPrice[]>;
  getCurrentPrice(ticker: string): Promise<number>;
}

class AlphaVantageProvider implements StockDataProvider {
  private client: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
    this.client = axios.create({
      baseURL: ALPHA_VANTAGE_API_URL,
    });
  }

  async getHistoricalData(ticker: string, days: number = 252): Promise<StockPrice[]> {
    try {
      console.log(`📊 Fetching ${days} days of historical data for ${ticker} from Alpha Vantage...`);
      
      const response = await this.client.get('', {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: ticker,
          outputsize: days > 100 ? 'full' : 'compact',
          apikey: this.apiKey,
        },
      });

      if (response.data['Error Message']) {
        throw new Error(`Alpha Vantage error: ${response.data['Error Message']}`);
      }

      if (response.data['Note']) {
        console.warn('⚠️  Alpha Vantage API limit reached. Using fallback data.');
        throw new Error('API limit reached');
      }

      const timeSeries = response.data['Time Series (Daily)'];
      if (!timeSeries) {
        throw new Error('No time series data returned');
      }

      const prices: StockPrice[] = Object.entries(timeSeries)
        .slice(0, days)
        .map(([dateStr, data]: [string, any]) => ({
          date: new Date(dateStr),
          open: parseFloat(data['1. open']),
          high: parseFloat(data['2. high']),
          low: parseFloat(data['3. low']),
          close: parseFloat(data['4. close']),
          volume: parseFloat(data['5. volume']),
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      console.log(`✅ Retrieved ${prices.length} days of data for ${ticker}`);
      return prices;
    } catch (error: any) {
      console.error(`❌ Alpha Vantage error for ${ticker}:`, error.message);
      throw error;
    }
  }

  async getCurrentPrice(ticker: string): Promise<number> {
    try {
      const response = await this.client.get('', {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: ticker,
          apikey: this.apiKey,
        },
      });

      const quote = response.data['Global Quote'];
      if (!quote || !quote['05. price']) {
        throw new Error('No quote data available');
      }

      return parseFloat(quote['05. price']);
    } catch (error: any) {
      console.error(`❌ Error fetching current price for ${ticker}:`, error.message);
      throw error;
    }
  }
}

class FinnhubProvider implements StockDataProvider {
  private client: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.FINNHUB_API_KEY || '';
    this.client = axios.create({
      baseURL: FINNHUB_API_URL,
    });
  }

  async getHistoricalData(ticker: string, days: number = 252): Promise<StockPrice[]> {
    try {
      console.log(`📊 Fetching ${days} days of historical data for ${ticker} from Finnhub...`);
      
      const toTimestamp = Math.floor(Date.now() / 1000);
      const fromTimestamp = toTimestamp - (days * 24 * 60 * 60);

      const response = await this.client.get('/stock/candle', {
        params: {
          symbol: ticker,
          resolution: 'D',
          from: fromTimestamp,
          to: toTimestamp,
          token: this.apiKey,
        },
      });

      if (response.data.s === 'no_data' || !response.data.c) {
        throw new Error('No data available for this ticker');
      }

      const prices: StockPrice[] = response.data.t.map((timestamp: number, idx: number) => ({
        date: new Date(timestamp * 1000),
        open: response.data.o[idx],
        high: response.data.h[idx],
        low: response.data.l[idx],
        close: response.data.c[idx],
        volume: response.data.v[idx],
      }));

      console.log(`✅ Retrieved ${prices.length} days of data for ${ticker}`);
      return prices;
    } catch (error: any) {
      console.error(`❌ Finnhub error for ${ticker}:`, error.message);
      throw error;
    }
  }

  async getCurrentPrice(ticker: string): Promise<number> {
    try {
      const response = await this.client.get('/quote', {
        params: {
          symbol: ticker,
          token: this.apiKey,
        },
      });

      if (!response.data.c) {
        throw new Error('No current price available');
      }

      return response.data.c;
    } catch (error: any) {
      console.error(`❌ Error fetching current price for ${ticker}:`, error.message);
      throw error;
    }
  }
}

// Fallback: Generate realistic synthetic data when APIs fail
class SyntheticDataProvider implements StockDataProvider {
  async getHistoricalData(ticker: string, days: number = 252): Promise<StockPrice[]> {
    console.log(`📊 Generating synthetic data for ${ticker} (${days} days)`);
    
    const prices: StockPrice[] = [];
    let basePrice = 100 + Math.random() * 400; // Random starting price between $100-$500
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      // Generate realistic price movement with trends and volatility
      const trendFactor = Math.sin(i / 20) * 0.002; // Long-term trend
      const volatility = 0.02; // 2% daily volatility
      const randomChange = (Math.random() - 0.5) * volatility;
      
      const dailyChange = trendFactor + randomChange;
      basePrice = basePrice * (1 + dailyChange);

      const open = i === 0 ? basePrice : prices[i - 1].close;
      const close = basePrice;
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = Math.floor(1000000 + Math.random() * 5000000);

      prices.push({
        date,
        open,
        high,
        low,
        close,
        volume,
      });
    }

    console.log(`✅ Generated ${prices.length} days of synthetic data`);
    return prices;
  }

  async getCurrentPrice(ticker: string): Promise<number> {
    return 150 + Math.random() * 100;
  }
}

class StockDataService {
  private provider: StockDataProvider;
  private fallbackProvider: StockDataProvider;

  constructor() {
    // Try to use real API first, fallback to synthetic
    if (process.env.ALPHA_VANTAGE_API_KEY && process.env.ALPHA_VANTAGE_API_KEY !== 'demo') {
      this.provider = new AlphaVantageProvider();
      console.log('📊 Using Alpha Vantage for stock data');
    } else if (process.env.FINNHUB_API_KEY) {
      this.provider = new FinnhubProvider();
      console.log('📊 Using Finnhub for stock data');
    } else {
      console.warn('⚠️  No stock data API key configured. Using synthetic data.');
      this.provider = new SyntheticDataProvider();
    }
    
    this.fallbackProvider = new SyntheticDataProvider();
  }

  async getHistoricalData(ticker: string, days: number = 252): Promise<StockPrice[]> {
    try {
      return await this.provider.getHistoricalData(ticker, days);
    } catch (error) {
      console.warn(`⚠️  Primary provider failed for ${ticker}, using synthetic data`);
      return await this.fallbackProvider.getHistoricalData(ticker, days);
    }
  }

  async getCurrentPrice(ticker: string): Promise<number> {
    try {
      return await this.provider.getCurrentPrice(ticker);
    } catch (error) {
      console.warn(`⚠️  Primary provider failed for ${ticker}, using synthetic price`);
      return await this.fallbackProvider.getCurrentPrice(ticker);
    }
  }

  async getMultipleStocksData(tickers: string[], days: number = 252): Promise<Map<string, StockPrice[]>> {
    const dataMap = new Map<string, StockPrice[]>();
    
    // Rate limiting: delay between API calls
    for (const ticker of tickers) {
      try {
        const data = await this.getHistoricalData(ticker, days);
        dataMap.set(ticker, data);
        
        // Wait 12 seconds between calls for Alpha Vantage free tier (5 calls/min)
        await new Promise(resolve => setTimeout(resolve, 12000));
      } catch (error) {
        console.error(`Failed to get data for ${ticker}, skipping`);
      }
    }

    return dataMap;
  }
}

export const stockDataService = new StockDataService();

