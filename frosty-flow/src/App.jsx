import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme, App as AntApp } from 'antd';
import { Provider } from 'react-redux';
import store from './store';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import StakeMint from './pages/StakeMint';
import StakeRedeem from './pages/StakeRedeem';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Help from './pages/Help';
import TestDashboard from './pages/TestDashboard';
import './index.css';

// 应用路由组件
function AppRoutes() {
  return (
    <Layout>
      <Routes>
        {/* 默认重定向到仪表板 */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 主要页面路由 */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stake" element={<StakeMint />} />
        <Route path="/redeem" element={<StakeRedeem />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Help />} />

        {/* 测试页面 */}
        <Route path="/test" element={<TestDashboard />} />

        {/* 404页面重定向 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

// 主应用组件
function App() {
  return (
    <Provider store={store}>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm, // 使用明亮主题
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 8,
            colorBgContainer: '#ffffff',
            colorBgLayout: '#f5f5f5',
          },
          components: {
            Layout: {
              siderBg: '#ffffff',
              headerBg: '#ffffff',
            },
            Menu: {
              itemBg: 'transparent',
              itemSelectedBg: '#e6f7ff',
              itemSelectedColor: '#1890ff',
            },
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
