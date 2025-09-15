// 简化布局组件
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Layout as AntLayout,
  Menu,
  Button,
  Typography,
  Drawer
} from 'antd';
import {
  DashboardOutlined,
  SwapOutlined,
  ReloadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  WalletOutlined
} from '@ant-design/icons';

const { Header, Content } = AntLayout;
const { Text } = Typography;

const SimpleLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  
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
    }
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
    setMobileDrawerVisible(false);
  };

  // 检查是否为移动端
  const isMobile = window.innerWidth < 768;

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {/* 桌面端侧边栏 */}
      {!isMobile && (
        <AntLayout.Sider 
          collapsed={collapsed} 
          style={{ 
            position: 'fixed', 
            height: '100vh', 
            left: 0, 
            top: 0, 
            bottom: 0,
            background: '#1a1a1a'
          }}
        >
          <div style={{ padding: '16px', textAlign: 'center' }}>
            {collapsed ? (
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>F</Text>
            ) : (
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>FrostyFlow</Text>
            )}
          </div>
          
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ background: '#1a1a1a' }}
          />
        </AntLayout.Sider>
      )}

      {/* 移动端抽屉菜单 */}
      {isMobile && (
        <Drawer
          title="FrostyFlow"
          placement="left"
          onClose={() => setMobileDrawerVisible(false)}
          open={mobileDrawerVisible}
          width={250}
        >
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
          />
        </Drawer>
      )}

      <AntLayout 
        style={{ 
          marginLeft: isMobile ? 0 : (collapsed ? 80 : 200),
          background: '#1a1a1a'
        }}
      >
        <Header style={{ 
          background: '#262626', 
          padding: '0 16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 1
        }}>
          {isMobile ? (
            <Button
              type="text"
              icon={<MenuUnfoldOutlined />}
              onClick={() => setMobileDrawerVisible(true)}
              style={{ color: 'white' }}
            />
          ) : (
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined style={{ color: 'white' }} /> : <MenuFoldOutlined style={{ color: 'white' }} />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ color: 'white' }}
            />
          )}
          
          <Button type="primary" icon={<WalletOutlined />}>
            连接钱包
          </Button>
        </Header>

        <Content style={{ margin: isMobile ? '16px' : '24px', minHeight: 280 }}>
          <div style={{ 
            padding: isMobile ? '16px' : '24px', 
            background: 'rgba(38, 38, 38, 0.8)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            minHeight: 'calc(100vh - 120px)'
          }}>
            {children}
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default SimpleLayout;