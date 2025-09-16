// Redux Store main file
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
        // Ignore these paths during serializable checks (they contain non-serializable values)
        ignoredActions: ['wallet/setWallet', 'chain/setApi'],
        ignoredPaths: ['wallet.signer', 'chain.api'],
      },
    }),
});

export default store;

