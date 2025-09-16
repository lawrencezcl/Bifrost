// 链状态管理
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import bifrostApi, { CHAIN_CONFIGS } from '../../api/bifrost';
import polkadotApi from '../../api/polkadot';

// 异步 thunk：连接到链
export const connectToChain = createAsyncThunk(
  'chain/connect',
  async (chainConfig, { rejectWithValue }) => {
    try {
      const api = await bifrostApi.connect(chainConfig);
      await polkadotApi.connect(chainConfig.rpc);
      
      // 保存当前链到 localStorage
      localStorage.setItem('selectedChain', JSON.stringify(chainConfig));
      
      return {
        chainConfig,
        api,
        isConnected: true
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 异步 thunk：切换链
export const switchChain = createAsyncThunk(
  'chain/switch',
  async (chainConfig, { dispatch, rejectWithValue }) => {
    try {
      // 先断开当前连接
      await bifrostApi.disconnect();
      await polkadotApi.disconnect();
      
      // 连接到新链
      const result = await dispatch(connectToChain(chainConfig));
      return result.payload;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 异步 thunk：获取链信息
export const fetchChainInfo = createAsyncThunk(
  'chain/fetchInfo',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { chain } = getState();
      if (!chain.isConnected || !chain.api) {
        throw new Error('链未连接');
      }

      // 获取链的基本信息
      const [chainName, nodeVersion, properties] = await Promise.all([
        chain.api.rpc.system.chain(),
        chain.api.rpc.system.version(),
        chain.api.rpc.system.properties()
      ]);

      return {
        chainName: chainName.toString(),
        nodeVersion: nodeVersion.toString(),
        properties: properties.toJSON()
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 异步 thunk：恢复链连接
export const restoreChainConnection = createAsyncThunk(
  'chain/restore',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const saved = localStorage.getItem('selectedChain');
      if (!saved) {
        // 默认连接到 Bifrost 主网
        return await dispatch(connectToChain(CHAIN_CONFIGS.BIFROST_MAINNET));
      }

      const chainConfig = JSON.parse(saved);
      return await dispatch(connectToChain(chainConfig));
    } catch (error) {
      console.error('恢复链连接失败:', error);
      localStorage.removeItem('selectedChain');
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // 当前连接的链
  currentChain: null,
  isConnected: false,
  isConnecting: false,
  
  // 链 API 实例
  api: null,
  
  // 链信息
  chainInfo: {
    chainName: '',
    nodeVersion: '',
    properties: null
  },
  
  // 支持的链列表
  supportedChains: Object.values(CHAIN_CONFIGS),
  
  // 区块信息
  currentBlock: {
    number: 0,
    hash: '',
    timestamp: 0
  },
  
  // 错误状态
  error: null
};

const chainSlice = createSlice({
  name: 'chain',
  initialState,
  reducers: {
    // 断开链连接
    disconnect: (state) => {
      bifrostApi.disconnect();
      polkadotApi.disconnect();
      localStorage.removeItem('selectedChain');
      
      state.currentChain = null;
      state.isConnected = false;
      state.api = null;
      state.chainInfo = {
        chainName: '',
        nodeVersion: '',
        properties: null
      };
      state.currentBlock = {
        number: 0,
        hash: '',
        timestamp: 0
      };
      state.error = null;
    },
    
    // 更新当前区块信息
    updateCurrentBlock: (state, action) => {
      state.currentBlock = action.payload;
    },
    
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    
    // 设置 API 实例（用于非序列化数据）
    setApi: (state, action) => {
      // 注意：API 实例不会被序列化到 Redux store
      state.api = action.payload;
    },

    // 仅用于模拟环境的初始化
    setMockChainState: (state, action) => {
      const { chain } = action.payload || {};

      state.currentChain = chain || action.payload || null;
      state.isConnected = Boolean(chain || action.payload);
      state.isConnecting = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // 连接到链
      .addCase(connectToChain.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(connectToChain.fulfilled, (state, action) => {
        state.isConnecting = false;
        state.isConnected = true;
        state.currentChain = action.payload.chainConfig;
        // API 实例单独设置，避免序列化问题
        state.error = null;
      })
      .addCase(connectToChain.rejected, (state, action) => {
        state.isConnecting = false;
        state.isConnected = false;
        state.error = action.payload;
      })
      
      // 切换链
      .addCase(switchChain.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(switchChain.fulfilled, (state, action) => {
        state.isConnecting = false;
        state.isConnected = true;
        state.currentChain = action.payload.chainConfig;
        state.error = null;
      })
      .addCase(switchChain.rejected, (state, action) => {
        state.isConnecting = false;
        state.error = action.payload;
      })
      
      // 获取链信息
      .addCase(fetchChainInfo.fulfilled, (state, action) => {
        state.chainInfo = action.payload;
      })
      .addCase(fetchChainInfo.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // 恢复连接
      .addCase(restoreChainConnection.pending, (state) => {
        state.isConnecting = true;
      })
      .addCase(restoreChainConnection.fulfilled, (state, action) => {
        state.isConnecting = false;
        if (action.payload) {
          state.isConnected = true;
          state.currentChain = action.payload.chainConfig;
        }
      })
      .addCase(restoreChainConnection.rejected, (state, action) => {
        state.isConnecting = false;
        state.error = action.payload;
      });
  }
});

export const {
  disconnect,
  updateCurrentBlock,
  clearError,
  setApi,
  setMockChainState
} = chainSlice.actions;

export default chainSlice.reducer;