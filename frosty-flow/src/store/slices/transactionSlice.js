// 交易状态管理
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import bifrostApi from '../../api/bifrost';
import polkadotApi from '../../api/polkadot';
import walletApi from '../../api/wallet';

// 异步 thunk：执行质押铸造
export const executeStakeMint = createAsyncThunk(
  'transaction/stakeMint',
  async ({ assetId, amount, gasMode }, { getState, dispatch, rejectWithValue }) => {
    try {
      const { wallet, chain } = getState();
      
      if (!wallet.isConnected || !wallet.selectedAccount) {
        throw new Error('钱包未连接');
      }
      
      if (!chain.isConnected) {
        throw new Error('链未连接');
      }

      const account = wallet.selectedAccount;
      const signer = await walletApi.getSigner(account.address);
      
      // 构建交易选项
      const options = {
        gasMode, // 'fast' | 'normal' | 'slow'
        signer
      };

      // 执行质押铸造
      const result = await bifrostApi.stakeMint(account.address, assetId, amount, options);
      
      // 创建交易记录
      const transaction = {
        id: result.hash,
        type: 'stake_mint',
        status: 'pending',
        hash: result.hash,
        from: account.address,
        assetId,
        amount,
        gasMode,
        createdAt: Date.now(),
        chain: chain.currentChain.chainId
      };

      // 开始监听交易状态
      polkadotApi.monitorTransaction(result.hash, (update) => {
        dispatch(updateTransactionStatus({
          id: result.hash,
          ...update
        }));
      });

      return transaction;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 异步 thunk：执行赎回
export const executeStakeRedeem = createAsyncThunk(
  'transaction/stakeRedeem',
  async ({ assetId, amount, redeemType }, { getState, dispatch, rejectWithValue }) => {
    try {
      const { wallet, chain } = getState();
      
      if (!wallet.isConnected || !wallet.selectedAccount) {
        throw new Error('钱包未连接');
      }
      
      if (!chain.isConnected) {
        throw new Error('链未连接');
      }

      const account = wallet.selectedAccount;
      const signer = await walletApi.getSigner(account.address);
      
      // 执行赎回
      const result = await bifrostApi.stakeRedeem(account.address, assetId, amount, redeemType);
      
      // 创建交易记录
      const transaction = {
        id: result.hash,
        type: 'stake_redeem',
        status: 'pending',
        hash: result.hash,
        from: account.address,
        assetId,
        amount,
        redeemType,
        unlockTime: result.unlockTime,
        createdAt: Date.now(),
        chain: chain.currentChain.chainId
      };

      // 开始监听交易状态
      polkadotApi.monitorTransaction(result.hash, (update) => {
        dispatch(updateTransactionStatus({
          id: result.hash,
          ...update
        }));
      });

      return transaction;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 异步 thunk：估算交易费用
export const estimateTransactionFee = createAsyncThunk(
  'transaction/estimateFee',
  async ({ type, assetId, amount }, { getState, rejectWithValue }) => {
    try {
      const { wallet, chain } = getState();
      
      if (!wallet.isConnected || !wallet.selectedAccount) {
        throw new Error('钱包未连接');
      }
      
      if (!chain.isConnected) {
        throw new Error('链未连接');
      }

      // TODO: 实现真实的费用估算
      // 这里返回模拟数据
      const baseFee = 0.01; // 基础费用
      const fees = {
        slow: baseFee * 0.8,
        normal: baseFee,
        fast: baseFee * 1.5
      };

      return {
        type,
        assetId,
        amount,
        fees,
        estimatedAt: Date.now()
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // 活跃交易列表
  activeTransactions: [],
  
  // 交易历史
  transactionHistory: [],
  
  // 费用估算
  feeEstimates: {},
  
  // 当前进行的交易
  currentTransaction: null,
  
  // 加载状态
  loading: {
    mint: false,
    redeem: false,
    estimate: false
  },
  
  // 错误状态
  error: null
};

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    // 更新交易状态
    updateTransactionStatus: (state, action) => {
      const { id, status, blockNumber, blockHash } = action.payload;
      
      // 更新活跃交易
      const activeTransaction = state.activeTransactions.find(tx => tx.id === id);
      if (activeTransaction) {
        activeTransaction.status = status;
        activeTransaction.blockNumber = blockNumber;
        activeTransaction.blockHash = blockHash;
        activeTransaction.updatedAt = Date.now();
        
        // 如果交易完成，移到历史记录
        if (status === 'finalized' || status === 'failed') {
          state.transactionHistory.unshift(activeTransaction);
          state.activeTransactions = state.activeTransactions.filter(tx => tx.id !== id);
          
          // 清除当前交易
          if (state.currentTransaction?.id === id) {
            state.currentTransaction = null;
          }
        }
      }
    },
    
    // 添加交易到监控列表
    addTransaction: (state, action) => {
      const transaction = action.payload;
      state.activeTransactions.push(transaction);
      state.currentTransaction = transaction;
    },
    
    // 取消交易
    cancelTransaction: (state, action) => {
      const id = action.payload;
      state.activeTransactions = state.activeTransactions.filter(tx => tx.id !== id);
      
      if (state.currentTransaction?.id === id) {
        state.currentTransaction = null;
      }
    },
    
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    
    // 清除历史记录
    clearHistory: (state) => {
      state.transactionHistory = [];
    },
    
    // 重试交易
    retryTransaction: (state, action) => {
      const id = action.payload;
      const transaction = state.transactionHistory.find(tx => tx.id === id);
      
      if (transaction && transaction.status === 'failed') {
        // 创建新的交易记录
        const newTransaction = {
          ...transaction,
          id: `${transaction.id}_retry_${Date.now()}`,
          status: 'pending',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          retryOf: transaction.id
        };
        
        state.activeTransactions.push(newTransaction);
        state.currentTransaction = newTransaction;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // 执行质押铸造
      .addCase(executeStakeMint.pending, (state) => {
        state.loading.mint = true;
        state.error = null;
      })
      .addCase(executeStakeMint.fulfilled, (state, action) => {
        state.loading.mint = false;
        state.activeTransactions.push(action.payload);
        state.currentTransaction = action.payload;
      })
      .addCase(executeStakeMint.rejected, (state, action) => {
        state.loading.mint = false;
        state.error = action.payload;
      })
      
      // 执行赎回
      .addCase(executeStakeRedeem.pending, (state) => {
        state.loading.redeem = true;
        state.error = null;
      })
      .addCase(executeStakeRedeem.fulfilled, (state, action) => {
        state.loading.redeem = false;
        state.activeTransactions.push(action.payload);
        state.currentTransaction = action.payload;
      })
      .addCase(executeStakeRedeem.rejected, (state, action) => {
        state.loading.redeem = false;
        state.error = action.payload;
      })
      
      // 估算交易费用
      .addCase(estimateTransactionFee.pending, (state) => {
        state.loading.estimate = true;
      })
      .addCase(estimateTransactionFee.fulfilled, (state, action) => {
        state.loading.estimate = false;
        const { type, assetId } = action.payload;
        const key = `${type}_${assetId}`;
        state.feeEstimates[key] = action.payload;
      })
      .addCase(estimateTransactionFee.rejected, (state, action) => {
        state.loading.estimate = false;
        state.error = action.payload;
      });
  }
});

export const {
  updateTransactionStatus,
  addTransaction,
  cancelTransaction,
  clearError,
  clearHistory,
  retryTransaction
} = transactionSlice.actions;

export default transactionSlice.reducer;