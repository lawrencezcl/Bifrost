// 测试版Dashboard
import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Statistic, Button, List, Space } from 'antd';
import { WalletOutlined, RiseOutlined, DollarOutlined, GoldOutlined } from '@ant-design/icons';
import mockService from '../services/mockService';

const { Title, Text } = Typography;

const TestDashboard = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadMockData();
  }, []);
  
  const loadMockData = async () => {
    try {
      setLoading(true);
      // 模拟加载延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 获取模拟资产数据
      const mockAssets = await mockService.getUserAssets('mock-address');
      setAssets(mockAssets);
      
      setLoading(false);
    } catch (error) {
      console.error('加载模拟数据失败:', error);
      setLoading(false);
    }
  };
  
  const totalValue = assets.reduce((sum, asset) => sum + asset.totalValue, 0);
  const totalYield = assets.reduce((sum, asset) => sum + asset.yieldEarned, 0);
  
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>FrostyFlow 资产总览</Title>
      <Text type="secondary">欢迎使用 Bifrost 多链流动性质押平台</Text>
      
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总资产价值"
              value={totalValue}
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
              value={totalYield}
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
              value={assets.length}
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

      <Card title="我的资产" style={{ marginTop: '24px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <WalletOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
            <Title level={4}>加载中...</Title>
            <Text type="secondary">
              正在加载您的资产信息...
            </Text>
          </div>
        ) : assets.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={assets}
            renderItem={asset => (
              <List.Item>
                <List.Item.Meta
                  avatar={<GoldOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
                  title={
                    <Space>
                      <span>{asset.symbol}</span>
                      <span style={{ color: '#52c41a', fontSize: '14px' }}>
                        APY: {asset.apy}%
                      </span>
                    </Space>
                  }
                  description={
                    <div>
                      <div>链: {asset.chainName}</div>
                      <div>价格: ${asset.price.toFixed(2)}</div>
                    </div>
                  }
                />
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    ${asset.totalValue.toFixed(2)}
                  </div>
                  <div style={{ color: '#52c41a' }}>
                    收益: ${asset.yieldEarned.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                    余额: {asset.balance.free} {asset.symbol}
                  </div>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <WalletOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
            <Title level={4}>暂无资产</Title>
            <Text type="secondary">
              您还没有质押任何资产
            </Text>
            <div style={{ marginTop: '20px' }}>
              <Button type="primary" icon={<WalletOutlined />} size="large">
                开始质押
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TestDashboard;