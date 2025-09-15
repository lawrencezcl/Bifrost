// 价格 API - CoinGecko 集成
import axios from 'axios';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

// 支持的代币价格映射
const TOKEN_MAPPING = {
  DOT: 'polkadot',
  vDOT: 'polkadot', // vDOT 价格基于 DOT
  GLMR: 'moonbeam',
  vGLMR: 'moonbeam', // vGLMR 价格基于 GLMR
  BNC: 'bifrost-native-coin'
};

class PriceApi {
  constructor() {
    this.priceCache = new Map();
    this.cacheTimeout = 60000; // 1分钟缓存
  }

  // 获取单个代币价格
  async getTokenPrice(symbol, vsCurrency = 'usd') {
    try {
      const cacheKey = `${symbol}_${vsCurrency}`;
      const cached = this.priceCache.get(cacheKey);
      
      // 检查缓存
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.price;
      }

      const coinId = TOKEN_MAPPING[symbol.toUpperCase()];
      if (!coinId) {
        throw new Error(`不支持的代币: ${symbol}`);
      }

      const response = await axios.get(
        `${COINGECKO_API_BASE}/simple/price`,
        {
          params: {
            ids: coinId,
            vs_currencies: vsCurrency,
            include_24hr_change: true,
            include_24hr_vol: true,
            include_market_cap: true
          }
        }
      );

      const priceData = response.data[coinId];
      if (!priceData) {
        throw new Error(`获取 ${symbol} 价格失败`);
      }

      const result = {
        price: priceData[vsCurrency],
        change24h: priceData[`${vsCurrency}_24h_change`] || 0,
        volume24h: priceData[`${vsCurrency}_24h_vol`] || 0,
        marketCap: priceData[`${vsCurrency}_market_cap`] || 0,
        symbol: symbol.toUpperCase(),
        lastUpdated: Date.now()
      };

      // 缓存结果
      this.priceCache.set(cacheKey, {
        price: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error(`获取 ${symbol} 价格失败:`, error);
      
      // 返回缓存的价格（如果存在）
      const cacheKey = `${symbol}_${vsCurrency}`;
      const cached = this.priceCache.get(cacheKey);
      if (cached) {
        return { ...cached.price, isStale: true };
      }
      
      throw error;
    }
  }

  // 批量获取多个代币价格
  async getMultipleTokenPrices(symbols, vsCurrency = 'usd') {
    try {
      const coinIds = symbols
        .map(symbol => TOKEN_MAPPING[symbol.toUpperCase()])
        .filter(id => id);

      if (coinIds.length === 0) {
        return {};
      }

      const response = await axios.get(
        `${COINGECKO_API_BASE}/simple/price`,
        {
          params: {
            ids: coinIds.join(','),
            vs_currencies: vsCurrency,
            include_24hr_change: true,
            include_24hr_vol: true,
            include_market_cap: true
          }
        }
      );

      const result = {};
      symbols.forEach(symbol => {
        const coinId = TOKEN_MAPPING[symbol.toUpperCase()];
        const priceData = response.data[coinId];
        
        if (priceData) {
          result[symbol.toUpperCase()] = {
            price: priceData[vsCurrency],
            change24h: priceData[`${vsCurrency}_24h_change`] || 0,
            volume24h: priceData[`${vsCurrency}_24h_vol`] || 0,
            marketCap: priceData[`${vsCurrency}_market_cap`] || 0,
            symbol: symbol.toUpperCase(),
            lastUpdated: Date.now()
          };

          // 缓存单个价格
          const cacheKey = `${symbol}_${vsCurrency}`;
          this.priceCache.set(cacheKey, {
            price: result[symbol.toUpperCase()],
            timestamp: Date.now()
          });
        }
      });

      return result;
    } catch (error) {
      console.error('批量获取价格失败:', error);
      throw error;
    }
  }

  // 计算资产USD价值
  calculateUSDValue(amount, tokenSymbol, decimals = 18) {
    try {
      const cacheKey = `${tokenSymbol}_usd`;
      const cached = this.priceCache.get(cacheKey);
      
      if (!cached) {
        console.warn(`${tokenSymbol} 价格未缓存`);
        return 0;
      }

      const price = cached.price.price;
      const tokenAmount = parseFloat(amount) / Math.pow(10, decimals);
      
      return tokenAmount * price;
    } catch (error) {
      console.error('计算USD价值失败:', error);
      return 0;
    }
  }

  // 获取历史价格数据（用于图表）
  async getHistoricalPrices(symbol, days = 7, vsCurrency = 'usd') {
    try {
      const coinId = TOKEN_MAPPING[symbol.toUpperCase()];
      if (!coinId) {
        throw new Error(`不支持的代币: ${symbol}`);
      }

      const response = await axios.get(
        `${COINGECKO_API_BASE}/coins/${coinId}/market_chart`,
        {
          params: {
            vs_currency: vsCurrency,
            days: days,
            interval: days <= 1 ? 'hourly' : 'daily'
          }
        }
      );

      return {
        prices: response.data.prices.map(([timestamp, price]) => ({
          time: new Date(timestamp),
          price
        })),
        volumes: response.data.total_volumes.map(([timestamp, volume]) => ({
          time: new Date(timestamp),
          volume
        })),
        marketCaps: response.data.market_caps.map(([timestamp, cap]) => ({
          time: new Date(timestamp),
          marketCap: cap
        }))
      };
    } catch (error) {
      console.error(`获取 ${symbol} 历史价格失败:`, error);
      throw error;
    }
  }

  // 清除价格缓存
  clearCache() {
    this.priceCache.clear();
  }
}

export default new PriceApi();