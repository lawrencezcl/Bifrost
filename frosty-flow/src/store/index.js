// Redux Store 主文件
import { configureStore } from '@reduxjs/toolkit';
import walletReducer from './slices/walletSlice';
import chainReducer from './slices/chainSlice';
import assetReducer from './slices/assetSlice';
import uiReducer from './slices/uiSlice';
import transactionReducer from './slices/transactionSlice';

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    chain: chainReducer,
    asset: assetReducer,
    ui: uiReducer,
    transaction: transactionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略这些路径的序列化检查（因为包含函数等不可序列化的值）
        ignoredActions: ['wallet/setWallet', 'chain/setApi'],
        ignoredPaths: ['wallet.signer', 'chain.api'],
      },
    }),
});