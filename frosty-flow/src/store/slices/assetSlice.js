// 资产状态管理
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import bifrostApi, { STAKING_ASSETS } from '../../api/bifrost';
import priceApi from '../../api/price';

// 异步 thunk：获取用户资产
export const fetchUserAssets = createAsyncThunk(
  'asset/fetchUserAssets',
  async (address, { getState, rejectWithValue }) => {
    try {
      const { chain } = getState();
      if (!chain.isConnected || !chain.currentChain) {
        throw new Error('链未连接');
      }

      const assets = [];
      const chainAssets = bifrostApi.getChainAssets(chain.currentChain.chainId);
      
      for (const asset of chainAssets) {
        try {
          // 获取原生资产余额
          const nativeBalance = await bifrostApi.getAssetBalance(address, asset.symbol);
          
          // 获取流动性质押代币余额  
          const stakingBalance = await bifrostApi.getAssetBalance(address, asset.vsymbol);
          
          assets.push({
            ...asset,
            chain: chain.currentChain.chainId,
            chainName: chain.currentChain.name,
            nativeBalance,
            stakingBalance,
            totalBalance: {
              free: (BigInt(nativeBalance.free) + BigInt(stakingBalance.free)).toString(),
              locked: (BigInt(nativeBalance.locked) + BigInt(stakingBalance.locked)).toString()
            }
          });
        } catch (error) {
          console.error(`获取 ${asset.symbol} 余额失败:`, error);
          // 继续处理其他资产
        }
      }

      return assets;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 异步 thunk：获取资产价格
export const fetchAssetPrices = createAsyncThunk(
  'asset/fetchPrices',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { asset } = getState();
      const symbols = [...new Set(asset.userAssets.map(a => a.symbol))];
      
      if (symbols.length === 0) return {};
      
      const prices = await priceApi.getMultipleTokenPrices(symbols);
      return prices;
    } catch (error) {
      console.error('获取价格失败:', error);
      return rejectWithValue(error.message);
    }
  }
);

// 异步 thunk：获取收益历史
export const fetchYieldHistory = createAsyncThunk(
  'asset/fetchYieldHistory',
  async ({ symbol, days = 30 }, { rejectWithValue }) => {
    try {
      // TODO: 实现真实的收益历史数据获取
      // 这里返回模拟数据
      const mockData = Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000),
        yield: Math.random() * 10 + 5, // 5-15% 年化收益
        amount: Math.random() * 100 + 50 // 50-150 收益金额
      }));
      
      return { symbol, data: mockData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 异步 thunk：计算总资产价值
export const calculateTotalValue = createAsyncThunk(
  'asset/calculateTotal',
  async (_, { getState }) => {
    const { asset } = getState();
    let totalValue = 0;
    let totalYield = 0;

    asset.userAssets.forEach(userAsset => {
      const price = asset.prices[userAsset.symbol];
      if (price) {
        // 计算原生资产价值
        const nativeValue = priceApi.calculateUSDValue(
          userAsset.nativeBalance.free,
          userAsset.symbol,
          userAsset.decimals
        );
        
        // 计算质押资产价值
        const stakingValue = priceApi.calculateUSDValue(
          userAsset.stakingBalance.free,
          userAsset.symbol,
          userAsset.decimals
        );
        
        totalValue += nativeValue + stakingValue;
        
        // 累计收益（模拟数据）
        totalYield += stakingValue * 0.1; // 假设 10% 年化收益
      }
    });

    return {
      totalValue,
      totalYield,
      calculatedAt: Date.now()
    };
  }
);

const initialState = {
  // 用户资产列表
  userAssets: [],
  
  // 资产价格数据
  prices: {},
  
  // 支持的质押资产
  supportedAssets: Object.values(STAKING_ASSETS),
  
  // 总资产价值
  totalValue: {
    totalValue: 0,
    totalYield: 0,
    calculatedAt: 0
  },
  
  // 收益历史数据
  yieldHistory: {},
  
  // 加载状态
  loading: {
    assets: false,
    prices: false,
    yield: false
  },
  
  // 刷新时间
  lastUpdated: {
    assets: 0,
    prices: 0
  },
  
  // 错误状态
  error: null
};

const assetSlice = createSlice({
  name: 'asset',
  initialState,
  reducers: {
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    
    // 更新单个资产余额
    updateAssetBalance: (state, action) => {
      const { symbol, balance } = action.payload;
      const asset = state.userAssets.find(a => a.symbol === symbol);
      if (asset) {
        asset.nativeBalance = balance.native || asset.nativeBalance;
        asset.stakingBalance = balance.staking || asset.stakingBalance;
        asset.totalBalance = {
          free: (BigInt(asset.nativeBalance.free) + BigInt(asset.stakingBalance.free)).toString(),
          locked: (BigInt(asset.nativeBalance.locked) + BigInt(asset.stakingBalance.locked)).toString()
        };
      }
    },
    
    // 添加新的资产记录
    addAssetRecord: (state, action) => {
      const { type, symbol, amount, txHash, timestamp } = action.payload;
      const asset = state.userAssets.find(a => a.symbol === symbol);
      if (asset) {
        if (!asset.records) asset.records = [];
        asset.records.unshift({
          type, // 'stake' | 'unstake' | 'claim'
          amount,
          txHash,
          timestamp,
          status: 'pending'
        });
      }
    },
    
    // 更新资产记录状态
    updateAssetRecord: (state, action) => {
      const { txHash, status, blockHash } = action.payload;
      state.userAssets.forEach(asset => {
        if (asset.records) {
          const record = asset.records.find(r => r.txHash === txHash);
          if (record) {
            record.status = status;
            record.blockHash = blockHash;
            record.confirmedAt = Date.now();
          }
        }
      });
    },
    
    // 设置价格更新时间
    setPriceUpdateTime: (state) => {
      state.lastUpdated.prices = Date.now();
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取用户资产
      .addCase(fetchUserAssets.pending, (state) => {
        state.loading.assets = true;
        state.error = null;
      })
      .addCase(fetchUserAssets.fulfilled, (state, action) => {
        state.loading.assets = false;
        state.userAssets = action.payload;
        state.lastUpdated.assets = Date.now();
      })
      .addCase(fetchUserAssets.rejected, (state, action) => {
        state.loading.assets = false;
        state.error = action.payload;
      })
      
      // 获取资产价格
      .addCase(fetchAssetPrices.pending, (state) => {
        state.loading.prices = true;
      })
      .addCase(fetchAssetPrices.fulfilled, (state, action) => {
        state.loading.prices = false;
        state.prices = { ...state.prices, ...action.payload };
        state.lastUpdated.prices = Date.now();
      })
      .addCase(fetchAssetPrices.rejected, (state, action) => {
        state.loading.prices = false;
        state.error = action.payload;
      })
      
      // 获取收益历史
      .addCase(fetchYieldHistory.pending, (state) => {
        state.loading.yield = true;
      })
      .addCase(fetchYieldHistory.fulfilled, (state, action) => {
        state.loading.yield = false;
        state.yieldHistory[action.payload.symbol] = action.payload.data;
      })
      .addCase(fetchYieldHistory.rejected, (state, action) => {
        state.loading.yield = false;
        state.error = action.payload;
      })
      
      // 计算总价值
      .addCase(calculateTotalValue.fulfilled, (state, action) => {
        state.totalValue = action.payload;
      });
  }
});

export const {
  clearError,
  updateAssetBalance,
  addAssetRecord,
  updateAssetRecord,
  setPriceUpdateTime
} = assetSlice.actions;

export default assetSlice.reducer;