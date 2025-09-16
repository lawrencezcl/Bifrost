// 钱包连接组件
import React, { useState } from 'react';
import { Modal, Button, Card, Alert, Space, Typography, Spin, message } from 'antd';
import { WalletOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { SUPPORTED_WALLETS, NETWORKS, DEFAULT_NETWORK } from '../config/networks';
import walletService from '../services/walletService';

const { Title, Text, Paragraph } = Typography;

const WalletConnector = ({ visible, onClose, onConnected }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('select'); // 'select', 'connecting', 'network', 'connected'
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [walletStatus, setWalletStatus] = useState(null);
  const [networkStatus, setNetworkStatus] = useState(null);
  const [accounts, setAccounts] = useState([]);

  // 检查钱包扩展是否已安装
  const checkWalletInstalled = (walletId) => {
    switch (walletId) {
      case 'polkadot-js':
        return !!window.injectedWeb3?.['polkadot-js'];
      case 'talisman':
        return !!window.injectedWeb3?.talisman;
      case 'subwallet-js':
        return !!window.injectedWeb3?.['subwallet-js'];
      case 'metamask':
        return !!window.ethereum?.isMetaMask;
      default:
        return false;
    }
  };

  // 连接钱包
  const handleWalletConnect = async (walletId) => {
    try {
      setLoading(true);
      setSelectedWallet(walletId);
      setStep('connecting');

      // 检查钱包是否已安装
      if (!checkWalletInstalled(walletId)) {
        throw new Error(`${SUPPORTED_WALLETS[walletId.toUpperCase()]?.name || walletId} is not installed. Please install it first.`);
      }

      // 连接钱包
      const result = await walletService.connectWallet(walletId);
      
      if (result.success) {
        setWalletStatus(result);
        setAccounts(result.accounts);
        setStep('network');
        message.success('钱包连接成功！');
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      message.error(`钱包连接失败: ${error.message}`);
      setStep('select');
    } finally {
      setLoading(false);
    }
  };

  // 连接网络
  const handleNetworkConnect = async (networkKey = 'BIFROST_TESTNET') => {
    try {
      setLoading(true);
      
      const result = await walletService.connectToNetwork(networkKey);
      
      if (result.success) {
        setNetworkStatus(result);
        setStep('connected');
        message.success('网络连接成功！');
        
        // 获取账户余额
        if (walletStatus?.selectedAccount) {
          const balance = await walletService.getAccountBalance(walletStatus.selectedAccount.address);
          console.log('Account balance:', balance);
        }
        
        // 通知父组件连接成功
        if (onConnected) {
          onConnected({
            wallet: walletStatus,
            network: result,
            service: walletService
          });
        }
      }
    } catch (error) {
      console.error('Network connection failed:', error);
      message.error(`网络连接失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 重置状态
  const resetState = () => {
    setStep('select');
    setSelectedWallet(null);
    setWalletStatus(null);
    setNetworkStatus(null);
    setAccounts([]);
    setLoading(false);
  };

  // 关闭模态框
  const handleClose = () => {
    resetState();
    onClose();
  };

  // 渲染钱包选择步骤
  const renderWalletSelection = () => (
    <div>
      <Title level={3} style={{ textAlign: 'center', marginBottom: '24px' }}>
        选择钱包
      </Title>
      <div style={{ display: 'grid', gap: '16px' }}>
        {Object.entries(SUPPORTED_WALLETS).map(([key, wallet]) => {
          const isInstalled = checkWalletInstalled(wallet.id);
          
          return (
            <Card
              key={key}
              hoverable={isInstalled}
              style={{
                cursor: isInstalled ? 'pointer' : 'not-allowed',
                opacity: isInstalled ? 1 : 0.6
              }}
              onClick={() => isInstalled && handleWalletConnect(wallet.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <WalletOutlined style={{ fontSize: '20px' }} />
                  </div>
                  <div>
                    <Text strong>{wallet.name}</Text>
                    <br />
                    <Text type="secondary" size="small">
                      {wallet.supportedNetworks.join(', ')}
                    </Text>
                  </div>
                </div>
                
                {isInstalled ? (
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                ) : (
                  <Button 
                    size="small" 
                    type="link"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(wallet.downloadUrl, '_blank');
                    }}
                  >
                    安装
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      
      <Alert
        message="提示"
        description="请确保已安装并启用钱包扩展。如果您是第一次使用，请先创建账户。"
        type="info"
        style={{ marginTop: '16px' }}
      />
    </div>
  );

  // 渲染连接中步骤
  const renderConnecting = () => (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <Spin size="large" />
      <Title level={4} style={{ marginTop: '16px' }}>
        正在连接 {selectedWallet}...
      </Title>
      <Text type="secondary">
        请在钱包扩展中确认连接请求
      </Text>
    </div>
  );

  // 渲染网络选择步骤
  const renderNetworkSelection = () => (
    <div>
      <Title level={3} style={{ textAlign: 'center', marginBottom: '24px' }}>
        选择网络
      </Title>
      
      {walletStatus && (
        <Alert
          message="钱包连接成功"
          description={`已连接 ${accounts.length} 个账户，默认使用 ${walletStatus.selectedAccount?.meta?.name || '账户1'}`}
          type="success"
          style={{ marginBottom: '16px' }}
        />
      )}
      
      <div style={{ display: 'grid', gap: '16px' }}>
        {Object.entries(NETWORKS).map(([key, network]) => (
          <Card
            key={key}
            hoverable
            onClick={() => handleNetworkConnect(key)}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text strong>{network.name}</Text>
                <br />
                <Text type="secondary" size="small">
                  {network.symbol} • {network.chainType}
                </Text>
              </div>
              {key === 'BIFROST_TESTNET' && (
                <Text type="success" size="small">推荐</Text>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  // 渲染连接成功步骤
  const renderConnected = () => (
    <div style={{ textAlign: 'center' }}>
      <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
      <Title level={3}>连接成功！</Title>
      
      {walletStatus && networkStatus && (
        <div style={{ marginTop: '24px' }}>
          <Card>
            <div style={{ display: 'grid', gap: '12px', textAlign: 'left' }}>
              <div>
                <Text strong>钱包: </Text>
                <Text>{selectedWallet}</Text>
              </div>
              <div>
                <Text strong>网络: </Text>
                <Text>{networkStatus.network.name}</Text>
              </div>
              <div>
                <Text strong>账户: </Text>
                <Text>{walletStatus.selectedAccount?.meta?.name || '默认账户'}</Text>
              </div>
              <div>
                <Text strong>地址: </Text>
                <Text code>{walletStatus.selectedAccount?.address}</Text>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      <Button
        type="primary"
        size="large"
        style={{ marginTop: '24px' }}
        onClick={handleClose}
      >
        开始使用
      </Button>
    </div>
  );

  return (
    <Modal
      title="连接钱包"
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={500}
      centered
    >
      <Spin spinning={loading}>
        {step === 'select' && renderWalletSelection()}
        {step === 'connecting' && renderConnecting()}
        {step === 'network' && renderNetworkSelection()}
        {step === 'connected' && renderConnected()}
      </Spin>
    </Modal>
  );
};

export default WalletConnector;