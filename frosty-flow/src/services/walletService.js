// 真实钱包连接服务
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { NETWORKS, SUPPORTED_WALLETS } from '../config/networks';

class WalletService {
  constructor() {
    this.api = null;
    this.currentNetwork = null;
    this.connectedWallet = null;
    this.accounts = [];
    this.selectedAccount = null;
  }

  // 初始化钱包扩展
  async initializeWallets() {
    try {
      // 请求访问钱包扩展
      const extensions = await web3Enable('FrostyFlow');
      
      if (extensions.length === 0) {
        throw new Error('No wallet extension found. Please install Polkadot.js, Talisman, or SubWallet.');
      }

      console.log('Found wallet extensions:', extensions.map(ext => ext.name));
      return extensions;
    } catch (error) {
      console.error('Failed to initialize wallets:', error);
      throw error;
    }
  }

  // 连接到特定钱包
  async connectWallet(walletId) {
    try {
      // 首先初始化钱包扩展
      await this.initializeWallets();

      // 获取账户
      const accounts = await web3Accounts();
      
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please create an account in your wallet.');
      }

      // 过滤特定钱包的账户
      const walletAccounts = accounts.filter(account => 
        account.meta.source === walletId || 
        account.meta.source.includes(walletId)
      );

      if (walletAccounts.length === 0) {
        throw new Error(`No accounts found for ${walletId}. Please check your wallet.`);
      }

      this.accounts = walletAccounts;
      this.selectedAccount = walletAccounts[0];
      this.connectedWallet = walletId;

      console.log('Connected wallet:', walletId);
      console.log('Available accounts:', walletAccounts.length);

      return {
        success: true,
        wallet: { name: walletId, id: walletId },
        accounts: walletAccounts,
        selectedAccount: this.selectedAccount
      };
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  // 连接到区块链网络
  async connectToNetwork(networkKey) {
    try {
      const network = NETWORKS[networkKey];
      if (!network) {
        throw new Error(`Unsupported network: ${networkKey}`);
      }

      console.log('Connecting to network:', network.name);

      // 创建WebSocket提供者
      const provider = new WsProvider(network.rpcUrl);
      
      // 创建API实例
      this.api = await ApiPromise.create({ provider });
      
      // 等待API准备就绪
      await this.api.isReady;
      
      this.currentNetwork = network;

      console.log('Connected to network:', network.name);
      console.log('Chain info:', {
        name: (await this.api.rpc.system.chain()).toString(),
        version: (await this.api.rpc.system.version()).toString(),
        nodeVersion: (await this.api.rpc.system.name()).toString()
      });

      return {
        success: true,
        network: this.currentNetwork,
        chainInfo: {
          name: (await this.api.rpc.system.chain()).toString(),
          version: (await this.api.rpc.system.version()).toString()
        }
      };
    } catch (error) {
      console.error('Failed to connect to network:', error);
      throw error;
    }
  }

  // 获取账户余额
  async getAccountBalance(address, assetSymbol = null) {
    try {
      if (!this.api) {
        throw new Error('Not connected to network');
      }

      // 获取主要代币余额
      const { data: balance } = await this.api.query.system.account(address);
      
      const freeBalance = balance.free.toString();
      const reservedBalance = balance.reserved.toString();
      const frozenBalance = balance.frozen.toString();
      
      // 计算可用余额
      const availableBalance = balance.free.sub(balance.frozen).toString();

      console.log('Account balance:', {
        address,
        free: freeBalance,
        reserved: reservedBalance,
        frozen: frozenBalance,
        available: availableBalance
      });

      return {
        address,
        symbol: this.currentNetwork.symbol,
        decimals: this.currentNetwork.decimals,
        free: freeBalance,
        reserved: reservedBalance,
        frozen: frozenBalance,
        available: availableBalance
      };
    } catch (error) {
      console.error('Failed to get account balance:', error);
      throw error;
    }
  }

  // 获取资产余额（多资产）
  async getAssetBalances(address) {
    try {
      if (!this.api) {
        throw new Error('Not connected to network');
      }

      const balances = [];

      // 获取主要代币余额
      const nativeBalance = await this.getAccountBalance(address);
      balances.push(nativeBalance);

      // 获取其他资产余额（如果支持）
      if (this.api.query.assets) {
        // 这里需要根据具体的runtime实现来获取其他资产
        // 暂时返回主要代币余额
      }

      return balances;
    } catch (error) {
      console.error('Failed to get asset balances:', error);
      throw error;
    }
  }

  // 执行质押操作
  async executeStaking(params) {
    try {
      const { assetSymbol, amount, accountAddress } = params;
      
      if (!this.api || !this.connectedWallet) {
        throw new Error('Wallet or network not connected');
      }

      // 获取账户的签名器
      const injector = await web3FromAddress(accountAddress);
      
      // 将金额转换为链上格式
      const decimals = this.getAssetDecimals(assetSymbol);
      const rawAmount = this.parseAmount(amount, decimals);
      
      console.log('Executing staking transaction:', { assetSymbol, amount, rawAmount, accountAddress });
      
      let tx;
      
      // 根据不同的网络和资产构建质押交易
      if (this.currentNetwork.chainId === 'bifrost-testnet') {
        // Bifrost网络的质押交易
        if (assetSymbol === 'DOT') {
          tx = this.api.tx.liquidityStaking.mint('DOT', rawAmount);
        } else if (assetSymbol === 'KSM') {
          tx = this.api.tx.liquidityStaking.mint('KSM', rawAmount);
        } else if (assetSymbol === 'GLMR') {
          tx = this.api.tx.liquidityStaking.mint('GLMR', rawAmount);
        } else {
          throw new Error(`Unsupported asset for staking: ${assetSymbol}`);
        }
      } else {
        // 其他网络的通用质押交易
        tx = this.api.tx.balances.transfer(accountAddress, rawAmount);
      }
      
      // 预估交易费用
      const feeInfo = await this.estimateTransactionFee(tx, accountAddress);
      console.log('Estimated fee:', feeInfo);
      
      // 签名并发送交易
      const txHash = await this.signAndSendTransaction(tx, accountAddress, injector);
      
      return {
        success: true,
        txHash: txHash.toString(),
        asset: assetSymbol,
        amount,
        account: accountAddress,
        estimatedFee: feeInfo
      };
    } catch (error) {
      console.error('Failed to execute staking:', error);
      throw new Error(`质押失败: ${error.message}`);
    }
  }

  // 执行赎回操作
  async executeRedeem(params) {
    try {
      const { assetSymbol, amount, accountAddress, redeemType } = params;
      
      if (!this.api || !this.connectedWallet) {
        throw new Error('Wallet or network not connected');
      }

      const injector = await web3FromAddress(accountAddress);
      
      // 将金额转换为链上格式
      const decimals = this.getAssetDecimals(assetSymbol);
      const rawAmount = this.parseAmount(amount, decimals);
      
      console.log('Executing redeem transaction:', { assetSymbol, amount, rawAmount, redeemType, accountAddress });
      
      let tx;
      
      // 根据赎回类型构建交易
      if (this.currentNetwork.chainId === 'bifrost-testnet') {
        const vTokenSymbol = this.getVTokenSymbol(assetSymbol);
        
        if (redeemType === 'instant') {
          // 即时赎回（手续费更高）
          tx = this.api.tx.liquidityStaking.redeemInstant(vTokenSymbol, rawAmount);
        } else {
          // 标准赎回（需要等待解锁期）
          tx = this.api.tx.liquidityStaking.redeem(vTokenSymbol, rawAmount);
        }
      } else {
        // 其他网络的赎回逻辑
        tx = this.api.tx.balances.transfer(accountAddress, rawAmount);
      }
      
      // 预估交易费用
      const feeInfo = await this.estimateTransactionFee(tx, accountAddress);
      console.log('Estimated redeem fee:', feeInfo);
      
      // 签名并发送交易
      const txHash = await this.signAndSendTransaction(tx, accountAddress, injector);
      
      return {
        success: true,
        txHash: txHash.toString(),
        asset: assetSymbol,
        amount,
        redeemType,
        account: accountAddress,
        estimatedFee: feeInfo
      };
    } catch (error) {
      console.error('Failed to execute redeem:', error);
      throw new Error(`赎回失败: ${error.message}`);
    }
  }

  // 辅助方法：签名并发送交易
  async signAndSendTransaction(tx, accountAddress, injector) {
    return new Promise((resolve, reject) => {
      let txHash;
      
      tx.signAndSend(accountAddress, {
        signer: injector.signer
      }, (status) => {
        console.log('Transaction status:', status.type);
        
        if (status.isInBlock) {
          console.log('Transaction in block:', status.asInBlock.toString());
          txHash = status.asInBlock;
        }
        
        if (status.isFinalized) {
          console.log('Transaction finalized:', status.asFinalized.toString());
          resolve(txHash || status.asFinalized);
        }
        
        if (status.isError || status.isInvalid) {
          console.error('Transaction failed:', status);
          reject(new Error('Transaction failed'));
        }
      })
      .catch(error => {
        console.error('Transaction error:', error);
        reject(error);
      });
    });
  }

  // 辅助方法：预估交易费用
  async estimateTransactionFee(tx, accountAddress) {
    try {
      const info = await this.api.rpc.payment.queryInfo(tx.toHex(), accountAddress);
      return {
        partialFee: info.partialFee.toString(),
        weight: info.weight.toString(),
        class: info.class.toString()
      };
    } catch (error) {
      console.warn('Failed to estimate fee:', error);
      return {
        partialFee: '1000000000000', // 默认费用
        weight: '0',
        class: 'Normal'
      };
    }
  }

  // 辅助方法：获取资产精度
  getAssetDecimals(assetSymbol) {
    const decimalsMap = {
      'DOT': 10,
      'KSM': 12,
      'GLMR': 18,
      'BNC': 12,
      'DEV': 18
    };
    return decimalsMap[assetSymbol] || 12;
  }

  // 辅助方法：获取vToken符号
  getVTokenSymbol(assetSymbol) {
    const vTokenMap = {
      'DOT': 'vDOT',
      'KSM': 'vKSM',
      'GLMR': 'vGLMR',
      'BNC': 'vBNC'
    };
    return vTokenMap[assetSymbol] || `v${assetSymbol}`;
  }

  // 辅助方法：解析金额到链上格式
  parseAmount(amount, decimals) {
    const multiplier = Math.pow(10, decimals);
    const rawAmount = Math.floor(parseFloat(amount) * multiplier);
    return rawAmount.toString();
  }

  // 辅助方法：格式化链上金额到可读格式
  formatAmount(rawAmount, decimals) {
    const divisor = Math.pow(10, decimals);
    const amount = parseFloat(rawAmount) / divisor;
    return amount.toFixed(6);
  }

  // 断开连接
  async disconnect() {
    try {
      if (this.api) {
        await this.api.disconnect();
        this.api = null;
      }
      
      this.currentNetwork = null;
      this.connectedWallet = null;
      this.accounts = [];
      this.selectedAccount = null;
      
      console.log('Disconnected from wallet and network');
      
      return { success: true };
    } catch (error) {
      console.error('Failed to disconnect:', error);
      throw error;
    }
  }

  // 获取当前状态
  getStatus() {
    return {
      isWalletConnected: !!this.connectedWallet,
      isNetworkConnected: !!this.api,
      currentNetwork: this.currentNetwork,
      connectedWallet: this.connectedWallet,
      selectedAccount: this.selectedAccount,
      accountCount: this.accounts.length
    };
  }
}

// 导出单例实例
export const walletService = new WalletService();
export default walletService;