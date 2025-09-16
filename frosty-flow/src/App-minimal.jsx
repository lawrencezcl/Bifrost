// 工作版App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ConfigProvider, Card, Typography, Menu, Row, Col, Statistic, Button, Layout } from 'antd';
import { DashboardOutlined, SwapOutlined, ReloadOutlined, WalletOutlined, RiseOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Header, Content } = Layout;

const Dashboard = () => (
  <div style={{ padding: '20px' }}>
    <Title level={2}>🌟 FrostyFlow Dashboard</Title>
    <Text type="secondary">欢迎使用 Bifrost 多链流动性质押平台</Text>
    
    <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="总资产价值"
            value={5621.75}
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
            value={282.31}
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
            value={3}
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
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <WalletOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
        <Title level={4}>模拟数据展示</Title>
        <Text type="secondary">
          这里显示您的流动性质押资产信息
        </Text>
        <div style={{ marginTop: '20px' }}>
          <Button type="primary" icon={<SwapOutlined />}>
            开始质押
          </Button>
        </div>
      </div>
    </Card>
  </div>
);

const StakeMint = () => (
  <div style={{ padding: '20px' }}>
    <Card>
      <Title level={2}>质押铸造</Title>
      <Text>质押铸造功能页面 - 将您的代币质押以获得流动性质押代币</Text>
      <div style={{ marginTop: '20px' }}>
        <Button type="primary">模拟质押操作</Button>
      </div>
    </Card>
  </div>
);

const StakeRedeem = () => (
  <div style={{ padding: '20px' }}>
    <Card>
      <Title level={2}>质押赎回</Title>
      <Text>质押赎回功能页面 - 赎回您的流动性质押代币</Text>
      <div style={{ marginTop: '20px' }}>
        <Button type="primary">模拟赎回操作</Button>
      </div>
    </Card>
  </div>
);

const Navigation = () => {
  const location = useLocation();
  
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">资产总览</Link>,
    },
    {
      key: '/stake',
      icon: <SwapOutlined />,
      label: <Link to="/stake">质押铸造</Link>,
    },
    {
      key: '/redeem',
      icon: <ReloadOutlined />,
      label: <Link to="/redeem">质押赎回</Link>,
    },
  ];

  return (
    <Header style={{ background: '#fff', padding: '0 20px', borderBottom: '1px solid #f0f0f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Title level={3} style={{ margin: 0, color: '#1890ff' }}>FrostyFlow</Title>
        
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ border: 'none', flex: 1, justifyContent: 'center' }}
        />
        
        <Button type="primary" icon={<WalletOutlined />}>
          连接钱包
        </Button>
      </div>
    </Header>
  );
};

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Navigation />
          <Content style={{ background: '#f0f2f5' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/stake" element={<StakeMint />} />
              <Route path="/redeem" element={<StakeRedeem />} />
            </Routes>
          </Content>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;