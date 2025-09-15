// 质押铸造页面
import { useState, useEffect } from 'react';
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
  message
} from 'antd';
import {
  SwapOutlined,
  InfoCircleOutlined,
  CalculatorOutlined
} from '@ant-design/icons';

import mockService from '../services/mockService';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const StakeMint = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [estimatedReturn, setEstimatedReturn] = useState(null);
  const [stakableAssets, setStakableAssets] = useState([]);

  useEffect(() => {
    loadStakableAssets();
  }, []);

  const loadStakableAssets = async () => {
    try {
      const assets = await mockService.getStakableAssets();
      setStakableAssets(assets);
    } catch (error) {
      console.error('加载可质押资产失败:', error);
      // 使用默认资产
      setStakableAssets([
        { symbol: 'DOT', vsymbol: 'vDOT', apy: 12.5, balance: '100.5678' },
        { symbol: 'GLMR', vsymbol: 'vGLMR', apy: 8.7, balance: '500.1234' }
      ]);
    }
  };

  const handleAssetChange = (assetSymbol) => {
    const asset = stakableAssets.find(a => a.symbol === assetSymbol);
    setSelectedAsset(asset);
  };

  const handleAmountChange = async (e) => {
    const amount = e.target.value;
    if (selectedAsset && amount && !isNaN(amount) && parseFloat(amount) > 0) {
      try {
        const result = await mockService.calculateYield({
          asset: selectedAsset.symbol,
          amount: parseFloat(amount),
          stakingDays: 365
        });
        setEstimatedReturn(result);
      } catch (error) {
        console.error('计算收益失败:', error);
        setEstimatedReturn(null);
      }
    } else {
      setEstimatedReturn(null);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const result = await mockService.stakeMint({
        asset: values.asset,
        amount: values.amount,
        account: 'mock-account'
      });
      
      message.success(`质押成功！交易ID: ${result.txHash.substring(0, 10)}...`);
      console.log('质押成功:', result);
      
      // 重置表单
      form.resetFields();
      setSelectedAsset(null);
      setEstimatedReturn(null);
    } catch (error) {
      console.error('质押失败:', error);
      message.error('质押失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div>
        <Title level={2}>质押铸造</Title>
        <Text type="secondary">
          将您的代币质押以获得流动性质押代币，享受质押收益的同时保持流动性
        </Text>
      </div>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={16}>
          <Card title="质押信息">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
            >
              <Form.Item
                label="选择资产"
                name="asset"
                rules={[{ required: true, message: '请选择要质押的资产' }]}
              >
                <Select
                  placeholder="选择要质押的资产"
                  onChange={handleAssetChange}
                  size="large"
                >
                  {stakableAssets.map(asset => (
                    <Option key={asset.symbol} value={asset.symbol}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{asset.symbol}</span>
                        <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                          APY: {asset.currentAPY}%
                        </span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="质押数量"
                name="amount"
                rules={[
                  { required: true, message: '请输入质押数量' },
                  { 
                    pattern: /^\d+(\.\d+)?$/,
                    message: '请输入有效的数字'
                  }
                ]}
              >
                <Input
                  placeholder="输入质押数量"
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
                            form.setFieldsValue({ amount: selectedAsset.balance || '100' });
                            handleAmountChange({ target: { value: selectedAsset.balance || '100' } });
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
                      <p>可用余额: {selectedAsset.balance || '100'} {selectedAsset.symbol}</p>
                      <p>年化收益率: {selectedAsset.currentAPY}%</p>
                      <p>质押后获得: v{selectedAsset.symbol} (流动性质押代币)</p>
                    </div>
                  }
                  type="info"
                  icon={<InfoCircleOutlined />}
                  style={{ marginBottom: '20px' }}
                />
              )}

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  icon={<SwapOutlined />}
                  block
                >
                  {loading ? '质押中...' : '确认质押'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="收益预估">
            {estimatedReturn ? (
              <div style={{ marginBottom: '20px' }}>
                <Statistic
                  title="日收益"
                  value={estimatedReturn.dailyYield}
                  precision={6}
                  suffix={selectedAsset?.symbol}
                  valueStyle={{ color: '#52c41a' }}
                />
                <Statistic
                  title="年收益"
                  value={estimatedReturn.totalYield}
                  precision={4}
                  suffix={selectedAsset?.symbol}
                  valueStyle={{ color: '#1890ff' }}
                />
                <Statistic
                  title="年化收益率"
                  value={estimatedReturn.apy}
                  precision={2}
                  suffix="%"
                  valueStyle={{ color: '#722ed1' }}
                />
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#8c8c8c' }}>
                  最终金额: {estimatedReturn.finalAmount} {selectedAsset?.symbol}
                </div>
              </div>
            ) : (
              <Text type="secondary">
                选择资产并输入数量后，这里将显示收益预估
              </Text>
            )}
          </Card>

          <Card title="风险提示" style={{ marginTop: '20px' }}>
            <Alert
              message="重要提示"
              description={
                <div style={{ fontSize: '12px' }}>
                  <p>• 质押有锁定期，请确保您了解解锁规则</p>
                  <p>• 收益率可能会根据市场情况变化</p>
                  <p>• 请确保保留足够的手续费</p>
                  <p>• 本操作不可撤销，请仔细确认</p>
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

export default StakeMint;