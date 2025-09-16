import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme, App as AntApp } from 'antd';
import { Provider, useDispatch, useSelector } from 'react-redux';

import store from './store';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import StakeMint from './pages/StakeMint';
import StakeRedeem from './pages/StakeRedeem';
import Settings from './pages/Settings';
import Help from './pages/Help';
import AssetDetail from './pages/AssetDetail';
import mockService from './services/mockService';
import { setMockWalletState } from './store/slices/walletSlice';
import { setMockChainState } from './store/slices/chainSlice';
import './index.css';

const MOCK_WALLET = 'Polkadot.js';
const MOCK_CHAIN = 'bifrost-mainnet';

const AppRoutes = () => {
  const dispatch = useDispatch();
  const walletConnected = useSelector((state) => state.wallet.isConnected);
  const chainConnected = useSelector((state) => state.chain.isConnected);
  const mockEnabled = import.meta.env?.VITE_ENABLE_MOCK === 'true';

  useEffect(() => {
    if (!mockEnabled || (walletConnected && chainConnected)) {
      return;
    }

    let cancelled = false;

    const bootstrapMockState = async () => {
      try {
        if (!walletConnected) {
          const walletResult = await mockService.connectWallet(MOCK_WALLET);
          if (!cancelled) {
            dispatch(
              setMockWalletState({
                wallet: walletResult.wallet,
                accounts: walletResult.accounts,
                selectedAccount: walletResult.selectedAccount,
              })
            );
          }
        }

        if (!chainConnected) {
          const chainResult = await mockService.connectChain(MOCK_CHAIN);
          if (!cancelled) {
            dispatch(
              setMockChainState({
                chain: chainResult.chain,
              })
            );
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('初始化模拟数据失败:', error);
      }
    };

    bootstrapMockState();

    return () => {
      cancelled = true;
    };
  }, [dispatch, walletConnected, chainConnected, mockEnabled]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stake" element={<StakeMint />} />
        <Route path="/redeem" element={<StakeRedeem />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Help />} />
        <Route path="/assets/:symbol" element={<AssetDetail />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 8,
          },
        }}
      >
        <AntApp>
          <Router>
            <AppRoutes />
          </Router>
        </AntApp>
      </ConfigProvider>
    </Provider>
  );
}

export default App;
