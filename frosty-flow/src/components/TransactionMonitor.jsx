// 交易监控组件
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  List,
  Badge,
  Typography,
  Space,
  Button,
  Tag,
  Tooltip,
  Progress,
  Drawer,
  Empty,
  Spin,
  message
} from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  EyeOutlined,
  CloseOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import transactionService from '../services/transactionService';

const { Text, Title } = Typography;

const TransactionMonitor = ({ visible, onClose, accountAddress }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);

  const { selectedAccount } = useSelector(state => state.wallet);

  // 加载交易历史
  const loadTransactions = async () => {
    try {
      setLoading(true);
      const address = accountAddress || selectedAccount?.address;

      if (!address) {
        message.warning('请先连接钱包');
        return;
      }

      const txHistory = await transactionService.getTransactionHistory(address, 20);
      const pendingTxs = await transactionService.getPendingTransactions(address);

      // 合并并排序交易（最新的在前）
      const allTxs = [...pendingTxs, ...txHistory]
        .sort((a, b) => (b.blockTime || b.timestamp || 0) - (a.blockTime || a.timestamp || 0));

      setTransactions(allTxs);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      message.error('加载交易历史失败');
    } finally {
      setLoading(false);
    }
  };

  // 监听交易状态变化
  useEffect(() => {
    if (visible && (accountAddress || selectedAccount?.address)) {
      loadTransactions();

      // 设置定期刷新
      const interval = setInterval(loadTransactions, 10000); // 每10秒刷新一次

      return () => clearInterval(interval);
    }
  }, [visible, accountAddress, selectedAccount]);

  // 获取状态图标和颜色
  const getStatusInfo = (status) => {
    const statusMap = {
      'pending': {
        icon: <LoadingOutlined spin />,
        color: '#faad14',
        text: '待处理',
        progress: 25
      },
      'in_block': {
        icon: <ClockCircleOutlined />,
        color: '#1890ff',
        text: '打包中',
        progress: 75
      },
      'finalized': {
        icon: <CheckCircleOutlined />,
        color: '#52c41a',
        text: '已完成',
        progress: 100
      },
      'failed': {
        icon: <ExclamationCircleOutlined />,
        color: '#ff4d4f',
        text: '失败',
        progress: 0
      }
    };

    return statusMap[status] || statusMap.pending;
  };

  // 获取交易类型显示
  const getTypeDisplay = (type) => {
    const typeMap = {
      'stake': { text: '质押', icon: '📈', color: 'blue' },
      'redeem': { text: '赎回', icon: '📉', color: 'green' },
      'transfer': { text: '转账', icon: '💸', color: 'orange' },
      'reward': { text: '奖励', icon: '🎁', color: 'purple' },
      'unknown': { text: '未知', icon: '❓', color: 'default' }
    };

    const info = typeMap[type] || typeMap.unknown;
    return (
      <Tag color={info.color} icon={info.icon}>
        {info.text}
      </Tag>
    );
  };

  // 格式化交易哈希
  const formatTxHash = (hash) => {
    if (!hash) return '-';
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  // 查看交易详情
  const viewTransactionDetail = (tx) => {
    setSelectedTx(tx);
    setDetailDrawerVisible(true);
  };

  // 渲染交易项
  const renderTransactionItem = (tx) => {
    const statusInfo = getStatusInfo(tx.status);
    const isIncoming = tx.to === (accountAddress || selectedAccount?.address);

    return (
      <List.Item
        key={tx.hash}
        className="transaction-item"
        style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '8px',
          backgroundColor: '#fafafa',
          border: '1px solid #f0f0f0',
          cursor: 'pointer'
        }}
        onClick={() => viewTransactionDetail(tx)}
        actions={[
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              viewTransactionDetail(tx);
            }}
          >
            详情
          </Button>
        ]}
      >
        <List.Item.Meta
          avatar={
            <div style={{ fontSize: '24px' }}>
              {transactionService.getTypeIcon(tx.type)}
            </div>
          }
          title={
            <Space>
              {getTypeDisplay(tx.type)}
              <Text strong>
                {isIncoming ? '+' : '-'}{tx.amountFormatted || tx.amount} {tx.asset}
              </Text>
              <Badge
                status={tx.status === 'success' ? 'success' : tx.status === 'failed' ? 'error' : 'processing'}
                text={statusInfo.text}
                style={{ fontSize: '12px' }}
              />
            </Space>
          }
          description={
            <div>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {formatTxHash(tx.hash)}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {tx.timeAgo || transactionService.getTimeAgo(tx.blockTime || tx.timestamp)}
                  </Text>
                </div>

                {tx.status === 'pending' && (
                  <Progress
                    percent={statusInfo.progress}
                    size="small"
                    showInfo={false}
                    strokeColor={statusInfo.color}
                  />
                )}
              </Space>
            </div>
          }
        />
      </List.Item>
    );
  };

  // 渲染交易详情抽屉
  const renderTransactionDetail = () => {
    if (!selectedTx) return null;

    const statusInfo = getStatusInfo(selectedTx.status);
    const isIncoming = selectedTx.to === (accountAddress || selectedAccount?.address);

    return (
      <Drawer
        title="交易详情"
        placement="right"
        onClose={() => setDetailDrawerVisible(false)}
        open={detailDrawerVisible}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* 交易状态 */}
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', color: statusInfo.color, marginBottom: '8px' }}>
                {statusInfo.icon}
              </div>
              <Title level={4} style={{ margin: 0, color: statusInfo.color }}>
                {statusInfo.text}
              </Title>
            </div>
          </Card>

          {/* 交易信息 */}
          <Card size="small" title="交易信息">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">交易类型:</Text>
                {getTypeDisplay(selectedTx.type)}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">金额:</Text>
                <Text strong style={{ color: isIncoming ? '#52c41a' : '#ff4d4f' }}>
                  {isIncoming ? '+' : '-'}{selectedTx.amountFormatted || selectedTx.amount} {selectedTx.asset}
                </Text>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">从:</Text>
                <Text code style={{ fontSize: '12px' }}>
                  {formatTxHash(selectedTx.from)}
                </Text>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">到:</Text>
                <Text code style={{ fontSize: '12px' }}>
                  {formatTxHash(selectedTx.to)}
                </Text>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">交易费:</Text>
                <Text>{selectedTx.fee || '0.0001'} {selectedTx.asset}</Text>
              </div>
            </Space>
          </Card>

          {/* 区块信息 */}
          {selectedTx.blockNumber && (
            <Card size="small" title="区块信息">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">区块号:</Text>
                  <Text>#{selectedTx.blockNumber}</Text>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">时间:</Text>
                  <Text>
                    {new Date(selectedTx.blockTime || selectedTx.timestamp).toLocaleString()}
                  </Text>
                </div>
              </Space>
            </Card>
          )}

          {/* 操作按钮 */}
          <Space style={{ width: '100%', justifyContent: 'center' }}>
            <Button
              type="primary"
              ghost
              onClick={() => {
                if (selectedTx.hash) {
                  navigator.clipboard.writeText(selectedTx.hash);
                  message.success('交易哈希已复制');
                }
              }}
            >
              复制哈希
            </Button>

            <Button onClick={() => window.open(`https://bifrost-testnet.subscan.io/extrinsic/${selectedTx.hash}`, '_blank')}>
              查看区块浏览器
            </Button>
          </Space>
        </Space>
      </Drawer>
    );
  };

  return (
    <>
      <Drawer
        title={
          <Space>
            <Title level={4} style={{ margin: 0 }}>
              交易历史
            </Title>
            <Button
              type="text"
              size="small"
              icon={<ReloadOutlined />}
              onClick={loadTransactions}
              loading={loading}
            >
              刷新
            </Button>
          </Space>
        }
        placement="right"
        onClose={onClose}
        open={visible}
        width={480}
      >
        <div style={{ height: '100%', overflow: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
              <div style={{ marginTop: '16px' }}>
                <Text type="secondary">加载交易历史中...</Text>
              </div>
            </div>
          ) : transactions.length === 0 ? (
            <Empty
              description="暂无交易记录"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <List
              dataSource={transactions}
              renderItem={renderTransactionItem}
              style={{ padding: '0 8px' }}
            />
          )}
        </div>
      </Drawer>

      {renderTransactionDetail()}
    </>
  );
};

export default TransactionMonitor;