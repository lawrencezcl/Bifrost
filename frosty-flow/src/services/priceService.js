// 价格数据获取服务
import { API_ENDPOINTS, TEST_CONFIG } from '../config/networks';

class PriceService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30秒缓存
    this.isTestMode = TEST_CONFIG.enableTestMode;
  }

  // 获取单个资产价格
  async getAssetPrice(symbol) {
    try {
      // 检查缓存
      const cacheKey = `price_${symbol}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }

      let price;
      
      if (this.isTestMode) {
        // 测试模式：使用模拟价格
        price = this.getMockPrice(symbol);
      } else {
        // 生产模式：从CoinGecko API获取实时价格
        price = await this.fetchRealPrice(symbol);
      }

      // 缓存结果
      this.cache.set(cacheKey, {
        data: price,
        timestamp: Date.now()
      });

      return price;
    } catch (error) {
      console.error(`Failed to get price for ${symbol}:`, error);
      // 回退到模拟价格
      return this.getMockPrice(symbol);
    }
  }

  // 获取多个资产价格
  async getAssetPrices(symbols) {
    try {
      const promises = symbols.map(symbol => this.getAssetPrice(symbol));
      const prices = await Promise.all(promises);
      
      const priceMap = {};
      symbols.forEach((symbol, index) => {
        priceMap[symbol] = prices[index];
      });
      
      return priceMap;
    } catch (error) {
      console.error('Failed to get multiple asset prices:', error);
      throw error;
    }
  }

  // 从CoinGecko API获取实时价格
  async fetchRealPrice(symbol) {
    try {
      const coinId = this.getCoinGeckoId(symbol);
      const response = await fetch(
        `${API_ENDPOINTS.PRICE_API}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
      );
      
      if (!response.ok) {
        throw new Error(`Price API error: ${response.status}`);
      }
      
      const data = await response.json();
      const coinData = data[coinId];
      
      if (!coinData) {
        throw new Error(`No price data found for ${symbol}`);
      }
      
      return {
        symbol,
        price: coinData.usd,
        change24h: coinData.usd_24h_change || 0,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`Failed to fetch real price for ${symbol}:`, error);
      throw error;
    }
  }

  // 获取模拟价格（测试用）
  getMockPrice(symbol) {
    const basePrice = TEST_CONFIG.mockPrices[symbol] || 1.0;
    
    // 添加随机波动（±2%）
    const variation = (Math.random() - 0.5) * 0.04;
    const price = basePrice * (1 + variation);
    
    // 模拟24小时变化
    const change24h = (Math.random() - 0.5) * 10; // ±5%的变化
    
    return {
      symbol,
      price: parseFloat(price.toFixed(4)),
      change24h: parseFloat(change24h.toFixed(2)),
      timestamp: Date.now(),
      isMock: true
    };
  }

  // 获取CoinGecko的币种ID映射
  getCoinGeckoId(symbol) {
    const mapping = {
      'DOT': 'polkadot',
      'KSM': 'kusama',
      'GLMR': 'moonbeam',
      'BNC': 'bifrost-native-coin',
      'DEV': 'moonbeam', // Moonbase Alpha使用相同的价格参考
      'USDT': 'tether'
    };
    
    return mapping[symbol] || symbol.toLowerCase();
  }

  // 获取历史价格数据（用于图表）
  async getHistoricalPrices(symbol, days = 7) {
    try {
      if (this.isTestMode) {
        return this.generateMockHistoricalData(symbol, days);
      }

      const coinId = this.getCoinGeckoId(symbol);
      const response = await fetch(
        `${API_ENDPOINTS.PRICE_API}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
      );
      
      if (!response.ok) {
        throw new Error(`Historical price API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data.prices.map(([timestamp, price]) => ({
        timestamp,
        price,
        date: new Date(timestamp).toISOString().split('T')[0]
      }));
    } catch (error) {
      console.error(`Failed to get historical prices for ${symbol}:`, error);
      return this.generateMockHistoricalData(symbol, days);
    }
  }

  // 生成模拟历史数据
  generateMockHistoricalData(symbol, days) {
    const basePrice = TEST_CONFIG.mockPrices[symbol] || 1.0;
    const data = [];
    const now = Date.now();
    
    for (let i = days; i >= 0; i--) {
      const timestamp = now - (i * 24 * 60 * 60 * 1000);
      const variation = (Math.random() - 0.5) * 0.1; // ±5%变化
      const price = basePrice * (1 + variation);
      
      data.push({
        timestamp,
        price: parseFloat(price.toFixed(4)),
        date: new Date(timestamp).toISOString().split('T')[0]
      });
    }
    
    return data;
  }

  // 订阅价格更新（WebSocket）
  subscribeToPriceUpdates(symbols, callback) {
    if (this.isTestMode) {
      // 测试模式：模拟实时更新
      const interval = setInterval(async () => {
        try {
          const prices = await this.getAssetPrices(symbols);
          callback(prices);
        } catch (error) {
          console.error('Price update error:', error);
        }
      }, 10000); // 每10秒更新一次
      
      return () => clearInterval(interval);
    }
    
    // 生产模式：这里可以集成WebSocket连接到价格服务
    // 暂时使用轮询
    const interval = setInterval(async () => {
      try {
        // 清除缓存以获取最新价格
        symbols.forEach(symbol => {
          this.cache.delete(`price_${symbol}`);
        });
        
        const prices = await this.getAssetPrices(symbols);
        callback(prices);
      } catch (error) {
        console.error('Price update error:', error);
      }
    }, 30000); // 每30秒更新一次
    
    return () => clearInterval(interval);
  }

  // 计算投资组合价值
  calculatePortfolioValue(holdings) {
    let totalValue = 0;
    
    holdings.forEach(holding => {
      const priceData = this.cache.get(`price_${holding.symbol}`)?.data;
      if (priceData) {
        totalValue += holding.amount * priceData.price;
      }
    });
    
    return totalValue;
  }

  // 获取市场统计数据
  async getMarketStats() {
    try {
      const symbols = ['DOT', 'KSM', 'GLMR', 'BNC'];
      const prices = await this.getAssetPrices(symbols);
      
      // 计算总市值和平均变化
      let totalChange = 0;
      let validPrices = 0;
      
      Object.values(prices).forEach(priceData => {
        if (priceData.change24h !== undefined) {
          totalChange += priceData.change24h;
          validPrices++;
        }
      });
      
      const avgChange = validPrices > 0 ? totalChange / validPrices : 0;
      
      return {
        totalAssets: symbols.length,
        averageChange24h: parseFloat(avgChange.toFixed(2)),
        prices,
        lastUpdate: Date.now()
      };
    } catch (error) {
      console.error('Failed to get market stats:', error);
      throw error;
    }
  }

  // 清除缓存
  clearCache() {
    this.cache.clear();
    console.log('Price cache cleared');
  }
}

// 导出单例实例
export const priceService = new PriceService();
export default priceService;