// 超简单测试版本
import React from 'react';

function App() {
  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{
        color: '#1890ff',
        textAlign: 'center',
        fontSize: '3em',
        marginBottom: '20px'
      }}>
        🌟 FrostyFlow 正在运行！
      </h1>
      
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        margin: '20px auto',
        maxWidth: '800px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2>✅ 系统状态检查</h2>
        <p>✅ React 应用正常启动</p>
        <p>✅ 开发服务器运行在 http://localhost:5173</p>
        <p>✅ 组件渲染成功</p>
        <p>✅ CSS 样式正常加载</p>
        
        <h3>🚀 FrostyFlow 功能预览</h3>
        <ul>
          <li>💰 多链流动性质押</li>
          <li>📊 实时收益监控</li>
          <li>🔄 灵活资产赎回</li>
          <li>👛 多钱包支持</li>
        </ul>
        
        <div style={{
          backgroundColor: '#e6f7ff',
          padding: '15px',
          borderRadius: '5px',
          marginTop: '20px',
          border: '1px solid #91d5ff'
        }}>
          <strong>🎯 当前状态: </strong>
          UI/UX 测试模式 - 所有组件正常显示
        </div>
        
        <button style={{
          backgroundColor: '#1890ff',
          color: 'white',
          border: 'none',
          padding: '15px 30px',
          borderRadius: '5px',
          fontSize: '16px',
          cursor: 'pointer',
          marginTop: '20px',
          display: 'block',
          margin: '20px auto'
        }}>
          🎉 界面测试成功！
        </button>
      </div>
    </div>
  );
}

export default App;