// 资产总览主页
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Button,
  Space,
  Alert
} from 'antd';
import {
  WalletOutlined,
  SwapOutlined,
  ReloadOutlined,
  RiseOutlined,
  PlusOutlined
} from '@ant-design/icons';

import mockService from '../services/mockService';

const { Title, Text, Paragraph } = Typography;

const Dashboard = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [mockAssets, setMockAssets] = useState([]);
  const [mockTotalValue, setMockTotalValue] = useState({ totalValue: 0, totalYield: 0 });

  const { isConnected: walletConnected, selectedAccount } = useSelector((state) => state.wallet);
  const { currentChain, isConnected: chainConnected } = useSelector((state) => state.chain);

  // 加载模拟数据
  const loadMockData = useCallback(async () => {
    try {
      setRefreshing(true);
      const assets = await mockService.getUserAssets(selectedAccount?.address || 'mock-address');
      setMockAssets(assets);

      // 计算总价值
      const totalValue = assets.reduce((sum, asset) => sum + asset.totalValue, 0);
      const totalYield = assets.reduce((sum, asset) => sum + asset.yieldEarned, 0);
      setMockTotalValue({ totalValue, totalYield });
    } catch (error) {
      console.error('加载模拟数据失败:', error);
    } finally {
      setRefreshing(false);
    }
  }, [selectedAccount]);

  // 页面初始化
  useEffect(() => {
    loadMockData();
  }, [loadMockData]);

  // 格式化余额
  const formatBalance = (balance, precision = 4) => {
    try {
      if (!balance || balance === '0') return '0';
      const num = parseFloat(balance);
      return num.toFixed(precision);
    } catch (error) {
      return '0';
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 手动刷新
  const handleRefresh = () => {
    loadMockData();
  };

  // 处理质押点击
  const handleStakeClick = (asset) => {
    console.log('点击质押:', asset.symbol);
    // 这里可以打开质押模态框
  };

  // 处理赎回点击
  const handleRedeemClick = (asset) => {
    console.log('点击赎回:', asset.symbol);
    // 这里可以打开赎回模态框
  };

  // 未连接钱包状态
  if (!walletConnected) {
    return (
      <div className="flex-center min-h-96">
        <Card className="text-center p-8">
          <WalletOutlined className="text-6xl text-gray-400 mb-4" />
          <Title level={3}>连接钱包开始使用</Title>
          <Paragraph type="secondary">
            连接您的Web3钱包来查看资产和进行流动性质押
          </Paragraph>
          <Button
            type="primary"
            size="large"
            icon={<WalletOutlined />}
            onClick={() => console.log('连接钱包')}
          >
            连接钱包
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex-between">
        <div>
          <Title level={2} className="mb-1">资产总览</Title>
          <Text type="secondary">
            查看您在各个链上的流动性质押资产
          </Text>
          {currentChain && (
            <div className="text-sm text-gray-400 mt-1">
              当前链：{currentChain.name}
            </div>
          )}
          {selectedAccount && (
            <div className="text-sm text-gray-400">
              当前账户：{formatAddress(selectedAccount.address)}
            </div>
          )}
        </div>

        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={refreshing}
          >
            刷新
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => console.log('开始质押')}
          >
            开始质押
          </Button>
        </Space>
      </div>

      {!chainConnected && (
        <Alert
          type="warning"
          message="尚未连接到区块链网络"
          description="请连接支持的链以查看真实资产数据，目前展示的是模拟资产信息。"
          showIcon
        />
      )}

      {/* 总览统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总资产价值"
              value={mockTotalValue.totalValue}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="累计收益"
              value={mockTotalValue.totalYield}
              precision={2}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="质押资产数"
              value={mockAssets.length}
              suffix="种"
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃链数"
              value={2}
              suffix="条"
            />
          </Card>
        </Col>
      </Row>

      {/* 资产列表 */}
      <Card 
        title="我的资产" 
        className="frosty-card"
        extra={
          <Space>
            <Text type="secondary" className="text-sm">
              最后更新: 刚刚
            </Text>
          </Space>
        }
      >
        <div className="space-y-4">
          {mockAssets.map((asset) => (
            <Card key={asset.symbol} size="small" className="asset-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex-center">
                    <Text className="font-bold text-blue-600 text-lg">
                      {asset.symbol.charAt(0)}
                    </Text>
                  </div>
                  <div>
                    <Text className="font-medium text-lg">{asset.symbol}</Text>
                    <br />
                    <Text type="secondary">{asset.chainName}</Text>
                  </div>
                </div>
                
                <div className="text-right">
                  <Text className="font-medium">
                    {formatBalance(asset.balance.free, 2)} {asset.symbol}
                  </Text>
                  <br />
                  <Text type="secondary">
                    锁定: {formatBalance(asset.balance.locked, 2)}
                  </Text>
                  <br />
                  <Text className="text-sm" style={{ color: '#52c41a' }}>
                    USD: ${asset.totalValue.toFixed(2)}
                  </Text>
                </div>
                
                <div>
                  <Space>
                    <Button
                      type="primary"
                      size="small"
                      icon={<SwapOutlined />}
                      onClick={() => handleStakeClick(asset)}
                    >
                      质押
                    </Button>
                    <Button
                      size="small"
                      icon={<ReloadOutlined />}
                      onClick={() => handleRedeemClick(asset)}
                    >
                      赎回
                    </Button>
                  </Space>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* 模拟数据提示 */}
      <Alert
        message="演示模式"
        description="当前显示的是模拟数据，用于演示界面功能。实际使用时将连接真实的链上数据。"
        type="info"
        showIcon
        closable
      />
    </div>
  );
};

export default Dashboard;