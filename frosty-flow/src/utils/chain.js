// 链工具函数
import { CHAIN_CONFIGS } from '../api/bifrost';

class ChainUtils {
  // 获取链配置
  getChainConfig(chainId) {
    return Object.values(CHAIN_CONFIGS).find(chain => chain.chainId === chainId);
  }

  // 检查是否为测试网
  isTestnet(chainId) {
    const testnets = ['moonbase-alpha'];
    return testnets.includes(chainId);
  }

  // 获取区块浏览器链接
  getExplorerUrl(chainId, type = 'tx', hash = '') {
    const explorers = {
      'bifrost-mainnet': 'https://bifrost.subscan.io',
      'moonbase-alpha': 'https://moonbase.moonscan.io'
    };

    const baseUrl = explorers[chainId];
    if (!baseUrl) return '';

    switch (type) {
      case 'tx':
        return `${baseUrl}/tx/${hash}`;
      case 'address':
        return `${baseUrl}/address/${hash}`;
      case 'block':
        return `${baseUrl}/block/${hash}`;
      default:
        return baseUrl;
    }
  }

  // 格式化链名称
  formatChainName(chainId) {
    const config = this.getChainConfig(chainId);
    return config ? config.name : chainId;
  }
}

export default new ChainUtils();