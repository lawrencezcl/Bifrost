// APY数据获取服务
import { API_ENDPOINTS, SUPPORTED_ASSETS, TEST_CONFIG } from '../config/networks';
import walletService from './walletService';

class APYService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 300000; // 5分钟缓存
    this.isTestMode = TEST_CONFIG.enableTestMode;
    this.subscriptions = new Map();
  }

  // 获取单个资产的APY数据
  async getAssetAPY(assetSymbol) {
    try {
      const cacheKey = `apy_${assetSymbol}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }

      let apyData;
      
      if (this.isTestMode) {
        apyData = this.getMockAPY(assetSymbol);
      } else {
        apyData = await this.fetchRealAPY(assetSymbol);
      }

      // 缓存结果
      this.cache.set(cacheKey, {
        data: apyData,
        timestamp: Date.now()
      });

      return apyData;
    } catch (error) {
      console.error(`Failed to get APY for ${assetSymbol}:`, error);
      // 回退到模拟数据
      return this.getMockAPY(assetSymbol);
    }
  }

  // 获取多个资产的APY数据
  async getMultipleAPY(symbols) {
    try {
      const promises = symbols.map(symbol => this.getAssetAPY(symbol));
      const apyDataArray = await Promise.all(promises);
      
      const apyMap = {};
      symbols.forEach((symbol, index) => {
        apyMap[symbol] = apyDataArray[index];
      });
      
      return apyMap;
    } catch (error) {
      console.error('Failed to get multiple APY data:', error);
      throw error;
    }
  }

  // 从真实数据源获取APY
  async fetchRealAPY(assetSymbol) {
    try {
      const api = walletService.api;
      if (!api) {
        throw new Error('Network not connected');
      }

      // 根据不同的网络和资产获取APY数据
      const networkStatus = walletService.getStatus();
      const currentNetwork = networkStatus.currentNetwork;

      if (currentNetwork.chainId === 'bifrost-testnet') {
        return await this.fetchBifrostAPY(assetSymbol);
      } else {
        // 其他网络的APY获取逻辑
        return await this.fetchGenericAPY(assetSymbol);
      }
    } catch (error) {
      console.error(`Failed to fetch real APY for ${assetSymbol}:`, error);
      throw error;
    }
  }

  // 从Bifrost网络获取APY数据
  async fetchBifrostAPY(assetSymbol) {
    try {
      const api = walletService.api;
      
      // 查询质押池信息
      const poolInfo = await api.query.liquidityStaking.pools(assetSymbol);
      
      if (poolInfo.isSome) {
        const pool = poolInfo.unwrap();
        
        // 计算APY (这里需要根据Bifrost的具体实现来计算)
        const totalStaked = pool.totalShares?.toString() || '0';
        const totalRewards = pool.totalRewards?.toString() || '0';
        
        // 简化的APY计算 (实际应该更复杂)
        const apy = this.calculateAPY(totalStaked, totalRewards);
        
        return {
          symbol: assetSymbol,
          currentAPY: apy,
          sevenDayAverage: apy * 0.95, // 模拟7天平均
          thirtyDayAverage: apy * 0.92, // 模拟30天平均
          totalStaked,
          totalRewards,
          lastUpdate: Date.now(),
          source: 'bifrost'
        };
      }
      
      throw new Error(`No pool found for ${assetSymbol}`);
    } catch (error) {
      console.error(`Failed to fetch Bifrost APY for ${assetSymbol}:`, error);
      throw error;
    }
  }

  // 从通用API获取APY数据
  async fetchGenericAPY(assetSymbol) {
    try {
      // 尝试从多个数据源获取APY
      const sources = [
        () => this.fetchFromBifrostAPI(assetSymbol),
        () => this.fetchFromSubsquidAPI(assetSymbol),
        () => this.fetchFromCoinGecko(assetSymbol)
      ];

      for (const fetchFn of sources) {
        try {
          const result = await fetchFn();
          if (result) return result;
        } catch (error) {
          console.warn('APY source failed:', error);
        }
      }
      
      throw new Error('All APY sources failed');
    } catch (error) {
      console.error(`Failed to fetch generic APY for ${assetSymbol}:`, error);
      throw error;
    }
  }

  // 从Bifrost API获取APY
  async fetchFromBifrostAPI(assetSymbol) {
    try {
      if (!API_ENDPOINTS.BIFROST_API) return null;
      
      const response = await fetch(`${API_ENDPOINTS.BIFROST_API}/staking/apy?asset=${assetSymbol}`);
      
      if (!response.ok) return null;
      
      const data = await response.json();
      
      return {
        symbol: assetSymbol,
        currentAPY: data.currentAPY || 0,
        sevenDayAverage: data.sevenDayAPY || 0,
        thirtyDayAverage: data.thirtyDayAPY || 0,
        totalStaked: data.totalStaked || '0',
        totalRewards: data.totalRewards || '0',
        lastUpdate: Date.now(),
        source: 'bifrost-api'
      };
    } catch (error) {
      console.error('Bifrost API error:', error);
      return null;
    }
  }

  // 从Subsquid API获取APY数据
  async fetchFromSubsquidAPI(assetSymbol) {
    try {
      // 这里可以集成Subsquid的GraphQL API
      // 暂时返回null
      return null;
    } catch (error) {
      console.error('Subsquid API error:', error);
      return null;
    }
  }

  // 从CoinGecko获取质押奖励数据
  async fetchFromCoinGecko(assetSymbol) {
    try {
      if (!API_ENDPOINTS.PRICE_API) return null;
      
      const coinId = this.getCoinGeckoId(assetSymbol);
      const response = await fetch(`${API_ENDPOINTS.PRICE_API}/coins/${coinId}`);
      
      if (!response.ok) return null;
      
      const data = await response.json();
      
      // CoinGecko可能有一些质押相关数据
      if (data.market_data && data.market_data.staking_rewards) {
        return {
          symbol: assetSymbol,
          currentAPY: data.market_data.staking_rewards || 0,
          sevenDayAverage: data.market_data.staking_rewards || 0,
          thirtyDayAverage: data.market_data.staking_rewards || 0,
          lastUpdate: Date.now(),
          source: 'coingecko'
        };
      }
      
      return null;
    } catch (error) {
      console.error('CoinGecko API error:', error);
      return null;
    }
  }

  // 获取模拟APY数据
  getMockAPY(assetSymbol) {
    const baseAPY = SUPPORTED_ASSETS[assetSymbol]?.stakingRewards?.apy || 15.0;
    
    // 添加随机波动 (±1%)
    const variation = (Math.random() - 0.5) * 2;
    const currentAPY = Math.max(0, baseAPY + variation);
    
    return {
      symbol: assetSymbol,
      currentAPY: parseFloat(currentAPY.toFixed(2)),
      sevenDayAverage: parseFloat((currentAPY * 0.98).toFixed(2)),
      thirtyDayAverage: parseFloat((currentAPY * 0.95).toFixed(2)),
      totalStaked: this.generateMockStakedAmount(assetSymbol),
      totalRewards: this.generateMockRewards(assetSymbol),
      lastUpdate: Date.now(),
      source: 'mock',
      isMock: true
    };
  }

  // 生成模拟质押总量
  generateMockStakedAmount(assetSymbol) {
    const amounts = {
      'DOT': '125000000', // 125M DOT
      'KSM': '8500000',   // 8.5M KSM
      'GLMR': '750000000', // 750M GLMR
      'BNC': '50000000'   // 50M BNC
    };
    
    return amounts[assetSymbol] || '10000000';
  }

  // 生成模拟奖励总量
  generateMockRewards(assetSymbol) {
    const totalStaked = parseInt(this.generateMockStakedAmount(assetSymbol));
    const apy = SUPPORTED_ASSETS[assetSymbol]?.stakingRewards?.apy || 15.0;
    
    // 计算年化奖励
    const yearlyRewards = totalStaked * (apy / 100);
    
    return Math.floor(yearlyRewards).toString();
  }

  // 简化的APY计算
  calculateAPY(totalStaked, totalRewards) {
    try {
      const staked = parseFloat(totalStaked);
      const rewards = parseFloat(totalRewards);
      
      if (staked > 0) {
        return parseFloat(((rewards / staked) * 100).toFixed(2));
      }
      
      return 0;
    } catch (error) {
      return 0;
    }
  }

  // 获取APY历史数据
  async getAPYHistory(assetSymbol, days = 30) {
    try {
      if (this.isTestMode) {
        return this.generateMockAPYHistory(assetSymbol, days);
      }

      // 从真实数据源获取历史APY
      // 这里需要实现具体的历史数据API调用
      return this.generateMockAPYHistory(assetSymbol, days);
    } catch (error) {
      console.error(`Failed to get APY history for ${assetSymbol}:`, error);
      return this.generateMockAPYHistory(assetSymbol, days);
    }
  }

  // 生成模拟APY历史数据
  generateMockAPYHistory(assetSymbol, days) {
    const baseAPY = SUPPORTED_ASSETS[assetSymbol]?.stakingRewards?.apy || 15.0;
    const history = [];
    const now = Date.now();
    
    for (let i = days; i >= 0; i--) {
      const timestamp = now - (i * 24 * 60 * 60 * 1000);
      const variation = (Math.random() - 0.5) * 4; // ±2% 变化
      const apy = Math.max(0, baseAPY + variation);
      
      history.push({
        timestamp,
        apy: parseFloat(apy.toFixed(2)),
        date: new Date(timestamp).toISOString().split('T')[0]
      });
    }
    
    return history;
  }

  // 订阅APY更新
  subscribeToAPYUpdates(symbols, callback) {
    const subscriptionId = `apy_${Date.now()}_${Math.random()}`;
    
    const updateFn = async () => {
      try {
        // 清除缓存以获取最新数据
        symbols.forEach(symbol => {
          this.cache.delete(`apy_${symbol}`);
        });
        
        const apyData = await this.getMultipleAPY(symbols);
        callback(apyData);
      } catch (error) {
        console.error('APY update error:', error);
      }
    };
    
    // 每5分钟更新一次
    const interval = setInterval(updateFn, 300000);
    
    this.subscriptions.set(subscriptionId, interval);
    
    // 立即获取一次数据
    updateFn();
    
    // 返回取消订阅的函数
    return () => {
      const interval = this.subscriptions.get(subscriptionId);
      if (interval) {
        clearInterval(interval);
        this.subscriptions.delete(subscriptionId);
      }
    };
  }

  // 获取CoinGecko币种ID
  getCoinGeckoId(symbol) {
    const mapping = {
      'DOT': 'polkadot',
      'KSM': 'kusama',
      'GLMR': 'moonbeam',
      'BNC': 'bifrost-native-coin',
      'DEV': 'moonbeam'
    };
    
    return mapping[symbol] || symbol.toLowerCase();
  }

  // 清除缓存
  clearCache(symbol = null) {
    if (symbol) {
      this.cache.delete(`apy_${symbol}`);
    } else {
      this.cache.clear();
    }
    console.log('APY cache cleared');
  }

  // 获取APY排名
  async getAPYRanking() {
    try {
      const symbols = Object.keys(SUPPORTED_ASSETS);
      const apyData = await this.getMultipleAPY(symbols);
      
      const ranking = Object.values(apyData)
        .sort((a, b) => b.currentAPY - a.currentAPY)
        .map((item, index) => ({
          ...item,
          rank: index + 1
        }));
      
      return ranking;
    } catch (error) {
      console.error('Failed to get APY ranking:', error);
      throw error;
    }
  }
}

// 导出单例实例
export const apyService = new APYService();
export default apyService;