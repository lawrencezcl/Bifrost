// 模拟服务 - 提供前端测试用的模拟数据和API
class MockService {
  constructor() {
    // 模拟钱包数据
    this.mockWallets = [
      {
        name: 'Polkadot.js',
        accounts: [
          {
            address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
            name: 'Alice',
            balance: '1000000000000'
          },
          {
            address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
            name: 'Bob', 
            balance: '2000000000000'
          }
        ]
      },
      {
        name: 'Talisman',
        accounts: [
          {
            address: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
            name: 'Charlie',
            balance: '1500000000000'
          }
        ]
      }
    ];

    // 模拟链数据
    this.mockChains = [
      {
        name: 'Bifrost Mainnet',
        symbol: 'BNC',
        endpoint: 'wss://hk.p.bifrost-rpc.liebi.com/ws',
        chainId: 'bifrost-mainnet',
        status: 'connected'
      },
      {
        name: 'Moonbase Alpha',
        symbol: 'DEV',
        endpoint: 'wss://wss.api.moonbase.moonbeam.network',
        chainId: 'moonbase-alpha',
        status: 'disconnected'
      }
    ];

    // 模拟资产数据
    this.mockAssets = [
      {
        symbol: 'DOT',
        chainName: 'Bifrost Mainnet',
        chainId: 'bifrost-mainnet',
        totalValue: 2480.50,
        yieldEarned: 124.25,
        balance: {
          free: '248.05',
          locked: '124.25'
        },
        price: 6.65,
        apy: 15.8,
        stakingInfo: {
          staked: '124.25',
          rewards: '12.42',
          unstaking: '0',
          available: '248.05'
        }
      },
      {
        symbol: 'GLMR',
        chainName: 'Moonbase Alpha',
        chainId: 'moonbase-alpha', 
        totalValue: 1890.75,
        yieldEarned: 95.54,
        balance: {
          free: '850.25',
          locked: '425.13'
        },
        price: 1.48,
        apy: 12.5,
        stakingInfo: {
          staked: '425.13',
          rewards: '21.26',
          unstaking: '0',
          available: '850.25'
        }
      },
      {
        symbol: 'KSM',
        chainName: 'Bifrost Mainnet',
        chainId: 'bifrost-mainnet',
        totalValue: 1250.30,
        yieldEarned: 62.52,
        balance: {
          free: '45.85',
          locked: '22.93'
        },
        price: 18.15,
        apy: 18.2,
        stakingInfo: {
          staked: '22.93',
          rewards: '2.29',
          unstaking: '0',
          available: '45.85'
        }
      }
    ];
  }

  // 模拟延迟
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 模拟钱包连接
  async connectWallet(walletType) {
    await this.delay(1000);
    
    const wallet = this.mockWallets.find(w => w.name === walletType);
    if (!wallet) {
      throw new Error(`不支持的钱包类型: ${walletType}`);
    }

    return {
      success: true,
      wallet: {
        name: walletType
      },
      accounts: wallet.accounts,
      selectedAccount: wallet.accounts[0]
    };
  }

  // 模拟断开钱包
  async disconnectWallet() {
    await this.delay(500);
    return { success: true };
  }

  // 模拟链连接
  async connectChain(chainId) {
    await this.delay(800);
    
    const chain = this.mockChains.find(c => c.chainId === chainId);
    if (!chain) {
      throw new Error(`不支持的链: ${chainId}`);
    }

    return {
      success: true,
      chain: {
        ...chain,
        status: 'connected'
      }
    };
  }

  // 获取用户资产
  async getUserAssets(address) {
    await this.delay(500);

    if (!address) {
      return this.mockAssets;
    }

    const modifier = (address.charCodeAt(address.length - 1) % 5) * 0.01;

    return this.mockAssets.map((asset, index) => {
      const multiplier = 1 + modifier + index * 0.005;
      return {
        ...asset,
        totalValue: parseFloat((asset.totalValue * multiplier).toFixed(2)),
        yieldEarned: parseFloat((asset.yieldEarned * multiplier).toFixed(2)),
        balance: {
          free: (parseFloat(asset.balance.free) * multiplier).toFixed(2),
          locked: (parseFloat(asset.balance.locked) * multiplier).toFixed(2)
        }
      };
    });
  }

  // 获取质押信息
  async getStakingInfo(address, symbol) {
    await this.delay(300);
    
    const asset = this.mockAssets.find(a => a.symbol === symbol);
    if (!asset) {
      throw new Error(`找不到资产: ${symbol}`);
    }

    return asset.stakingInfo;
  }

  // 模拟质押铸造
  async stakeMint({ asset, amount, account }) {
    await this.delay(2000);
    
    // 模拟交易哈希
    const txHash = '0x' + Math.random().toString(16).substr(2, 64);
    
    return {
      success: true,
      txHash,
      result: {
        asset,
        amount,
        mintedAmount: (parseFloat(amount) * 0.98).toFixed(6), // 扣除手续费
        estimatedYield: (parseFloat(amount) * 0.158).toFixed(6), // 预估年收益
        fee: (parseFloat(amount) * 0.02).toFixed(6),
        account
      }
    };
  }

  // 模拟质押赎回
  async stakeRedeem({ asset, amount, redeemType, account }) {
    await this.delay(2000);
    
    const txHash = '0x' + Math.random().toString(16).substr(2, 64);
    
    let actualAmount = parseFloat(amount);
    let fee = 0;
    let waitTime = 0;

    if (redeemType === 'instant') {
      // 即时赎回扣除手续费
      fee = actualAmount * 0.03;
      actualAmount = actualAmount * 0.97;
    } else {
      // 标准赎回需要等待时间
      waitTime = 28; // 28天
      fee = actualAmount * 0.005;
      actualAmount = actualAmount * 0.995;
    }

    return {
      success: true,
      txHash,
      result: {
        asset,
        requestedAmount: amount,
        actualAmount: actualAmount.toFixed(6),
        fee: fee.toFixed(6),
        redeemType,
        waitTime,
        estimatedCompletion: redeemType === 'instant' ?
          'immediately' :
          new Date(Date.now() + waitTime * 24 * 60 * 60 * 1000).toISOString(),
        account
      }
    };
  }

  // 获取可质押资产列表
  async getStakableAssets() {
    await this.delay(300);
    
    return [
      {
        symbol: 'DOT',
        name: 'Polkadot',
        minStakeAmount: '1',
        maxStakeAmount: '10000',
        currentAPY: 15.8,
        chainName: 'Bifrost Mainnet'
      },
      {
        symbol: 'GLMR', 
        name: 'Moonbeam',
        minStakeAmount: '10',
        maxStakeAmount: '50000',
        currentAPY: 12.5,
        chainName: 'Moonbase Alpha'
      },
      {
        symbol: 'KSM',
        name: 'Kusama',
        minStakeAmount: '0.1',
        maxStakeAmount: '1000',
        currentAPY: 18.2,
        chainName: 'Bifrost Mainnet'
      }
    ];
  }

  // 计算收益估算
  async calculateYield({ asset, amount, stakingDays = 365 }) {
    await this.delay(200);
    
    const assetInfo = this.mockAssets.find(a => a.symbol === asset);
    if (!assetInfo) {
      throw new Error(`找不到资产: ${asset}`);
    }

    const dailyRate = assetInfo.apy / 100 / 365;
    const totalYield = parseFloat(amount) * dailyRate * stakingDays;
    
    return {
      asset,
      amount,
      stakingDays,
      apy: assetInfo.apy,
      dailyYield: (parseFloat(amount) * dailyRate).toFixed(6),
      totalYield: totalYield.toFixed(6),
      finalAmount: (parseFloat(amount) + totalYield).toFixed(6)
    };
  }

  // 获取历史交易记录
  async getTransactionHistory(address, page = 1, limit = 10) {
    await this.delay(400);
    
    const mockTxs = [
      {
        hash: '0x1234...5678',
        type: 'stake_mint',
        asset: 'DOT',
        amount: '100.0',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'success'
      },
      {
        hash: '0x2345...6789',
        type: 'stake_redeem',
        asset: 'GLMR',
        amount: '500.0',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'success'
      },
      {
        hash: '0x3456...7890',
        type: 'stake_mint',
        asset: 'KSM',
        amount: '50.0',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      }
    ];

    return {
      transactions: mockTxs.slice((page - 1) * limit, page * limit),
      total: mockTxs.length,
      page,
      limit
    };
  }
}

// 导出单例实例
const mockService = new MockService();
export default mockService;