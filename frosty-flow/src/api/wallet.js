// 钱包连接 API
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';

// 支持的钱包类型
export const WALLET_TYPES = {
  POLKADOT_JS: {
    name: 'Polkadot{.js}',
    icon: '/icons/polkadot-js.svg',
    extensionName: 'polkadot-js',
    download: 'https://polkadot.js.org/extension/'
  },
  TALISMAN: {
    name: 'Talisman',
    icon: '/icons/talisman.svg', 
    extensionName: 'talisman',
    download: 'https://talisman.xyz/'
  },
  SUBWALLET: {
    name: 'SubWallet',
    icon: '/icons/subwallet.svg',
    extensionName: 'subwallet-js',
    download: 'https://subwallet.app/'
  }
};

class WalletApi {
  constructor() {
    this.connectedWallet = null;
    this.accounts = [];
    this.selectedAccount = null;
  }

  // 检查钱包扩展是否已安装
  async checkWalletInstalled(walletType) {
    try {
      const extensions = await web3Enable('FrostyFlow');
      return extensions.some(ext => ext.name === walletType.extensionName);
    } catch (error) {
      console.error('检查钱包安装状态失败:', error);
      return false;
    }
  }

  // 获取所有已安装的钱包
  async getInstalledWallets() {
    try {
      const extensions = await web3Enable('FrostyFlow');
      return Object.values(WALLET_TYPES).filter(wallet =>
        extensions.some(ext => ext.name === wallet.extensionName)
      );
    } catch (error) {
      console.error('获取已安装钱包失败:', error);
      return [];
    }
  }

  // 连接钱包
  async connectWallet(walletType) {
    try {
      // 启用扩展
      const extensions = await web3Enable('FrostyFlow');
      const targetExtension = extensions.find(ext => ext.name === walletType.extensionName);
      
      if (!targetExtension) {
        throw new Error(`${walletType.name} 扩展未安装或未启用`);
      }

      // 获取账户
      const accounts = await web3Accounts();
      const walletAccounts = accounts.filter(account => 
        account.meta.source === walletType.extensionName
      );

      if (walletAccounts.length === 0) {
        throw new Error(`${walletType.name} 中没有找到账户`);
      }

      this.connectedWallet = walletType;
      this.accounts = walletAccounts;
      this.selectedAccount = walletAccounts[0]; // 默认选择第一个账户

      console.log(`已连接 ${walletType.name}，找到 ${walletAccounts.length} 个账户`);
      
      return {
        wallet: walletType,
        accounts: walletAccounts,
        selectedAccount: this.selectedAccount
      };
    } catch (error) {
      console.error('连接钱包失败:', error);
      throw error;
    }
  }

  // 切换账户
  async switchAccount(account) {
    try {
      if (!this.accounts.find(acc => acc.address === account.address)) {
        throw new Error('账户不在当前钱包中');
      }

      this.selectedAccount = account;
      console.log(`已切换到账户: ${account.address}`);
      
      return account;
    } catch (error) {
      console.error('切换账户失败:', error);
      throw error;
    }
  }

  // 获取账户签名器
  async getSigner(address) {
    try {
      if (!this.connectedWallet) {
        throw new Error('钱包未连接');
      }

      const injector = await web3FromAddress(address);
      return injector.signer;
    } catch (error) {
      console.error('获取签名器失败:', error);
      throw error;
    }
  }

  // 签名消息
  async signMessage(address, message) {
    try {
      const injector = await web3FromAddress(address);
      
      if (!injector.signer.signRaw) {
        throw new Error('钱包不支持消息签名');
      }

      const signRaw = injector.signer.signRaw;
      const result = await signRaw({
        address,
        data: message,
        type: 'bytes'
      });

      return result.signature;
    } catch (error) {
      console.error('签名消息失败:', error);
      throw error;
    }
  }

  // 断开钱包连接
  disconnect() {
    this.connectedWallet = null;
    this.accounts = [];
    this.selectedAccount = null;
    console.log('钱包已断开连接');
  }

  // 获取当前连接状态
  getConnectionStatus() {
    return {
      isConnected: !!this.connectedWallet,
      wallet: this.connectedWallet,
      accounts: this.accounts,
      selectedAccount: this.selectedAccount
    };
  }

  // 格式化账户地址（显示前6位和后4位）
  formatAddress(address, length = 10) {
    if (!address) return '';
    if (address.length <= length) return address;
    
    const start = address.slice(0, 6);
    const end = address.slice(-4);
    return `${start}...${end}`;
  }

  // 验证地址格式
  isValidAddress(address) {
    try {
      // 简单的地址格式验证
      return address && address.length >= 47 && address.length <= 48;
    } catch (error) {
      return false;
    }
  }
}

export default new WalletApi();