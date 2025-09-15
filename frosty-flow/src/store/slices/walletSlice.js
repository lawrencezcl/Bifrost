// 钱包状态管理
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import walletApi, { WALLET_TYPES } from '../../api/wallet';

// 异步 thunk：连接钱包
export const connectWallet = createAsyncThunk(
  'wallet/connect',
  async (walletType, { rejectWithValue }) => {
    try {
      const result = await walletApi.connectWallet(walletType);
      
      // 保存连接状态到 localStorage
      localStorage.setItem('connectedWallet', JSON.stringify({
        walletType,
        selectedAddress: result.selectedAccount.address
      }));
      
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 异步 thunk：切换账户
export const switchAccount = createAsyncThunk(
  'wallet/switchAccount',
  async (account, { rejectWithValue }) => {
    try {
      const result = await walletApi.switchAccount(account);
      
      // 更新 localStorage
      const saved = localStorage.getItem('connectedWallet');
      if (saved) {
        const data = JSON.parse(saved);
        data.selectedAddress = account.address;
        localStorage.setItem('connectedWallet', JSON.stringify(data));
      }
      
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 异步 thunk：恢复钱包连接
export const restoreWalletConnection = createAsyncThunk(
  'wallet/restore',
  async (_, { rejectWithValue }) => {
    try {
      const saved = localStorage.getItem('connectedWallet');
      if (!saved) {
        return null;
      }

      const { walletType, selectedAddress } = JSON.parse(saved);
      const result = await walletApi.connectWallet(walletType);
      
      // 恢复选中的账户
      const targetAccount = result.accounts.find(acc => acc.address === selectedAddress);
      if (targetAccount) {
        await walletApi.switchAccount(targetAccount);
        result.selectedAccount = targetAccount;
      }
      
      return result;
    } catch (error) {
      console.error('恢复钱包连接失败:', error);
      localStorage.removeItem('connectedWallet');
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  isConnected: false,
  currentWallet: null,
  accounts: [],
  selectedAccount: null,
  installedWallets: [],
  isConnecting: false,
  error: null,
  signer: null
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    // 断开钱包连接
    disconnect: (state) => {
      walletApi.disconnect();
      localStorage.removeItem('connectedWallet');
      
      state.isConnected = false;
      state.currentWallet = null;
      state.accounts = [];
      state.selectedAccount = null;
      state.signer = null;
      state.error = null;
    },
    
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    
    // 设置已安装的钱包列表
    setInstalledWallets: (state, action) => {
      state.installedWallets = action.payload;
    },
    
    // 更新账户余额（外部调用）
    updateAccountBalance: (state, action) => {
      const { address, balance } = action.payload;
      const account = state.accounts.find(acc => acc.address === address);
      if (account) {
        account.balance = balance;
      }
      if (state.selectedAccount?.address === address) {
        state.selectedAccount.balance = balance;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // 连接钱包
      .addCase(connectWallet.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.isConnecting = false;
        state.isConnected = true;
        state.currentWallet = action.payload.wallet;
        state.accounts = action.payload.accounts;
        state.selectedAccount = action.payload.selectedAccount;
        state.error = null;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isConnecting = false;
        state.error = action.payload;
      })
      
      // 切换账户
      .addCase(switchAccount.fulfilled, (state, action) => {
        state.selectedAccount = action.payload;
      })
      .addCase(switchAccount.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // 恢复连接
      .addCase(restoreWalletConnection.pending, (state) => {
        state.isConnecting = true;
      })
      .addCase(restoreWalletConnection.fulfilled, (state, action) => {
        state.isConnecting = false;
        if (action.payload) {
          state.isConnected = true;
          state.currentWallet = action.payload.wallet;
          state.accounts = action.payload.accounts;
          state.selectedAccount = action.payload.selectedAccount;
        }
      })
      .addCase(restoreWalletConnection.rejected, (state) => {
        state.isConnecting = false;
      });
  }
});

export const { 
  disconnect, 
  clearError, 
  setInstalledWallets, 
  updateAccountBalance 
} = walletSlice.actions;

export default walletSlice.reducer;