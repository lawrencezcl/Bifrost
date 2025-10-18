// 简化的链选择器组件
import { useState } from 'react';
import { Select, Badge, Typography } from 'antd';
import { NETWORKS } from '../config/networks';

const { Text } = Typography;

const ChainSelector = () => {
  // 简化的状态，使用 NETWORKS 配置
  const supportedChains = Object.values(NETWORKS);
  const [currentChain, setCurrentChain] = useState(NETWORKS.BIFROST_TESTNET);

  // 切换链
  const handleChainSwitch = (chainId) => {
    const targetChain = supportedChains.find(chain => chain.chainId === chainId);
    if (targetChain) {
      setCurrentChain(targetChain);
      console.log('切换到链:', targetChain.name);
    }
  };

  // 渲染链选项
  const renderChainOption = (chain) => (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{
            backgroundColor: currentChain?.chainId === chain.chainId ? '#52c41a' : '#d9d9d9'
          }}
        />
        <Text>{chain.name}</Text>
      </div>

      <div className="flex items-center space-x-1">
        <Text type="secondary" className="text-xs">
          {chain.symbol}
        </Text>
      </div>
    </div>
  );

  // 渲染当前链状态
  const renderCurrentChainStatus = () => {
    if (!currentChain) {
      return (
        <Text type="danger" className="text-sm">
          未连接
        </Text>
      );
    }

    return (
      <Badge
        status="success"
        text={
          <Text className="font-medium text-sm">
            {currentChain.name}
          </Text>
        }
      />
    );
  };

  return (
    <div className="flex items-center space-x-2">
      {/* 当前链状态显示 */}
      {renderCurrentChainStatus()}

      {/* 链选择下拉框 */}
      <Select
        value={currentChain?.chainId}
        onChange={handleChainSwitch}
        placeholder="选择链"
        style={{ minWidth: 140 }}
        size="small"
      >
        {supportedChains.map((chain) => (
          <Select.Option key={chain.chainId} value={chain.chainId}>
            {renderChainOption(chain)}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default ChainSelector;