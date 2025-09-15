// 完全工作的简单版本
import React from 'react';

function App() {
  const containerStyle = {
    padding: '40px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh'
  };

  const headerStyle = {
    backgroundColor: '#1890ff',
    color: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
    textAlign: 'center'
  };

  const cardStyle = {
    backgroundColor: 'white',
    padding: '20px',
    margin: '20px 0',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  };

  const buttonStyle = {
    backgroundColor: '#1890ff',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    marginRight: '10px',
    fontSize: '14px'
  };

  const statsStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  };

  const statCardStyle = {
    ...cardStyle,
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={{ margin: 0, fontSize: '2.5em' }}>🌟 FrostyFlow</h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '1.2em' }}>
          Bifrost 多链流动性质押平台
        </p>
      </div>

      {/* 导航菜单 */}
      <div style={cardStyle}>
        <h3>🧭 导航菜单</h3>
        <button style={buttonStyle}>📊 资产总览</button>
        <button style={buttonStyle}>💰 质押铸造</button>
        <button style={buttonStyle}>🔄 质押赎回</button>
        <button style={buttonStyle}>👛 连接钱包</button>
      </div>

      {/* 统计数据 */}
      <div style={statsStyle}>
        <div style={statCardStyle}>
          <h3 style={{ color: '#1890ff', margin: '0 0 10px 0' }}>总资产价值</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#52c41a' }}>
            $5,621.75
          </div>
        </div>
        
        <div style={statCardStyle}>
          <h3 style={{ color: '#1890ff', margin: '0 0 10px 0' }}>累计收益</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#52c41a' }}>
            $282.31
          </div>
        </div>
        
        <div style={statCardStyle}>
          <h3 style={{ color: '#1890ff', margin: '0 0 10px 0' }}>质押资产</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#722ed1' }}>
            3 种
          </div>
        </div>
        
        <div style={statCardStyle}>
          <h3 style={{ color: '#1890ff', margin: '0 0 10px 0' }}>活跃链</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#722ed1' }}>
            2 条
          </div>
        </div>
      </div>

      {/* 资产列表 */}
      <div style={cardStyle}>
        <h3>💎 我的质押资产</h3>
        
        <div style={{ ...cardStyle, backgroundColor: '#f9f9f9', margin: '15px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#1890ff' }}>DOT (Polkadot)</h4>
              <p style={{ margin: 0, color: '#666' }}>Bifrost Mainnet • APY: 15.8%</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>124.25 DOT</div>
              <div style={{ color: '#52c41a' }}>≈ $2,480.50</div>
            </div>
          </div>
        </div>
        
        <div style={{ ...cardStyle, backgroundColor: '#f9f9f9', margin: '15px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#1890ff' }}>GLMR (Moonbeam)</h4>
              <p style={{ margin: 0, color: '#666' }}>Moonbase Alpha • APY: 12.5%</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>850.25 GLMR</div>
              <div style={{ color: '#52c41a' }}>≈ $1,890.75</div>
            </div>
          </div>
        </div>
        
        <div style={{ ...cardStyle, backgroundColor: '#f9f9f9', margin: '15px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#1890ff' }}>KSM (Kusama)</h4>
              <p style={{ margin: 0, color: '#666' }}>Bifrost Mainnet • APY: 18.2%</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>45.85 KSM</div>
              <div style={{ color: '#52c41a' }}>≈ $1,250.30</div>
            </div>
          </div>
        </div>
      </div>

      {/* 功能区域 */}
      <div style={cardStyle}>
        <h3>🚀 快速操作</h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          开始您的流动性质押之旅，享受质押收益的同时保持资产流动性
        </p>
        
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button style={{ ...buttonStyle, backgroundColor: '#52c41a' }}>
            ➕ 开始质押
          </button>
          <button style={{ ...buttonStyle, backgroundColor: '#faad14' }}>
            📤 赎回资产
          </button>
          <button style={{ ...buttonStyle, backgroundColor: '#722ed1' }}>
            📊 收益分析
          </button>
          <button style={{ ...buttonStyle, backgroundColor: '#f5222d' }}>
            ⚙️ 设置
          </button>
        </div>
      </div>

      {/* 状态指示 */}
      <div style={{ ...cardStyle, backgroundColor: '#e6f7ff', borderLeft: '4px solid #1890ff' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#1890ff' }}>✅ 系统状态</h4>
        <p style={{ margin: '5px 0', color: '#52c41a' }}>🟢 前端界面: 正常运行</p>
        <p style={{ margin: '5px 0', color: '#52c41a' }}>🟢 模拟数据: 已加载</p>
        <p style={{ margin: '5px 0', color: '#52c41a' }}>🟢 UI组件: 正常显示</p>
        <p style={{ margin: '5px 0', color: '#faad14' }}>🟡 钱包连接: 模拟模式</p>
        <p style={{ margin: '5px 0', color: '#faad14' }}>🟡 链连接: 模拟模式</p>
      </div>

      {/* 底部信息 */}
      <div style={{ textAlign: 'center', marginTop: '30px', color: '#666' }}>
        <p>FrostyFlow v1.0 - 多链流动性质押一站式平台</p>
        <p>当前时间: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}

export default App;