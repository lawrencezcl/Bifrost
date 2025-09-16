// 链选择器组件
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Select,
  Button,
  Badge,
  Tooltip,
  Modal,
  Card,
  Typography,
  Space,
  Tag,
  Alert
} from 'antd';
import {
  LinkOutlined,
  DisconnectOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  PlusOutlined
} from '@ant-design/icons';

import { switchChain } from '../store/slices/chainSlice';
import { CHAIN_CONFIGS } from '../api/bifrost';
import { formatUtils } from '../utils';

const { Text } = Typography;
const { Option } = Select;

const ChainSelector = () => {
  const dispatch = useDispatch();
  const [addChainModalVisible, setAddChainModalVisible] = useState(false);
  
  // Redux 状态
  const { 
    currentChain, 
    isConnected, 
    isConnecting, 
    supportedChains,
    error 
  } = useSelector(state => state.chain);

  // 切换链
  const handleChainSwitch = async (chainId) => {
    try {
      const targetChain = supportedChains.find(chain => chain.chainId === chainId);
      if (targetChain) {
        await dispatch(switchChain(targetChain));
      }
    } catch (error) {
      console.error('切换链失败:', error);
    }
  };

  // 获取链状态颜色
  const getChainStatusColor = (chain) => {
    if (currentChain?.chainId === chain.chainId) {
      return isConnected ? 'green' : 'orange';
    }
    return 'default';
  };

  // 获取链状态文本
  const getChainStatusText = (chain) => {
    if (currentChain?.chainId === chain.chainId) {
      return isConnected ? '已连接' : '连接中';
    }
    return '未连接';
  };

  // 渲染链选项
  const renderChainOption = (chain) => (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-2">
        <div 
          className="w-3 h-3 rounded-full"
          style={{
            backgroundColor: getChainStatusColor(chain) === 'green' ? '#52c41a' : 
                            getChainStatusColor(chain) === 'orange' ? '#faad14' : '#d9d9d9'
          }}
        />
        <Text>{chain.name}</Text>
      </div>
      
      <div className="flex items-center space-x-1">
        <Text type="secondary" className="text-xs">
          {chain.symbol}
        </Text>
        {currentChain?.chainId === chain.chainId && isConnecting && (
          <LoadingOutlined className="text-blue-500" />
        )}
      </div>
    </div>
  );

  // 渲染当前链状态
  const renderCurrentChainStatus = () => {
    if (!currentChain) {
      return (
        <Tooltip title="未连接到任何链">
          <Button type="text" icon={<DisconnectOutlined />} danger>
            未连接
          </Button>
        </Tooltip>
      );
    }

    return (
      <Tooltip title={`当前链: ${currentChain.name}`}>
        <Badge 
          status={isConnected ? 'success' : 'processing'} 
          text={
            <span className="flex items-center space-x-1">
              <Text className="font-medium">
                {formatUtils.formatNetworkName(currentChain.chainId)}
              </Text>
              {isConnecting && <LoadingOutlined />}
            </span>
          }
        />
      </Tooltip>
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
        style={{ minWidth: 160 }}
        loading={isConnecting}
        dropdownRender={(menu) => (
          <div>
            {menu}
            <div className="border-t border-gray-200 p-2">
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={() => setAddChainModalVisible(true)}
                className="w-full text-left"
              >
                添加自定义链
              </Button>
            </div>
          </div>
        )}
      >
        {supportedChains.map((chain) => (
          <Option key={chain.chainId} value={chain.chainId}>
            {renderChainOption(chain)}
          </Option>
        ))}
      </Select>

      {error && (
        <Alert
          type="error"
          message="链连接失败"
          description={error}
          showIcon
          style={{ marginLeft: 12, minWidth: 200 }}
        />
      )}

      {/* 添加自定义链模态框 */}
      <Modal
        title="添加自定义链"
        open={addChainModalVisible}
        onCancel={() => setAddChainModalVisible(false)}
        footer={null}
        width={600}
      >
        <div className="space-y-4">
          <Alert
            message="开发中"
            description="自定义链添加功能正在开发中，敬请期待。"
            type="info"
            showIcon
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supportedChains.map((chain) => (
              <Card
                key={chain.chainId}
                size="small"
                title={
                  <div className="flex items-center justify-between">
                    <Text>{chain.name}</Text>
                    <Tag color={getChainStatusColor(chain)}>
                      {getChainStatusText(chain)}
                    </Tag>
                  </div>
                }
                extra={
                  currentChain?.chainId === chain.chainId && isConnected ? (
                    <CheckCircleOutlined className="text-green-500" />
                  ) : (
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => handleChainSwitch(chain.chainId)}
                      loading={isConnecting && currentChain?.chainId === chain.chainId}
                    >
                      连接
                    </Button>
                  )
                }
              >
                <div className="space-y-2">
                  <div>
                    <Text type="secondary" className="text-sm">RPC 节点:</Text>
                    <br />
                    <Text className="text-sm font-mono break-all">
                      {chain.rpc}
                    </Text>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Text type="secondary" className="text-sm">代币:</Text>
                      <Text className="ml-1 font-medium">{chain.symbol}</Text>
                    </div>
                    <div>
                      <Text type="secondary" className="text-sm">精度:</Text>
                      <Text className="ml-1">{chain.decimals}</Text>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Button onClick={() => setAddChainModalVisible(false)}>
              关闭
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChainSelector;