// 交易历史查询服务
import { ApiPromise } from '@polkadot/api';
import { API_ENDPOINTS, TEST_CONFIG } from '../config/networks';
import walletService from './walletService';

class TransactionService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 60000; // 1分钟缓存
    this.isTestMode = TEST_CONFIG.enableTestMode;
  }

  // 获取账户交易历史
  async getTransactionHistory(address, limit = 50, offset = 0) {
    try {
      if (!address) {
        throw new Error('Account address is required');
      }

      console.log('Getting transaction history for:', address);

      const cacheKey = `tx_history_${address}_${limit}_${offset}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }

      let transactions;
      
      if (this.isTestMode) {
        transactions = this.generateMockTransactions(address, limit);
      } else {
        transactions = await this.fetchRealTransactions(address, limit, offset);
      }

      // 缓存结果
      this.cache.set(cacheKey, {
        data: transactions,
        timestamp: Date.now()
      });

      return transactions;
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      throw error;
    }
  }

  // 从区块链获取真实交易历史
  async fetchRealTransactions(address, limit, offset) {
    try {
      const status = walletService.getStatus();
      
      if (!status.isNetworkConnected) {
        throw new Error('Not connected to network');
      }

      const api = walletService.api;
      const transactions = [];

      // 使用Subscan API获取交易历史
      if (status.currentNetwork.blockExplorer) {
        try {
          const subscanTxs = await this.fetchFromSubscan(address, limit, offset);
          transactions.push(...subscanTxs);
        } catch (error) {
          console.warn('Failed to fetch from Subscan:', error);
        }
      }

      // 如果Subscan不可用，直接从链上查询最近的交易
      if (transactions.length === 0) {
        const chainTxs = await this.fetchFromChain(address, limit);
        transactions.push(...chainTxs);
      }

      return this.formatTransactions(transactions);
    } catch (error) {
      console.error('Failed to fetch real transactions:', error);
      return this.generateMockTransactions(address, limit);
    }
  }

  // 从Subscan API获取交易
  async fetchFromSubscan(address, limit, offset) {
    try {
      const network = walletService.currentNetwork;
      if (!network || !API_ENDPOINTS.SUBSCAN_API) {
        throw new Error('Subscan API not available');
      }

      const response = await fetch(`${API_ENDPOINTS.SUBSCAN_API}/api/scan/transfers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.REACT_APP_SUBSCAN_API_KEY || ''
        },
        body: JSON.stringify({
          address,
          row: limit,
          page: Math.floor(offset / limit)
        })
      });

      if (!response.ok) {
        throw new Error(`Subscan API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.code !== 0) {
        throw new Error(`Subscan API error: ${data.message}`);
      }

      return data.data.transfers || [];
    } catch (error) {
      console.error('Failed to fetch from Subscan:', error);
      throw error;
    }
  }

  // 从链上直接查询交易
  async fetchFromChain(address, limit) {
    try {
      const api = walletService.api;
      const transactions = [];

      // 获取最新的区块号
      const latestHeader = await api.rpc.chain.getHeader();
      const latestBlockNumber = latestHeader.number.toNumber();

      // 查询最近几个区块的交易
      const blocksToCheck = Math.min(100, latestBlockNumber);
      
      for (let i = 0; i < blocksToCheck && transactions.length < limit; i++) {
        const blockNumber = latestBlockNumber - i;
        const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
        const block = await api.rpc.chain.getBlock(blockHash);
        
        const blockTxs = await this.parseBlockTransactions(block, address, blockNumber);
        transactions.push(...blockTxs);
      }

      return transactions.slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch from chain:', error);
      return [];
    }
  }

  // 解析区块中的交易
  async parseBlockTransactions(block, address, blockNumber) {
    try {
      const api = walletService.api;
      const transactions = [];
      
      const blockTime = Date.now() - (block.header.number.toNumber() * 6000); // 假设6秒出块
      
      for (const extrinsic of block.block.extrinsics) {
        const { method, signer } = extrinsic;
        
        // 检查是否与指定地址相关
        const isRelevant = this.isTransactionRelevant(extrinsic, address);
        
        if (isRelevant) {
          const tx = {
            hash: extrinsic.hash.toString(),
            blockNumber,
            blockTime,
            from: signer?.toString() || 'system',
            to: this.extractToAddress(extrinsic),
            amount: this.extractAmount(extrinsic),
            asset: this.extractAsset(extrinsic),
            type: this.getTransactionType(method),
            status: 'success', // 在区块中的交易都是成功的
            fee: await this.calculateFee(extrinsic)
          };
          
          transactions.push(tx);
        }
      }
      
      return transactions;
    } catch (error) {
      console.error('Failed to parse block transactions:', error);
      return [];
    }
  }

  // 生成模拟交易数据
  generateMockTransactions(address, limit) {
    const transactions = [];
    const now = Date.now();
    
    const txTypes = ['stake', 'redeem', 'transfer', 'reward'];
    const assets = ['DOT', 'GLMR', 'KSM', 'BNC'];
    
    for (let i = 0; i < limit; i++) {
      const type = txTypes[Math.floor(Math.random() * txTypes.length)];
      const asset = assets[Math.floor(Math.random() * assets.length)];
      const amount = (Math.random() * 100 + 1).toFixed(4);
      
      transactions.push({
        hash: this.generateMockHash(),
        blockNumber: 12345678 - i,
        blockTime: now - (i * 3600000), // 每小时一笔交易
        from: i % 2 === 0 ? address : this.generateMockAddress(),
        to: i % 2 === 0 ? this.generateMockAddress() : address,
        amount,
        asset,
        type,
        status: Math.random() > 0.1 ? 'success' : 'failed',
        fee: '0.0001',
        isMock: true
      });
    }
    
    return transactions;
  }

  // 格式化交易数据
  formatTransactions(rawTransactions) {
    return rawTransactions.map(tx => ({
      ...tx,
      timeAgo: this.getTimeAgo(tx.blockTime),
      amountFormatted: this.formatAmount(tx.amount),
      statusColor: this.getStatusColor(tx.status),
      typeIcon: this.getTypeIcon(tx.type)
    }));
  }

  // 获取质押相关交易
  async getStakingTransactions(address, limit = 20) {
    try {
      const allTxs = await this.getTransactionHistory(address, limit * 2);
      
      // 过滤质押相关交易
      const stakingTxs = allTxs.filter(tx => 
        tx.type === 'stake' || 
        tx.type === 'redeem' || 
        tx.type === 'reward'
      );
      
      return stakingTxs.slice(0, limit);
    } catch (error) {
      console.error('Failed to get staking transactions:', error);
      throw error;
    }
  }

  // 获取待处理交易
  async getPendingTransactions(address) {
    try {
      if (this.isTestMode) {
        return []; // 测试模式没有待处理交易
      }

      const api = walletService.api;
      if (!api) {
        throw new Error('API not available');
      }

      // 从交易池获取待处理交易
      const pendingTxs = await api.rpc.author.pendingExtrinsics();
      
      const relevantTxs = pendingTxs.filter(tx => 
        this.isTransactionRelevant(tx, address)
      );

      return relevantTxs.map(tx => ({
        hash: tx.hash.toString(),
        from: tx.signer?.toString(),
        to: this.extractToAddress(tx),
        amount: this.extractAmount(tx),
        asset: this.extractAsset(tx),
        type: this.getTransactionType(tx.method),
        status: 'pending',
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to get pending transactions:', error);
      return [];
    }
  }

  // 工具方法
  isTransactionRelevant(extrinsic, address) {
    // 检查交易是否与指定地址相关
    const extrinsicStr = extrinsic.toString();
    return extrinsicStr.includes(address);
  }

  extractToAddress(extrinsic) {
    // 从交易中提取目标地址
    // 这需要根据具体的交易类型来解析
    return 'unknown';
  }

  extractAmount(extrinsic) {
    // 从交易中提取金额
    try {
      const args = extrinsic.args || extrinsic.method?.args;
      if (args && args.length > 0) {
        // 假设金额是第一个参数
        return args[0]?.toString() || '0';
      }
      return '0';
    } catch (error) {
      return '0';
    }
  }

  extractAsset(extrinsic) {
    // 从交易中提取资产类型
    const method = extrinsic.method || extrinsic;
    return method.section === 'balances' ? 'Native' : 'Unknown';
  }

  getTransactionType(method) {
    const typeMapping = {
      'balances.transfer': 'transfer',
      'vtoken.mint': 'stake',
      'vtoken.redeem': 'redeem',
      'liquidityStaking.mint': 'stake',
      'liquidityStaking.redeem': 'redeem'
    };
    
    const methodName = `${method.section}.${method.method}`;
    return typeMapping[methodName] || 'unknown';
  }

  async calculateFee(extrinsic) {
    try {
      const api = walletService.api;
      if (!api) return '0';
      
      const info = await api.rpc.payment.queryInfo(extrinsic.toHex());
      return info.partialFee.toString();
    } catch (error) {
      return '0.0001'; // 默认手续费
    }
  }

  generateMockHash() {
    return '0x' + Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  generateMockAddress() {
    const addresses = [
      '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
      '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy'
    ];
    return addresses[Math.floor(Math.random() * addresses.length)];
  }

  getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return `${Math.floor(diff / 86400000)}天前`;
  }

  formatAmount(amount) {
    if (!amount) return '0.0000';
    const num = parseFloat(amount);
    return num.toFixed(4);
  }

  getStatusColor(status) {
    const colorMap = {
      'success': '#52c41a',
      'failed': '#ff4d4f',
      'pending': '#faad14'
    };
    return colorMap[status] || '#8c8c8c';
  }

  getTypeIcon(type) {
    const iconMap = {
      'stake': '📈',
      'redeem': '📉',
      'transfer': '💸',
      'reward': '🎁',
      'unknown': '❓'
    };
    return iconMap[type] || '📄';
  }

  // 清除缓存
  clearCache(address = null) {
    if (address) {
      for (const key of this.cache.keys()) {
        if (key.includes(address)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
    console.log('Transaction cache cleared');
  }
}

// 导出单例实例
export const transactionService = new TransactionService();
export default transactionService;