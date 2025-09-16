// 主布局组件
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Layout as AntLayout,
  Menu,
  Button,
  Tooltip,
  Typography,
  Space,
  Badge
} from 'antd';
import {
  DashboardOutlined,
  SwapOutlined,
  ReloadOutlined,
  PieChartOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  WalletOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  SunOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = AntLayout;
const { Text } = Typography;

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const walletState = useSelector((state) => state.wallet);
  const chainState = useSelector((state) => state.chain);
  const notifications = useSelector((state) => state.ui.activeNotifications);

  // 本地状态
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState('light');

  const walletConnected = walletState.isConnected;
  const selectedAccount = walletState.selectedAccount;
  const currentChain = chainState.currentChain;
  const chainConnected = chainState.isConnected;
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  // 侧边栏菜单项
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '资产总览',
    },
    {
      key: '/stake',
      icon: <SwapOutlined />,
      label: '质押铸造',
    },
    {
      key: '/redeem', 
      icon: <ReloadOutlined />,
      label: '质押赎回',
    },
    {
      key: '/analytics',
      icon: <PieChartOutlined />,
      label: '收益分析',
      disabled: true, // 暂未实现
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      key: '/help',
      icon: <QuestionCircleOutlined />,
      label: '帮助中心',
    },
  ];

  // 处理菜单点击
  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  // 未读通知数量
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <AntLayout className="min-h-screen">
      {/* 侧边栏 */}
      <Sider
        collapsed={sidebarCollapsed}
        className="frosty-card"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div className="flex-center p-4">
          {sidebarCollapsed ? (
            <div className="w-8 h-8 gradient-bg-blue rounded-lg flex-center">
              <Text className="text-white font-bold">F</Text>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-bg-blue rounded-lg flex-center">
                <Text className="text-white font-bold">F</Text>
              </div>
              <Text className="text-lg font-bold">FrostyFlow</Text>
            </div>
          )}
        </div>

        {/* 菜单 */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="border-none"
        />
      </Sider>

      {/* 主要内容区域 */}
      <AntLayout style={{ marginLeft: sidebarCollapsed ? 80 : 200 }}>
        {/* 顶部导航栏 */}
        <Header className="bg-white shadow-sm px-4 flex-between">
          <div className="flex items-center space-x-4">
            <Button
              type="text"
              icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            <div className="flex items-center space-x-2">
              <span>链选择器</span>
              {currentChain && (
                <Badge
                  color={chainConnected ? '#52c41a' : '#faad14'}
                  text={currentChain.name}
                />
              )}
            </div>
          </div>

          <Space align="center" size="middle">
            {/* 主题切换 */}
            <Tooltip title={theme === 'light' ? '切换到暗黑模式' : '切换到明亮模式'}>
              <Button
                type="text"
                icon={theme === 'light' ? <MoonOutlined /> : <SunOutlined />}
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              />
            </Tooltip>

            {/* 通知中心 */}
            <Badge count={unreadCount} size="small">
              <Button type="text" icon={<BellOutlined />} />
            </Badge>

            {/* 钱包连接状态 */}
            <Button
              type="primary"
              icon={<WalletOutlined />}
              onClick={() => console.log('连接钱包')}
              className="wallet-connect-btn"
            >
              {walletConnected && selectedAccount
                ? formatAddress(selectedAccount.address)
                : '连接钱包'}
            </Button>
          </Space>
        </Header>

        {/* 内容区域 */}
        <Content className="p-6 bg-gray-50 min-h-full">
          <div className="fade-in">
            {children}
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;