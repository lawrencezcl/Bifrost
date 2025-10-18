// 主布局组件
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Layout as AntLayout,
  Menu,
  Button,
  Tooltip,
  Space,
  Typography,
  Switch,
  Dropdown,
  Avatar,
  Drawer
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
  SunOutlined,
  DownOutlined,
  DisconnectOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { connectWallet, disconnect, restoreWalletConnection } from '../store/slices/walletSlice';
import WalletConnector from './WalletConnector';
import ChainSelector from './ChainSelector';
import NotificationCenter from './NotificationCenter';
import TransactionMonitor from './TransactionMonitor';

const { Header, Sider, Content } = AntLayout;
const { Text } = Typography;

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux 状态
  const {
    isConnected,
    currentWallet,
    selectedAccount,
    accounts,
    isConnecting
  } = useSelector(state => state.wallet);

  const { currentNetwork, chainConnected } = useSelector(state => state.chain);

  // 本地状态
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [theme, setTheme] = useState('light');
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [txMonitorVisible, setTxMonitorVisible] = useState(false);

  // 监听屏幕尺寸变化
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileDrawerVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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

  // 组件初始化时恢复钱包连接
  useEffect(() => {
    dispatch(restoreWalletConnection());
  }, [dispatch]);

  // 处理钱包连接
  const handleConnectWallet = () => {
    setWalletModalVisible(true);
  };

  // 处理钱包断开
  const handleDisconnectWallet = () => {
    dispatch(disconnect());
  };

  // 处理钱包连接成功
  const handleWalletConnected = (walletData) => {
    setWalletModalVisible(false);
  };

  // 切换账户
  const handleSwitchAccount = (account) => {
    // 这里可以实现账户切换逻辑
    console.log('Switch to account:', account);
  };

  // 格式化地址
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 未读通知数量
  const unreadCount = 0;

  // 钱包下拉菜单
  const walletMenuItems = [
    {
      key: 'account',
      label: (
        <div>
          <Text strong>当前账户</Text>
          <br />
          <Text type="secondary">{formatAddress(selectedAccount?.address)}</Text>
        </div>
      ),
      disabled: true
    },
    {
      type: 'divider'
    },
    ...(accounts?.filter(acc => acc.address !== selectedAccount?.address).map(account => ({
      key: account.address,
      label: (
        <div onClick={() => handleSwitchAccount(account)}>
          <Text>{account.meta?.name || 'Unknown'}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {formatAddress(account.address)}
          </Text>
        </div>
      )
    })) || []),
    {
      type: 'divider'
    },
    {
      key: 'disconnect',
      label: (
        <Space>
          <DisconnectOutlined />
          断开连接
        </Space>
      ),
      onClick: handleDisconnectWallet,
      danger: true
    }
  ];

  return (
    <AntLayout className="min-h-screen">
      {/* 桌面端侧边栏 */}
      {!isMobile && (
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
      )}

      {/* 移动端抽屉菜单 */}
      <Drawer
        title={
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-bg-blue rounded-lg flex-center">
              <Text className="text-white font-bold">F</Text>
            </div>
            <Text className="text-lg font-bold">FrostyFlow</Text>
          </div>
        }
        placement="left"
        onClose={() => setMobileDrawerVisible(false)}
        open={isMobile && mobileDrawerVisible}
        bodyStyle={{ padding: 0 }}
        width={280}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={(item) => {
            handleMenuClick(item);
            setMobileDrawerVisible(false);
          }}
          className="border-none"
        />
      </Drawer>

      {/* 主要内容区域 */}
      <AntLayout style={{ marginLeft: isMobile ? 0 : (sidebarCollapsed ? 80 : 200) }}>
        {/* 顶部导航栏 */}
        <Header className="bg-white shadow-sm px-4 flex-between">
          <div className="flex items-center space-x-4">
            {/* 桌面端侧边栏切换按钮 */}
            {!isMobile && (
              <Button
                type="text"
                icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
            )}

            {/* 移动端菜单按钮 */}
            {isMobile && (
              <Button
                type="text"
                icon={<MenuUnfoldOutlined />}
                onClick={() => setMobileDrawerVisible(true)}
              />
            )}

            {/* 链选择器 - 移动端隐藏 */}
            {!isMobile && <ChainSelector />}
          </div>

          <div className="flex items-center space-x-4">
            {/* 主题切换 */}
            <Tooltip title={theme === 'light' ? '切换到暗黑模式' : '切换到明亮模式'}>
              <Button
                type="text"
                icon={theme === 'light' ? <MoonOutlined /> : <SunOutlined />}
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              />
            </Tooltip>

            {/* 通知中心 */}
            <NotificationCenter />

            {/* 交易监控 - 只在连接钱包后显示 */}
            {isConnected && (
              <Tooltip title="交易历史">
                <Button
                  type="text"
                  icon={<HistoryOutlined />}
                  onClick={() => setTxMonitorVisible(true)}
                />
              </Tooltip>
            )}

            {/* 钱包连接状态 */}
            {!isConnected ? (
              <Button
                type="primary"
                icon={<WalletOutlined />}
                onClick={handleConnectWallet}
                className="wallet-connect-btn"
                loading={isConnecting}
                size={isMobile ? 'small' : 'middle'}
              >
                {!isMobile && (isConnecting ? '连接中...' : '连接钱包')}
              </Button>
            ) : (
              <Dropdown
                menu={{ items: walletMenuItems }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Button className="wallet-connect-btn" size={isMobile ? 'small' : 'middle'}>
                  <Space>
                    <Avatar
                      size="small"
                      style={{
                        backgroundColor: '#1890ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {selectedAccount?.meta?.name?.charAt(0) || 'W'}
                    </Avatar>
                    {!isMobile && (
                      <Text style={{ color: 'white' }}>
                        {selectedAccount?.meta?.name || formatAddress(selectedAccount?.address)}
                      </Text>
                    )}
                    <DownOutlined style={{ color: 'white' }} />
                  </Space>
                </Button>
              </Dropdown>
            )}
          </div>
        </Header>

        {/* 内容区域 */}
        <Content
          className="bg-gray-50 min-h-full"
          style={{
            padding: isMobile ? '16px' : '24px',
            marginLeft: 0
          }}
        >
          <div className="fade-in">
            {children}
          </div>
        </Content>
      </AntLayout>

      {/* 钱包连接模态框 */}
      <WalletConnector
        visible={walletModalVisible}
        onClose={() => setWalletModalVisible(false)}
        onConnected={handleWalletConnected}
      />

      {/* 交易监控抽屉 */}
      <TransactionMonitor
        visible={txMonitorVisible}
        onClose={() => setTxMonitorVisible(false)}
        accountAddress={selectedAccount?.address}
      />
    </AntLayout>
  );
};

export default Layout;