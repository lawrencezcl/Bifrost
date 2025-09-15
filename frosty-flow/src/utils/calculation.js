// 计算工具函数
import BigNumber from 'bignumber.js';

class CalculationUtils {
  // 计算年化收益率
  calculateAPY(principal, earned, days) {
    try {
      if (days === 0) return 0;
      
      const dailyRate = earned / principal / days;
      const apy = (Math.pow(1 + dailyRate, 365) - 1) * 100;
      
      return Math.max(0, apy);
    } catch (error) {
      console.error('计算APY失败:', error);
      return 0;
    }
  }

  // 计算质押比例
  calculateStakingRatio(stakedAmount, totalAmount) {
    try {
      if (parseFloat(totalAmount) === 0) return 0;
      
      return (parseFloat(stakedAmount) / parseFloat(totalAmount)) * 100;
    } catch (error) {
      console.error('计算质押比例失败:', error);
      return 0;
    }
  }

  // 计算预期收益
  calculateExpectedYield(principal, apy, days) {
    try {
      const dailyRate = apy / 100 / 365;
      const yieldAmount = principal * dailyRate * days;
      
      return Math.max(0, yieldAmount);
    } catch (error) {
      console.error('计算预期收益失败:', error);
      return 0;
    }
  }

  // 计算解锁时间
  calculateUnlockTime(lockDays) {
    const unlockTime = new Date();
    unlockTime.setDate(unlockTime.getDate() + lockDays);
    return unlockTime.getTime();
  }

  // 百分比计算
  calculatePercentage(part, total) {
    try {
      if (parseFloat(total) === 0) return 0;
      
      return (parseFloat(part) / parseFloat(total)) * 100;
    } catch (error) {
      console.error('计算百分比失败:', error);
      return 0;
    }
  }
}

export default new CalculationUtils();