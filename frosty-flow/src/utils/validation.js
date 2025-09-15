// 验证工具函数
import BigNumber from 'bignumber.js';

class ValidationUtils {
  // 验证地址格式
  isValidAddress(address) {
    try {
      if (!address || typeof address !== 'string') return false;
      
      // Substrate 地址长度通常是 47-48 位
      if (address.length < 47 || address.length > 48) return false;
      
      // 简单的地址格式检查
      return /^[1-9A-HJ-NP-Za-km-z]+$/.test(address);
    } catch (error) {
      return false;
    }
  }

  // 验证交易哈希
  isValidTxHash(hash) {
    try {
      if (!hash || typeof hash !== 'string') return false;
      
      // 通常是 64 位十六进制字符串
      return /^0x[a-fA-F0-9]{64}$/.test(hash);
    } catch (error) {
      return false;
    }
  }

  // 验证数字输入
  isValidNumber(value) {
    try {
      if (value === '' || value === null || value === undefined) return false;
      
      const num = parseFloat(value);
      return !isNaN(num) && isFinite(num) && num >= 0;
    } catch (error) {
      return false;
    }
  }

  // 验证余额充足性
  isBalanceSufficient(balance, amount, decimals = 18) {
    try {
      const balanceBN = new BigNumber(balance);
      const amountBN = new BigNumber(amount).multipliedBy(new BigNumber(10).pow(decimals));
      
      return balanceBN.isGreaterThanOrEqualTo(amountBN);
    } catch (error) {
      return false;
    }
  }

  // 验证最小金额
  isAmountAboveMinimum(amount, minimum = 0.001) {
    try {
      const num = parseFloat(amount);
      return num >= minimum;
    } catch (error) {
      return false;
    }
  }

  // 验证最大金额
  isAmountBelowMaximum(amount, maximum) {
    try {
      const num = parseFloat(amount);
      return num <= maximum;
    } catch (error) {
      return false;
    }
  }

  // 验证小数位数
  isValidDecimals(value, maxDecimals = 18) {
    try {
      const parts = value.toString().split('.');
      if (parts.length === 1) return true; // 整数
      
      return parts[1].length <= maxDecimals;
    } catch (error) {
      return false;
    }
  }

  // 验证邮箱格式
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // 验证密码强度
  isStrongPassword(password) {
    // 至少8位，包含大小写字母、数字和特殊字符
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  // 验证URL格式
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  // 验证JSON格式
  isValidJson(str) {
    try {
      JSON.parse(str);
      return true;
    } catch (error) {
      return false;
    }
  }

  // 验证钱包助记词
  isValidMnemonic(mnemonic) {
    if (!mnemonic || typeof mnemonic !== 'string') return false;
    
    const words = mnemonic.trim().split(/\s+/);
    return words.length === 12 || words.length === 24;
  }

  // 验证Gas价格
  isValidGasPrice(gasPrice) {
    try {
      const num = parseFloat(gasPrice);
      return num > 0 && num <= 1000; // 假设最大1000 Gwei
    } catch (error) {
      return false;
    }
  }

  // 验证滑点容忍度
  isValidSlippage(slippage) {
    try {
      const num = parseFloat(slippage);
      return num >= 0.1 && num <= 50; // 0.1% - 50%
    } catch (error) {
      return false;
    }
  }

  // 验证百分比
  isValidPercentage(percentage) {
    try {
      const num = parseFloat(percentage);
      return num >= 0 && num <= 100;
    } catch (error) {
      return false;
    }
  }

  // 验证时间戳
  isValidTimestamp(timestamp) {
    try {
      const date = new Date(timestamp);
      return date instanceof Date && !isNaN(date);
    } catch (error) {
      return false;
    }
  }

  // 验证链ID
  isValidChainId(chainId) {
    const validChainIds = [
      'bifrost-mainnet',
      'moonbase-alpha',
      'polkadot',
      'kusama'
    ];
    
    return validChainIds.includes(chainId);
  }

  // 验证资产符号
  isValidAssetSymbol(symbol) {
    if (!symbol || typeof symbol !== 'string') return false;
    
    // 1-10位大写字母
    return /^[A-Z]{1,10}$/.test(symbol);
  }

  // 验证交易类型
  isValidTransactionType(type) {
    const validTypes = [
      'stake_mint',
      'stake_redeem',
      'transfer',
      'claim_rewards'
    ];
    
    return validTypes.includes(type);
  }

  // 综合验证质押参数
  validateStakeParams(params) {
    const { amount, assetSymbol, userBalance, decimals } = params;
    const errors = [];

    if (!this.isValidNumber(amount)) {
      errors.push('金额格式无效');
    }

    if (!this.isAmountAboveMinimum(amount, 0.001)) {
      errors.push('金额不能小于0.001');
    }

    if (!this.isValidAssetSymbol(assetSymbol)) {
      errors.push('资产符号无效');
    }

    if (!this.isBalanceSufficient(userBalance, amount, decimals)) {
      errors.push('余额不足');
    }

    if (!this.isValidDecimals(amount, decimals)) {
      errors.push(`小数位数不能超过${decimals}位`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 综合验证赎回参数
  validateRedeemParams(params) {
    const { amount, assetSymbol, stakingBalance, redeemType, decimals } = params;
    const errors = [];

    if (!this.isValidNumber(amount)) {
      errors.push('赎回金额格式无效');
    }

    if (!this.isAmountAboveMinimum(amount, 0.001)) {
      errors.push('赎回金额不能小于0.001');
    }

    if (!this.isValidAssetSymbol(assetSymbol)) {
      errors.push('资产符号无效');
    }

    if (!this.isBalanceSufficient(stakingBalance, amount, decimals)) {
      errors.push('质押余额不足');
    }

    if (!['instant', 'standard'].includes(redeemType)) {
      errors.push('赎回类型无效');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default new ValidationUtils();