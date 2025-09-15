// 格式化工具函数
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
import BigNumber from 'bignumber.js';

dayjs.extend(relativeTime);
dayjs.extend(duration);

class FormatUtils {
  // 格式化地址
  formatAddress(address, length = 10) {
    if (!address) return '';
    if (address.length <= length) return address;
    
    const start = address.slice(0, 6);
    const end = address.slice(-4);
    return `${start}...${end}`;
  }

  // 格式化余额
  formatBalance(balance, decimals = 18, precision = 4) {
    try {
      if (!balance || balance === '0') return '0';
      
      const bn = new BigNumber(balance);
      const divisor = new BigNumber(10).pow(decimals);
      const formatted = bn.dividedBy(divisor);
      
      return formatted.toFixed(precision, BigNumber.ROUND_DOWN);
    } catch (error) {
      console.error('格式化余额失败:', error);
      return '0';
    }
  }

  // 格式化大数字（K, M, B）
  formatLargeNumber(number, precision = 2) {
    try {
      const num = parseFloat(number);
      if (isNaN(num)) return '0';
      
      if (num >= 1e9) {
        return (num / 1e9).toFixed(precision) + 'B';
      } else if (num >= 1e6) {
        return (num / 1e6).toFixed(precision) + 'M';
      } else if (num >= 1e3) {
        return (num / 1e3).toFixed(precision) + 'K';
      } else {
        return num.toFixed(precision);
      }
    } catch (error) {
      console.error('格式化大数字失败:', error);
      return '0';
    }
  }

  // 格式化百分比
  formatPercentage(value, precision = 2) {
    try {
      const num = parseFloat(value);
      if (isNaN(num)) return '0%';
      
      return `${num.toFixed(precision)}%`;
    } catch (error) {
      console.error('格式化百分比失败:', error);
      return '0%';
    }
  }

  // 格式化USD金额
  formatUSD(amount, precision = 2) {
    try {
      const num = parseFloat(amount);
      if (isNaN(num)) return '$0.00';
      
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: precision,
        maximumFractionDigits: precision
      }).format(num);
    } catch (error) {
      console.error('格式化USD金额失败:', error);
      return '$0.00';
    }
  }

  // 格式化时间
  formatTime(timestamp, format = 'YYYY-MM-DD HH:mm:ss') {
    try {
      return dayjs(timestamp).format(format);
    } catch (error) {
      console.error('格式化时间失败:', error);
      return '';
    }
  }

  // 格式化相对时间
  formatRelativeTime(timestamp) {
    try {
      return dayjs(timestamp).fromNow();
    } catch (error) {
      console.error('格式化相对时间失败:', error);
      return '';
    }
  }

  // 格式化持续时间
  formatDuration(seconds) {
    try {
      const duration = dayjs.duration(seconds, 'seconds');
      
      if (duration.asDays() >= 1) {
        return `${Math.floor(duration.asDays())}天 ${duration.hours()}小时`;
      } else if (duration.asHours() >= 1) {
        return `${duration.hours()}小时 ${duration.minutes()}分钟`;
      } else if (duration.asMinutes() >= 1) {
        return `${duration.minutes()}分钟 ${duration.seconds()}秒`;
      } else {
        return `${duration.seconds()}秒`;
      }
    } catch (error) {
      console.error('格式化持续时间失败:', error);
      return '';
    }
  }

  // 格式化交易哈希
  formatTxHash(hash, length = 16) {
    if (!hash) return '';
    if (hash.length <= length) return hash;
    
    const start = hash.slice(0, 8);
    const end = hash.slice(-8);
    return `${start}...${end}`;
  }

  // 格式化Gas费用
  formatGasFee(fee, symbol = 'DOT', decimals = 10) {
    try {
      const formatted = this.formatBalance(fee, decimals, 6);
      return `${formatted} ${symbol}`;
    } catch (error) {
      console.error('格式化Gas费用失败:', error);
      return `0 ${symbol}`;
    }
  }

  // 格式化年化收益率
  formatAPY(apy) {
    try {
      const num = parseFloat(apy);
      if (isNaN(num)) return '0.00%';
      
      return `${num.toFixed(2)}%`;
    } catch (error) {
      console.error('格式化APY失败:', error);
      return '0.00%';
    }
  }

  // 格式化网络名称
  formatNetworkName(chainId) {
    const networkNames = {
      'bifrost-mainnet': 'Bifrost',
      'moonbase-alpha': 'Moonbase Alpha',
      'polkadot': 'Polkadot',
      'kusama': 'Kusama'
    };
    
    return networkNames[chainId] || chainId;
  }

  // 格式化资产名称
  formatAssetName(symbol, isStaking = false) {
    if (isStaking && !symbol.startsWith('v')) {
      return `v${symbol}`;
    }
    return symbol;
  }

  // 格式化数字输入（移除非数字字符）
  formatNumberInput(value) {
    return value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
  }

  // 格式化文件大小
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 截断文本
  truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  }
}

export default new FormatUtils();