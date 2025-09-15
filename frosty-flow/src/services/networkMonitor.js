// 网络连接状态监控服务
import walletService from './walletService';

class NetworkMonitor {
  constructor() {
    this.listeners = [];
    this.isMonitoring = false;
    this.networkStatus = {
      isConnected: false,
      latency: 0,
      blockHeight: 0,
      networkName: '',
      lastUpdate: null,
      error: null
    };
    this.monitorInterval = null;
    this.pingInterval = null;
  }

  // 开始监控网络状态
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('Starting network monitoring...');
    
    // 每10秒检查一次网络状态
    this.monitorInterval = setInterval(() => {
      this.checkNetworkStatus();
    }, 10000);
    
    // 每30秒ping一次网络延迟
    this.pingInterval = setInterval(() => {
      this.pingNetwork();
    }, 30000);
    
    // 初始检查
    this.checkNetworkStatus();
  }

  // 停止监控
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    console.log('Stopping network monitoring...');
    
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  // 检查网络连接状态
  async checkNetworkStatus() {
    try {
      const status = walletService.getStatus();
      
      if (!status.isNetworkConnected || !walletService.api) {
        this.updateStatus({
          isConnected: false,
          error: 'Network not connected',
          lastUpdate: Date.now()
        });
        return;
      }

      const api = walletService.api;
      
      // 获取最新区块信息
      const header = await api.rpc.chain.getHeader();
      const blockNumber = header.number.toNumber();
      
      // 获取网络信息
      const chainName = await api.rpc.system.chain();
      const version = await api.rpc.system.version();
      
      this.updateStatus({
        isConnected: true,
        blockHeight: blockNumber,
        networkName: chainName.toString(),
        version: version.toString(),
        error: null,
        lastUpdate: Date.now()
      });
      
      console.log('Network status updated:', {
        blockHeight: blockNumber,
        networkName: chainName.toString()
      });
      
    } catch (error) {
      console.error('Failed to check network status:', error);
      
      this.updateStatus({
        isConnected: false,
        error: error.message,
        lastUpdate: Date.now()
      });
    }
  }

  // 测试网络延迟
  async pingNetwork() {
    if (!walletService.api) return;
    
    try {
      const startTime = Date.now();
      
      // 使用一个轻量级的RPC调用来测试延迟
      await walletService.api.rpc.system.name();
      
      const latency = Date.now() - startTime;
      
      this.updateStatus({
        latency,
        lastUpdate: Date.now()
      });
      
      console.log('Network latency:', latency, 'ms');
      
    } catch (error) {
      console.error('Failed to ping network:', error);
      
      this.updateStatus({
        latency: -1, // -1 表示ping失败
        error: error.message,
        lastUpdate: Date.now()
      });
    }
  }

  // 更新网络状态
  updateStatus(updates) {
    const previousStatus = { ...this.networkStatus };
    this.networkStatus = { ...this.networkStatus, ...updates };
    
    // 通知所有监听器
    this.listeners.forEach(listener => {
      try {
        listener(this.networkStatus, previousStatus);
      } catch (error) {
        console.error('Network status listener error:', error);
      }
    });
  }

  // 添加状态监听器
  addListener(callback) {
    this.listeners.push(callback);
    
    // 立即返回当前状态
    callback(this.networkStatus, null);
    
    // 返回取消监听的函数
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // 获取当前网络状态
  getStatus() {
    return { ...this.networkStatus };
  }

  // 检查网络健康状态
  getHealthStatus() {
    const { isConnected, latency, lastUpdate, error } = this.networkStatus;
    
    if (!isConnected || error) {
      return {
        status: 'error',
        message: error || 'Network disconnected',
        color: '#ff4d4f'
      };
    }
    
    // 检查数据是否过期（超过1分钟没有更新）
    if (lastUpdate && Date.now() - lastUpdate > 60000) {
      return {
        status: 'warning',
        message: 'Network data outdated',
        color: '#faad14'
      };
    }
    
    // 根据延迟判断网络质量
    if (latency > 0) {
      if (latency < 200) {
        return {
          status: 'excellent',
          message: `Excellent (${latency}ms)`,
          color: '#52c41a'
        };
      } else if (latency < 500) {
        return {
          status: 'good',
          message: `Good (${latency}ms)`,
          color: '#1890ff'
        };
      } else if (latency < 1000) {
        return {
          status: 'slow',
          message: `Slow (${latency}ms)`,
          color: '#faad14'
        };
      } else {
        return {
          status: 'poor',
          message: `Poor (${latency}ms)`,
          color: '#ff7875'
        };
      }
    }
    
    return {
      status: 'connected',
      message: 'Connected',
      color: '#52c41a'
    };
  }

  // 获取网络统计信息
  getNetworkStats() {
    const health = this.getHealthStatus();
    
    return {
      ...this.networkStatus,
      health,
      uptime: this.isMonitoring ? 'Monitoring' : 'Stopped',
      lastUpdateFormatted: this.networkStatus.lastUpdate 
        ? new Date(this.networkStatus.lastUpdate).toLocaleTimeString()
        : 'Never'
    };
  }

  // 强制重新连接网络
  async reconnect() {
    try {
      console.log('Attempting to reconnect to network...');
      
      const status = walletService.getStatus();
      if (status.currentNetwork) {
        await walletService.connectToNetwork(status.currentNetwork.chainId);
        await this.checkNetworkStatus();
        return true;
      }
      
      throw new Error('No network configuration available');
    } catch (error) {
      console.error('Failed to reconnect:', error);
      
      this.updateStatus({
        isConnected: false,
        error: `Reconnection failed: ${error.message}`,
        lastUpdate: Date.now()
      });
      
      return false;
    }
  }

  // 切换到不同的网络
  async switchNetwork(networkKey) {
    try {
      console.log('Switching to network:', networkKey);
      
      // 停止当前监控
      this.stopMonitoring();
      
      // 连接到新网络
      await walletService.connectToNetwork(networkKey);
      
      // 重新开始监控
      this.startMonitoring();
      
      return true;
    } catch (error) {
      console.error('Failed to switch network:', error);
      
      this.updateStatus({
        isConnected: false,
        error: `Network switch failed: ${error.message}`,
        lastUpdate: Date.now()
      });
      
      return false;
    }
  }

  // 获取网络错误历史
  getErrorHistory() {
    // 这里可以实现错误日志记录
    // 暂时返回当前错误状态
    return this.networkStatus.error ? [
      {
        timestamp: this.networkStatus.lastUpdate,
        error: this.networkStatus.error,
        severity: 'error'
      }
    ] : [];
  }
}

// 导出单例实例
export const networkMonitor = new NetworkMonitor();
export default networkMonitor;