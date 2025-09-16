// 质押赎回页面
import { useState } from 'react';
import {
  Card,
  Form,
  Select,
  Input,
  Button,
  Typography,
  Space,
  Alert,
  Statistic,
  Row,
  Col,
  Radio,
  message
} from 'antd';
import {
  ReloadOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';

import mockService from '../services/mockService';

const { Title, Text } = Typography;
const { Option } = Select;

const StakeRedeem = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [redeemType, setRedeemType] = useState('standard');
  const [estimatedResult, setEstimatedResult] = useState(null);

  // 模拟已质押资产数据
  const stakedAssets = [
    { 
      symbol: 'vDOT', 
      originalSymbol: 'DOT',
      balance: '50.2345',
      value: 335.45,
      apy: 12.5
    },
    { 
      symbol: 'vGLMR', 
      originalSymbol: 'GLMR',
      balance: '250.6789',
      value: 371.50,
      apy: 8.7
    }
  ];

  const handleAssetChange = (assetSymbol) => {
    const asset = stakedAssets.find(a => a.symbol === assetSymbol);
    setSelectedAsset(asset);
  };

  const handleAmountChange = async (e) => {
    const amount = e.target.value;
    if (selectedAsset && amount && !isNaN(amount) && parseFloat(amount) > 0) {
      try {
        // 计算赎回结果
        let actualAmount = parseFloat(amount);
        let fee = 0;
        let waitTime = 0;

        if (redeemType === 'instant') {
          fee = actualAmount * 0.03; // 3% 手续费
          actualAmount = actualAmount * 0.97;
        } else {
          fee = actualAmount * 0.005; // 0.5% 手续费
          actualAmount = actualAmount * 0.995;
          waitTime = 28; // 28天
        }

        setEstimatedResult({
          requestedAmount: amount,
          actualAmount: actualAmount.toFixed(6),
          fee: fee.toFixed(6),
          waitTime,
          redeemType
        });
      } catch (error) {
        console.error('计算赎回结果失败:', error);
        setEstimatedResult(null);
      }
    } else {
      setEstimatedResult(null);
    }
  };

  const handleRedeemTypeChange = (e) => {
    setRedeemType(e.target.value);
    // 重新计算
    const amount = form.getFieldValue('amount');
    if (amount) {
      handleAmountChange({ target: { value: amount } });
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const result = await mockService.stakeRedeem({
        asset: values.asset,
        amount: values.amount,
        redeemType: redeemType,
        account: 'mock-account'
      });
      
      message.success('赎回申请提交成功！');
      console.log('赎回成功:', result);
      
      // 重置表单
      form.resetFields();
      setSelectedAsset(null);
      setEstimatedResult(null);
    } catch (error) {
      console.error('赎回失败:', error);
      message.error('赎回失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div>
        <Title level={2}>质押赎回</Title>
        <Text type="secondary">
          赎回您的流动性质押代币，获取原始资产和质押收益
        </Text>
      </div>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={16}>
          <Card title="赎回信息">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
            >
              <Form.Item
                label="选择资产"
                name="asset"
                rules={[{ required: true, message: '请选择要赎回的资产' }]}
              >
                <Select
                  placeholder="选择要赎回的资产"
                  onChange={handleAssetChange}
                  size="large"
                >
                  {stakedAssets.map(asset => (
                    <Option key={asset.symbol} value={asset.symbol}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{asset.symbol} → {asset.originalSymbol}</span>
                        <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                          余额: {asset.balance}
                        </span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="赎回类型"
                name="redeemType"
                initialValue="standard"
              >
                <Radio.Group onChange={handleRedeemTypeChange} value={redeemType}>
                  <Radio.Button value="standard">
                    <Space>
                      <ClockCircleOutlined />
                      标准赎回 (28天)
                    </Space>
                  </Radio.Button>
                  <Radio.Button value="instant">
                    <Space>
                      <ThunderboltOutlined />
                      即时赎回 (高手续费)
                    </Space>
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                label="赎回数量"
                name="amount"
                rules={[
                  { required: true, message: '请输入赎回数量' },
                  { 
                    pattern: /^\d+(\.\d+)?$/,
                    message: '请输入有效的数字'
                  }
                ]}
              >
                <Input
                  placeholder="输入赎回数量"
                  size="large"
                  onChange={handleAmountChange}
                  suffix={
                    selectedAsset && (
                      <Space>
                        <Text type="secondary">{selectedAsset.symbol}</Text>
                        <Button
                          type="link"
                          size="small"
                          onClick={() => {
                            form.setFieldsValue({ amount: selectedAsset.balance });
                            handleAmountChange({ target: { value: selectedAsset.balance } });
                          }}
                        >
                          最大
                        </Button>
                      </Space>
                    )
                  }
                />
              </Form.Item>

              {selectedAsset && (
                <Alert
                  message="资产信息"
                  description={
                    <div>
                      <p>可用余额: {selectedAsset.balance} {selectedAsset.symbol}</p>
                      <p>当前价值: ${selectedAsset.value.toFixed(2)}</p>
                      <p>年化收益率: {selectedAsset.apy}%</p>
                    </div>
                  }
                  type="info"
                  icon={<InfoCircleOutlined />}
                  style={{ marginBottom: '20px' }}
                />
              )}

              <Alert
                message={redeemType === 'instant' ? '即时赎回说明' : '标准赎回说明'}
                description={
                  redeemType === 'instant' ?
                    '即时赎回会立即处理，但需支付3%的额外手续费。适合紧急需要流动性的情况。' :
                    '标准赎回需要等待28天的解锁期，但手续费较低（0.5%）。推荐用于非紧急情况。'
                }
                type={redeemType === 'instant' ? 'warning' : 'info'}
                showIcon
                style={{ marginBottom: '20px' }}
              />

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  icon={<ReloadOutlined />}
                  block
                >
                  {loading ? '赎回中...' : '确认赎回'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="赎回预览">
            {estimatedResult ? (
              <div style={{ marginBottom: '20px' }}>
                <Statistic
                  title="申请赎回"
                  value={estimatedResult.requestedAmount}
                  suffix={selectedAsset?.symbol}
                  valueStyle={{ color: '#1890ff' }}
                />
                <Statistic
                  title="手续费"
                  value={estimatedResult.fee}
                  suffix={selectedAsset?.originalSymbol}
                  valueStyle={{ color: '#f5222d' }}
                />
                <Statistic
                  title="实际到账"
                  value={estimatedResult.actualAmount}
                  suffix={selectedAsset?.originalSymbol}
                  valueStyle={{ color: '#52c41a' }}
                />
                {estimatedResult.waitTime > 0 && (
                  <Statistic
                    title="等待时间"
                    value={estimatedResult.waitTime}
                    suffix="天"
                    valueStyle={{ color: '#722ed1' }}
                  />
                )}
              </div>
            ) : (
              <Text type="secondary">
                选择资产和输入数量后，这里将显示赎回预览
              </Text>
            )}
          </Card>

          <Card title="重要提示" style={{ marginTop: '20px' }}>
            <Alert
              message="注意事项"
              description={
                <div style={{ fontSize: '12px' }}>
                  <p>• 赎回操作不可撤销，请仔细确认</p>
                  <p>• 标准赎回有解锁期，请耐心等待</p>
                  <p>• 即时赎回手续费较高，请谨慎使用</p>
                  <p>• 请确保保留足够的Gas费用</p>
                </div>
              }
              type="warning"
              showIcon
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StakeRedeem;