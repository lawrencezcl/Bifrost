// FrostyFlow 完整UI/UX测试版本 + Testnet集成
import React, { useState, useEffect } from 'react';
import WalletConnector from './components/WalletConnector';
import walletService from './services/walletService';
import priceService from './services/priceService';
import balanceService from './services/balanceService';
import transactionService from './services/transactionService';
import networkMonitor from './services/networkMonitor';
import apyService from './services/apyService';
import { useResponsive, useSwipe } from './hooks/useResponsive';
import './styles/global.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('DOT');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [walletStatus, setWalletStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [realAssets, setRealAssets] = useState([]);
  const [prices, setPrices] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [networkStatus, setNetworkStatus] = useState(null);
  const [apyData, setApyData] = useState({});
  
  // 响应式Hook
  const { isMobile, isTablet, deviceType, screenSize } = useResponsive();
  
  // 页面切换数组，用于滑动导航
  const pages = ['dashboard', 'stake', 'redeem'];
  const currentPageIndex = pages.indexOf(currentPage);
  
  // 滑动手势支持
  const swipeHandlers = useSwipe(
    () => {
      // 左滑：下一页
      if (currentPageIndex < pages.length - 1) {
        setCurrentPage(pages[currentPageIndex + 1]);
      }
    },
    () => {
      // 右滑：上一页
      if (currentPageIndex > 0) {
        setCurrentPage(pages[currentPageIndex - 1]);
      }
    }
  );

  const mockAssets = [
    { symbol: 'DOT', name: 'Polkadot', balance: '124.25', value: '$2,480.50', apy: '15.8%' },
    { symbol: 'GLMR', name: 'Moonbeam', balance: '850.25', value: '$1,890.75', apy: '12.5%' },
    { symbol: 'KSM', name: 'Kusama', balance: '45.85', value: '$1,250.30', apy: '18.2%' }
  ];

  // 检查钱包连接状态并加载数据
  useEffect(() => {
    const status = walletService.getStatus();
    setIsWalletConnected(status.isWalletConnected && status.isNetworkConnected);
    setWalletStatus(status);
    
    // 如果钱包已连接，加载用户数据
    if (status.isWalletConnected && status.selectedAccount) {
      loadUserData(status.selectedAccount.address);
    }
    
    // 初始化网络监控
    const networkUnsubscribe = networkMonitor.addListener((newStatus) => {
      setNetworkStatus(newStatus);
    });
    
    return () => {
      networkUnsubscribe();
    };
  }, []);

  // 加载用户数据
  const loadUserData = async (address) => {
    try {
      setIsLoading(true);
      
      // 并行加载余额、价格、交易历史和APY数据
      const [balances, assetPrices, txHistory, apyInfo] = await Promise.all([
        balanceService.getAccountBalances(address),
        priceService.getAssetPrices(['DOT', 'GLMR', 'KSM', 'BNC']),
        transactionService.getTransactionHistory(address, 10),
        apyService.getMultipleAPY(['DOT', 'GLMR', 'KSM', 'BNC'])
      ]);
      
      setRealAssets(balances);
      setPrices(assetPrices);
      setTransactions(txHistory);
      setApyData(apyInfo);
      
      console.log('User data loaded:', { balances, assetPrices, txHistory, apyInfo });
    } catch (error) {
      console.error('Failed to load user data:', error);
      setError('加载用户数据失败: ' + error.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理钱包连接成功
  const handleWalletConnected = async (connectionData) => {
    setConnectedWallet(connectionData);
    setIsWalletConnected(true);
    setWalletStatus(walletService.getStatus());
    setShowWalletModal(false);
    setSuccess('钱包连接成功！');
    setTimeout(() => setSuccess(null), 3000);
    
    // 连接到默认网络
    try {
      await walletService.connectToNetwork('BIFROST_TESTNET');
      
      // 开始网络监控
      networkMonitor.startMonitoring();
      
      // 加载用户数据
      if (connectionData.selectedAccount) {
        await loadUserData(connectionData.selectedAccount.address);
      }
    } catch (error) {
      console.error('Failed to connect to network:', error);
      setError('连接网络失败: ' + error.message);
      setTimeout(() => setError(null), 5000);
    }
    
    console.log('Wallet connected successfully:', connectionData);
  };

  // 断开钱包连接
  const handleWalletDisconnect = async () => {
    try {
      setIsLoading(true);
      await walletService.disconnect();
      networkMonitor.stopMonitoring();
      setIsWalletConnected(false);
      setConnectedWallet(null);
      setWalletStatus(null);
      setSuccess('钱包已断开连接');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      setError('断开连接失败: ' + error.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStake = async () => {
    if (!stakeAmount) {
      setError('请输入质押数量');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    if (!isWalletConnected || !walletStatus?.selectedAccount) {
      setError('请先连接钱包');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // 使用真实的质押服务
      const result = await walletService.executeStaking({
        assetSymbol: selectedAsset,
        amount: stakeAmount,
        accountAddress: walletStatus.selectedAccount.address
      });
      
      if (result.success) {
        setSuccess(`质押成功！交易哈希: ${result.txHash}`);
        setStakeAmount('');
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (error) {
      console.error('Staking failed:', error);
      setError('质押失败: ' + error.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理赎回操作
  const handleRedeem = async (assetSymbol, amount, redeemType) => {
    if (!amount) {
      setError('请输入赎回数量');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    if (!isWalletConnected || !walletStatus?.selectedAccount) {
      setError('请先连接钱包');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // 使用真实的赎回服务
      const result = await walletService.executeRedeem({
        assetSymbol,
        amount,
        redeemType,
        accountAddress: walletStatus.selectedAccount.address
      });
      
      if (result.success) {
        setSuccess(`赎回成功！交易哈希: ${result.txHash}`);
        setTimeout(() => setSuccess(null), 5000);
        
        // 重新加载用户数据
        await loadUserData(walletStatus.selectedAccount.address);
      }
    } catch (error) {
      console.error('Redeem failed:', error);
      setError('赎回失败: ' + error.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // 页面切换处理
  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (isMobile) {
      setMobileNavOpen(false);
    }
  };

  // 键盘导航支持
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setCurrentPage('dashboard');
            break;
          case '2':
            e.preventDefault();
            setCurrentPage('stake');
            break;
          case '3':
            e.preventDefault();
            setCurrentPage('redeem');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 获取当前显示的资产数据（优先使用真实数据）
  const getCurrentAssets = () => {
    if (realAssets.length > 0) {
      return realAssets.map(asset => {
        const apyInfo = apyData[asset.symbol];
        return {
          symbol: asset.symbol,
          name: asset.name,
          balance: asset.availableFormatted,
          value: `$${asset.usdValue.toFixed(2)}`,
          apy: apyInfo ? `${apyInfo.currentAPY}%` : (mockAssets.find(m => m.symbol === asset.symbol)?.apy || '15.0%')
        };
      });
    }
    return mockAssets;
  };

  // 计算总资产价值
  const getTotalValue = () => {
    if (realAssets.length > 0) {
      return realAssets.reduce((total, asset) => total + asset.usdValue, 0);
    }
    return 5621.75; // 默认模拟值
  };

  const renderDashboard = () => (
    <div>
      <h1 className="gradient-text" style={{ 
        fontSize: isMobile ? '2em' : '2.5em', 
        marginBottom: isMobile ? '20px' : '30px',
        textAlign: isMobile ? 'center' : 'left'
      }}>
        📊 资产总览
      </h1>
      
      <div className={`stats-grid ${isMobile ? 'mobile-grid' : ''}`}>
        <div className="frosty-card stat-card touch-feedback">
          <h3>总资产价值</h3>
          <div className="stat-value">${getTotalValue().toFixed(2)}</div>
        </div>
        <div className="frosty-card stat-card touch-feedback">
          <h3>累计收益</h3>
          <div className="stat-value">${(getTotalValue() * 0.05).toFixed(2)}</div>
        </div>
        <div className="frosty-card stat-card touch-feedback">
          <h3>质押资产数</h3>
          <div className="stat-value">{getCurrentAssets().length} 种</div>
        </div>
        <div className="frosty-card stat-card touch-feedback">
          <h3>最近交易</h3>
          <div className="stat-value">{transactions.length} 笔</div>
        </div>
      </div>

      <div className="frosty-card" style={{ 
        padding: isMobile ? '16px' : '24px',
        marginBottom: isMobile ? '16px' : '20px'
      }}>
        <h3 style={{ 
          marginBottom: '20px', 
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: isMobile ? '16px' : '18px'
        }}>
          💎 我的质押资产
        </h3>
        {getCurrentAssets().map(asset => (
          <div key={asset.symbol} className="asset-item touch-feedback">
            <div className="asset-info">
              <h4 style={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                marginBottom: '8px',
                fontSize: isMobile ? '14px' : '16px'
              }}>
                {asset.symbol} ({asset.name})
              </h4>
              <p style={{ 
                color: 'rgba(16, 185, 129, 1)', 
                fontWeight: '500',
                fontSize: isMobile ? '12px' : '14px'
              }}>
                APY: {asset.apy}
              </p>
            </div>
            <div className="asset-value" style={{ textAlign: isMobile ? 'left' : 'right' }}>
              <div className="asset-amount" style={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: isMobile ? '14px' : '1.1em', 
                fontWeight: '600' 
              }}>
                {asset.balance} {asset.symbol}
              </div>
              <div className="asset-usd" style={{ 
                color: 'rgba(255, 255, 255, 0.6)', 
                fontSize: isMobile ? '12px' : '0.9em' 
              }}>
                {asset.value}
              </div>
            </div>
          </div>
        ))}
        
        {/* 最近交易历史 */}
        {transactions.length > 0 && (
          <div className="frosty-card" style={{ 
            padding: isMobile ? '16px' : '24px',
            marginTop: isMobile ? '16px' : '20px'
          }}>
            <h3 style={{ 
              marginBottom: '20px', 
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: isMobile ? '16px' : '18px'
            }}>
              📈 最近交易
            </h3>
            {transactions.slice(0, 5).map((tx, index) => (
              <div key={tx.hash || index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: index < 4 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
              }}>
                <div>
                  <div style={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: isMobile ? '13px' : '14px',
                    marginBottom: '4px'
                  }}>
                    {tx.typeIcon} {tx.type === 'stake' ? '质押' : tx.type === 'redeem' ? '赎回' : '转账'}
                  </div>
                  <div style={{ 
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: isMobile ? '11px' : '12px'
                  }}>
                    {tx.timeAgo}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    color: tx.statusColor,
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '600'
                  }}>
                    {tx.amountFormatted} {tx.asset}
                  </div>
                  <div style={{ 
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: isMobile ? '11px' : '12px'
                  }}>
                    {tx.status === 'success' ? '✓ 成功' : tx.status === 'pending' ? '⏳ 处理中' : '❌ 失败'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStake = () => (
    <div>
      <h1 className="gradient-text" style={{ 
        fontSize: isMobile ? '2em' : '2.5em', 
        marginBottom: isMobile ? '20px' : '30px',
        textAlign: isMobile ? 'center' : 'left'
      }}>
        💰 质押铸造
      </h1>
      
      <div className="frosty-card" style={{ 
        padding: isMobile ? '16px' : '24px',
        marginBottom: isMobile ? '16px' : '20px'
      }}>
        <h3 style={{ 
          marginBottom: '20px', 
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: isMobile ? '16px' : '18px'
        }}>
          选择质押资产
        </h3>
        <select 
          value={selectedAsset}
          onChange={(e) => setSelectedAsset(e.target.value)}
          className="demo-input touch-feedback"
          style={{
            width: '100%',
            padding: isMobile ? '14px 16px' : '12px 16px',
            background: 'rgba(26, 31, 44, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: isMobile ? '16px' : '14px',
            marginBottom: '20px'
          }}
        >
          {getCurrentAssets().map(asset => (
            <option key={asset.symbol} value={asset.symbol}>
              {asset.symbol} - {asset.name} (APY: {asset.apy})
            </option>
          ))}
        </select>

        <h4 style={{ 
          color: 'rgba(255, 255, 255, 0.9)', 
          marginBottom: '12px',
          fontSize: isMobile ? '14px' : '16px'
        }}>
          输入质押数量
        </h4>
        <input
          type="number"
          placeholder="输入质押数量"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          className="demo-input touch-feedback"
          style={{
            width: '100%',
            padding: isMobile ? '14px 16px' : '12px 16px',
            background: 'rgba(26, 31, 44, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: isMobile ? '16px' : '14px',
            marginBottom: '20px'
          }}
        />

        {stakeAmount && (
          <div className="interactive-demo" style={{ 
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '12px',
            padding: isMobile ? '12px' : '16px',
            marginBottom: '20px'
          }}>
            <h4 style={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              marginBottom: '12px',
              fontSize: isMobile ? '14px' : '16px'
            }}>
              收益预估
            </h4>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              <p style={{ 
                margin: '4px 0',
                fontSize: isMobile ? '13px' : '14px'
              }}>
                质押数量: {stakeAmount} {selectedAsset}
              </p>
              <p style={{ 
                margin: '4px 0',
                fontSize: isMobile ? '13px' : '14px'
              }}>
                预估年收益: {(parseFloat(stakeAmount || 0) * 0.15).toFixed(2)} {selectedAsset}
              </p>
              <p style={{ 
                margin: '4px 0',
                fontSize: isMobile ? '13px' : '14px'
              }}>
                预估日收益: {(parseFloat(stakeAmount || 0) * 0.15 / 365).toFixed(4)} {selectedAsset}
              </p>
            </div>
          </div>
        )}

        <button 
          className="demo-btn touch-feedback"
          onClick={handleStake}
          disabled={!isWalletConnected || isLoading}
          style={{
            width: '100%',
            padding: isMobile ? '16px 24px' : '14px 24px',
            background: (isWalletConnected && !isLoading) ? 'linear-gradient(135deg, #FC077D, #FF78C8)' : 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '12px',
            color: '#FFFFFF',
            fontSize: isMobile ? '16px' : '16px',
            fontWeight: '600',
            cursor: (isWalletConnected && !isLoading) ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            opacity: (isWalletConnected && !isLoading) ? 1 : 0.6,
            minHeight: isMobile ? '48px' : 'auto'
          }}
        >
          {isLoading ? (
            <span className="loading-spinner" style={{ marginRight: '8px' }}></span>
          ) : null}
          {isLoading ? '处理中...' : isWalletConnected ? '确认质押' : '请先连接钱包'}
        </button>
      </div>
    </div>
  );

  const renderRedeem = () => (
    <div>
      <h1 className="gradient-text" style={{ 
        fontSize: isMobile ? '2em' : '2.5em', 
        marginBottom: isMobile ? '20px' : '30px',
        textAlign: isMobile ? 'center' : 'left'
      }}>
        🔄 质押赎回
      </h1>
      
      <div className="frosty-card" style={{ 
        padding: isMobile ? '16px' : '24px',
        marginBottom: isMobile ? '16px' : '20px'
      }}>
        <h3 style={{ 
          marginBottom: '20px', 
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: isMobile ? '16px' : '18px'
        }}>
          选择赎回资产
        </h3>
        <select className="demo-input touch-feedback" style={{
          width: '100%',
          padding: isMobile ? '14px 16px' : '12px 16px',
          background: 'rgba(26, 31, 44, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: isMobile ? '16px' : '14px',
          marginBottom: '20px'
        }}>
          <option>vDOT (可赎回: 124.25)</option>
          <option>vGLMR (可赎回: 850.25)</option>
          <option>vKSM (可赎回: 45.85)</option>
        </select>

        <h4 style={{ 
          color: 'rgba(255, 255, 255, 0.9)', 
          marginBottom: '16px',
          fontSize: isMobile ? '14px' : '16px'
        }}>
          赎回类型
        </h4>
        <div style={{ margin: '15px 0' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center',
            margin: '12px 0',
            color: 'rgba(255, 255, 255, 0.8)',
            cursor: 'pointer',
            fontSize: isMobile ? '14px' : '16px',
            padding: isMobile ? '8px' : '4px'
          }}>
            <input 
              type="radio" 
              name="redeemType" 
              value="standard" 
              defaultChecked 
              style={{ 
                marginRight: '12px',
                transform: isMobile ? 'scale(1.2)' : 'scale(1)'
              }}
            />
            <span>标准赎回 (28天解锁，手续费 0.5%)</span>
          </label>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center',
            margin: '12px 0',
            color: 'rgba(255, 255, 255, 0.8)',
            cursor: 'pointer',
            fontSize: isMobile ? '14px' : '16px',
            padding: isMobile ? '8px' : '4px'
          }}>
            <input 
              type="radio" 
              name="redeemType" 
              value="instant" 
              style={{ 
                marginRight: '12px',
                transform: isMobile ? 'scale(1.2)' : 'scale(1)'
              }}
            />
            <span>即时赎回 (立即到账，手续费 3%)</span>
          </label>
        </div>

        <h4 style={{ 
          color: 'rgba(255, 255, 255, 0.9)', 
          marginBottom: '12px',
          fontSize: isMobile ? '14px' : '16px'
        }}>
          赎回数量
        </h4>
        <input
          type="number"
          placeholder="输入赎回数量"
          className="demo-input touch-feedback"
          style={{
            width: '100%',
            padding: isMobile ? '14px 16px' : '12px 16px',
            background: 'rgba(26, 31, 44, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: isMobile ? '16px' : '14px',
            marginBottom: '20px'
          }}
        />

        <button 
          className="demo-btn touch-feedback"
          disabled={!isWalletConnected || isLoading}
          style={{
            width: '100%',
            padding: isMobile ? '16px 24px' : '14px 24px',
            background: (isWalletConnected && !isLoading) ? 'linear-gradient(135deg, #FF6B35, #F7931E)' : 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '12px',
            color: '#FFFFFF',
            fontSize: isMobile ? '16px' : '16px',
            fontWeight: '600',
            cursor: (isWalletConnected && !isLoading) ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            opacity: (isWalletConnected && !isLoading) ? 1 : 0.6,
            minHeight: isMobile ? '48px' : 'auto'
          }}
        >
          {isLoading ? (
            <span className="loading-spinner" style={{ marginRight: '8px' }}></span>
          ) : null}
          {isLoading ? '处理中...' : isWalletConnected ? '确认赎回' : '请先连接钱包'}
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(currentPage) {
      case 'stake': return renderStake();
      case 'redeem': return renderRedeem();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen smooth-scroll" {...(isMobile ? swipeHandlers : {})}>
      {/* 加载覆盖层 */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>处理中...</p>
          </div>
        </div>
      )}
      
      {/* 错误消息 */}
      {error && (
        <div className="error-message">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
      
      {/* 成功消息 */}
      {success && (
        <div className="success-message">
          <span>✓</span>
          <span>{success}</span>
        </div>
      )}

      {/* 头部导航 */}
      <div className="frosty-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 className="gradient-text" style={{ margin: 0, fontSize: isMobile ? '1.4em' : '1.8em', fontWeight: 700 }}>
            🌟 FrostyFlow
          </h2>
        </div>
        
        {/* 桌面端导航 */}
        {!isMobile && (
          <div className="navigation-bar">
            <button 
              className={`nav-btn touch-feedback ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => handlePageChange('dashboard')}
              aria-label="资产总览"
            >
              📊 资产总览
              {!isMobile && <span className="sr-only"> (Ctrl+1)</span>}
            </button>
            <button 
              className={`nav-btn touch-feedback ${currentPage === 'stake' ? 'active' : ''}`}
              onClick={() => handlePageChange('stake')}
              aria-label="质押铸造"
            >
              💰 质押铸造
              {!isMobile && <span className="sr-only"> (Ctrl+2)</span>}
            </button>
            <button 
              className={`nav-btn touch-feedback ${currentPage === 'redeem' ? 'active' : ''}`}
              onClick={() => handlePageChange('redeem')}
              aria-label="质押赎回"
            >
              🔄 质押赎回
              {!isMobile && <span className="sr-only"> (Ctrl+3)</span>}
            </button>
          </div>
        )}
        
        {/* 移动端汉堡菜单按钮 */}
        {isMobile && (
          <button 
            className="mobile-nav-toggle touch-feedback"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="切换菜单"
          >
            {mobileNavOpen ? '✕' : '☰'}
          </button>
        )}

        {/* 钱包连接按钮 */}
        <button 
          className={`wallet-connect-btn touch-feedback ${isWalletConnected ? 'connected' : ''}`}
          onClick={() => isWalletConnected ? handleWalletDisconnect() : setShowWalletModal(true)}
          disabled={isLoading}
          aria-label={isWalletConnected ? '断开钱包' : '连接钱包'}
        >
          {isLoading ? (
            <span className="loading-spinner" style={{ width: '16px', height: '16px' }}></span>
          ) : isWalletConnected ? (
            <span>🔴 断开连接</span>
          ) : (
            <span>👛 连接钱包</span>
          )}
        </button>
        
        {/* 移动端导航菜单 */}
        {isMobile && (
          <div className={`navigation-bar ${mobileNavOpen ? 'mobile-visible' : 'mobile-hidden'}`}>
            <button 
              className={`nav-btn touch-feedback ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => handlePageChange('dashboard')}
              aria-label="资产总览"
            >
              📊 资产总览
            </button>
            <button 
              className={`nav-btn touch-feedback ${currentPage === 'stake' ? 'active' : ''}`}
              onClick={() => handlePageChange('stake')}
              aria-label="质押铸造"
            >
              💰 质押铸造
            </button>
            <button 
              className={`nav-btn touch-feedback ${currentPage === 'redeem' ? 'active' : ''}`}
              onClick={() => handlePageChange('redeem')}
              aria-label="质押赎回"
            >
              🔄 质押赎回
            </button>
          </div>
        )}
      </div>

      {/* 主要内容 */}
      <div className="container" style={{ padding: isMobile ? '16px' : '40px 20px' }}>
        {/* 移动端滑动提示 */}
        {isMobile && currentPageIndex > 0 && (
          <div style={{ 
            textAlign: 'center', 
            color: 'rgba(255, 255, 255, 0.6)', 
            fontSize: '12px', 
            marginBottom: '16px' 
          }}>
            ← 滑动切换页面 →
          </div>
        )}
        
        {renderContent()}
        
        {/* 系统状态指示器 */}
        <div className="frosty-card" style={{ 
          background: 'rgba(16, 185, 129, 0.1)', 
          borderColor: 'rgba(16, 185, 129, 0.2)',
          marginTop: '30px',
          padding: isMobile ? '16px' : '24px'
        }}>
          <h4 style={{ 
            margin: '0 0 15px 0', 
            color: '#10B981',
            fontSize: isMobile ? '14px' : '16px'
          }}>
            ✅ 系统运行状态
          </h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: isMobile ? '8px' : '10px' 
          }}>
            <p style={{ 
              margin: '5px 0', 
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: isMobile ? '13px' : '14px'
            }}>
              🟢 前端界面: 正常
            </p>
            <p style={{ 
              margin: '5px 0', 
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: isMobile ? '13px' : '14px'
            }}>
              🟢 模拟数据: 已加载
            </p>
            <p style={{ 
              margin: '5px 0', 
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: isMobile ? '13px' : '14px'
            }}>
              🟢 交互功能: 正常
            </p>
            <p style={{ 
              margin: '5px 0', 
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: isMobile ? '13px' : '14px'
            }}>
              {isWalletConnected ? '🟢' : '🟡'} 钱包状态: {isWalletConnected ? '已连接' : '未连接'}
            </p>
            {walletStatus?.currentNetwork && (
              <p style={{ 
                margin: '5px 0', 
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: isMobile ? '13px' : '14px'
              }}>
                🟢 网络: {walletStatus.currentNetwork.name}
              </p>
            )}
            {walletStatus?.selectedAccount && (
              <p style={{ 
                margin: '5px 0', 
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: isMobile ? '13px' : '14px'
              }}>
                🟢 账户: {walletStatus.selectedAccount.meta?.name || '默认账户'}
              </p>
            )}
            {networkStatus && (
              <>
                <p style={{ 
                  margin: '5px 0', 
                  color: networkStatus.isConnected ? 'rgba(255, 255, 255, 0.9)' : '#ff4d4f',
                  fontSize: isMobile ? '13px' : '14px'
                }}>
                  {networkStatus.isConnected ? '🟢' : '🔴'} 网络: {networkStatus.networkName || '未连接'}
                </p>
                {networkStatus.blockHeight > 0 && (
                  <p style={{ 
                    margin: '5px 0', 
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: isMobile ? '13px' : '14px'
                  }}>
                    🟢 区块高度: {networkStatus.blockHeight.toLocaleString()}
                  </p>
                )}
                {networkStatus.latency > 0 && (
                  <p style={{ 
                    margin: '5px 0', 
                    color: networkStatus.latency < 500 ? '#52c41a' : networkStatus.latency < 1000 ? '#faad14' : '#ff4d4f',
                    fontSize: isMobile ? '13px' : '14px'
                  }}>
                    🟢 网络延迟: {networkStatus.latency}ms
                  </p>
                )}
              </>
            )}
            {isMobile && (
              <p style={{ 
                margin: '5px 0', 
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '12px'
              }}>
                📱 设备: {deviceType} | 支持滑动导航
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* 钱包连接模态框 */}
      <WalletConnector
        visible={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onConnected={handleWalletConnected}
      />
    </div>
  );
}

export default App;