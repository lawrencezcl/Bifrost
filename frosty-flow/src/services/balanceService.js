// 资产余额查询服务
import { formatBalance } from '@polkadot/util';
import { SUPPORTED_ASSETS, TEST_CONFIG } from '../config/networks';
import walletService from './walletService';
import priceService from './priceService';

class BalanceService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 15000; // 15秒缓存
    this.isTestMode = TEST_CONFIG.enableTestMode;
  }

  // 获取账户的所有资产余额
  async getAccountBalances(address) {
    try {
      if (!address) {
        throw new Error('Account address is required');
      }

      console.log('Getting balances for address:', address);

      const cacheKey = `balances_${address}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }

      let balances;
      
      if (this.isTestMode) {
        balances = await this.getMockBalances(address);
      } else {
        balances = await this.getRealBalances(address);
      }

      // 获取价格信息
      const symbols = balances.map(b => b.symbol);
      const prices = await priceService.getAssetPrices(symbols);

      // 计算USD价值
      const enrichedBalances = balances.map(balance => ({
        ...balance,
        priceData: prices[balance.symbol] || { price: 0, change24h: 0 },
        usdValue: this.calculateUsdValue(balance.available, balance.decimals, prices[balance.symbol]?.price || 0)
      }));

      // 缓存结果
      this.cache.set(cacheKey, {
        data: enrichedBalances,
        timestamp: Date.now()
      });

      return enrichedBalances;
    } catch (error) {
      console.error('Failed to get account balances:', error);
      throw error;
    }
  }

  // 获取真实余额（从区块链）
  async getRealBalances(address) {
    try {
      const status = walletService.getStatus();
      
      if (!status.isNetworkConnected) {
        throw new Error('Not connected to network');
      }

      const balances = [];

      // 获取主要代币余额
      const nativeBalance = await walletService.getAccountBalance(address);
      balances.push(this.formatBalance(nativeBalance));

      // 获取其他支持的资产余额
      const currentNetwork = status.currentNetwork;
      const supportedAssets = currentNetwork.supportedAssets || [];

      for (const assetSymbol of supportedAssets) {
        if (assetSymbol !== currentNetwork.symbol) {
          try {
            const assetBalance = await this.getAssetBalance(address, assetSymbol);
            if (assetBalance) {
              balances.push(assetBalance);
            }
          } catch (error) {
            console.warn(`Failed to get balance for ${assetSymbol}:`, error);
          }
        }
      }

      return balances;
    } catch (error) {
      console.error('Failed to get real balances:', error);
      throw error;
    }
  }

  // 获取特定资产余额
  async getAssetBalance(address, assetSymbol) {
    try {
      const api = walletService.api;
      if (!api) {
        throw new Error('API not available');
      }

      // 根据不同的pallet查询资产余额
      let balance = null;

      // 尝试从assets pallet查询
      if (api.query.assets) {
        const assetId = this.getAssetId(assetSymbol);
        if (assetId !== null) {
          const assetBalance = await api.query.assets.account(assetId, address);
          if (assetBalance.isSome) {
            const data = assetBalance.unwrap();
            balance = {
              symbol: assetSymbol,
              free: data.balance.toString(),
              available: data.balance.toString(),
              decimals: SUPPORTED_ASSETS[assetSymbol]?.decimals || 12
            };
          }
        }
      }

      // 尝试从ormlTokens查询（Bifrost使用的token模块）
      if (!balance && api.query.tokens) {
        const tokenBalance = await api.query.tokens.accounts(address, { Token: assetSymbol });
        if (tokenBalance) {
          balance = {
            symbol: assetSymbol,
            free: tokenBalance.free.toString(),
            available: tokenBalance.free.sub(tokenBalance.frozen).toString(),
            decimals: SUPPORTED_ASSETS[assetSymbol]?.decimals || 12
          };
        }
      }

      return balance ? this.formatBalance(balance) : null;
    } catch (error) {
      console.error(`Failed to get asset balance for ${assetSymbol}:`, error);
      return null;
    }
  }

  // 获取模拟余额（测试用）
  async getMockBalances(address) {
    // 模拟不同地址的不同余额
    const baseBalances = {
      'default': {
        DOT: { amount: '124.25', decimals: 10 },
        GLMR: { amount: '850.75', decimals: 18 },
        KSM: { amount: '45.85', decimals: 12 },
        BNC: { amount: '2500.00', decimals: 12 }
      },
      '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY': {
        DOT: { amount: '250.50', decimals: 10 },
        GLMR: { amount: '1500.25', decimals: 18 },
        KSM: { amount: '89.75', decimals: 12 },
        BNC: { amount: '5000.00', decimals: 12 }
      }
    };

    const balanceData = baseBalances[address] || baseBalances['default'];
    
    return Object.entries(balanceData).map(([symbol, data]) => ({
      symbol,
      name: SUPPORTED_ASSETS[symbol]?.name || symbol,
      decimals: data.decimals,
      free: this.parseToRawAmount(data.amount, data.decimals),
      available: this.parseToRawAmount(data.amount, data.decimals),
      availableFormatted: data.amount,
      address
    }));
  }

  // 格式化余额数据
  formatBalance(balanceData) {
    const { symbol, decimals, free, available } = balanceData;
    
    return {
      symbol,
      name: SUPPORTED_ASSETS[symbol]?.name || symbol,
      decimals,
      free,
      available: available || free,
      availableFormatted: this.formatAmount(available || free, decimals),
      address: balanceData.address
    };
  }

  // 格式化金额（从raw amount到可读格式）
  formatAmount(rawAmount, decimals) {
    try {
      if (!rawAmount || rawAmount === '0') return '0.0000';
      
      const divisor = Math.pow(10, decimals);
      const amount = parseFloat(rawAmount) / divisor;
      
      return amount.toFixed(4);
    } catch (error) {
      console.error('Failed to format amount:', error);
      return '0.0000';
    }
  }

  // 解析金额（从可读格式到raw amount）
  parseToRawAmount(amount, decimals) {
    try {
      const multiplier = Math.pow(10, decimals);
      const rawAmount = parseFloat(amount) * multiplier;
      
      return Math.floor(rawAmount).toString();
    } catch (error) {
      console.error('Failed to parse amount:', error);
      return '0';
    }
  }

  // 计算USD价值
  calculateUsdValue(rawAmount, decimals, price) {
    try {
      if (!price || !rawAmount) return 0;
      
      const amount = parseFloat(this.formatAmount(rawAmount, decimals));
      return amount * price;
    } catch (error) {
      console.error('Failed to calculate USD value:', error);
      return 0;
    }
  }

  // 获取资产ID映射
  getAssetId(symbol) {
    const assetIdMapping = {
      'USDT': 1984,
      'USDC': 1337,
      // 添加更多资产ID映射
    };
    
    return assetIdMapping[symbol] || null;
  }

  // 获取质押资产余额（vToken）
  async getStakedBalances(address) {
    try {
      const stakedBalances = [];
      
      for (const [symbol, assetConfig] of Object.entries(SUPPORTED_ASSETS)) {
        const vTokenSymbol = assetConfig.vTokenSymbol;
        
        if (this.isTestMode) {
          // 模拟质押余额
          const mockStaked = {
            originalAsset: symbol,
            vTokenSymbol,
            stakedAmount: '50.0000',
            rewards: '2.5000',
            apy: assetConfig.stakingRewards.apy
          };
          stakedBalances.push(mockStaked);
        } else {
          // 获取真实vToken余额
          const vTokenBalance = await this.getAssetBalance(address, vTokenSymbol);
          if (vTokenBalance && parseFloat(vTokenBalance.availableFormatted) > 0) {
            stakedBalances.push({
              originalAsset: symbol,
              vTokenSymbol,
              stakedAmount: vTokenBalance.availableFormatted,
              rewards: await this.calculateRewards(address, symbol),
              apy: assetConfig.stakingRewards.apy
            });
          }
        }
      }
      
      return stakedBalances;
    } catch (error) {
      console.error('Failed to get staked balances:', error);
      return [];
    }
  }

  // 计算质押奖励
  async calculateRewards(address, assetSymbol) {
    try {
      // 这里应该从链上查询实际的奖励数据
      // 暂时返回模拟值
      return '2.5000';
    } catch (error) {
      console.error('Failed to calculate rewards:', error);
      return '0.0000';
    }
  }

  // 监听余额变化
  subscribeToBalanceUpdates(address, callback) {
    const interval = setInterval(async () => {
      try {
        // 清除缓存以获取最新余额
        this.cache.delete(`balances_${address}`);
        const balances = await this.getAccountBalances(address);
        callback(balances);
      } catch (error) {
        console.error('Balance update error:', error);
      }
    }, 30000); // 每30秒更新一次
    
    return () => clearInterval(interval);
  }

  // 清除缓存
  clearCache(address = null) {
    if (address) {
      this.cache.delete(`balances_${address}`);
    } else {
      this.cache.clear();
    }
    console.log('Balance cache cleared');
  }
}

// 导出单例实例
export const balanceService = new BalanceService();
export default balanceService;