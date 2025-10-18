// 收益分析页面
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Typography,
  Statistic,
  Space,
  Alert,
  Spin,
  Empty
} from 'antd';
import {
  RiseOutlined,
  DollarOutlined,
  PercentageOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import mockService from '../services/mockService';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Analytics = () => {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [chartData, setChartData] = useState(null);
  const [earningsData, setEarningsData] = useState(null);

  const { selectedAccount, isConnected } = useSelector(state => state.wallet);

  // 时间范围选项
  const timeRangeOptions = [
    { value: '24h', label: '24小时' },
    { value: '7d', label: '7天' },
    { value: '30d', label: '30天' },
    { value: '90d', label: '90天' },
    { value: '1y', label: '1年' }
  ];

  // 生成模拟图表数据
  const generateChartData = (range) => {
    const now = dayjs();
    let dataPoints = [];
    let labels = [];

    let days, format;
    switch (range) {
      case '24h':
        days = 1;
        format = 'HH:mm';
        break;
      case '7d':
        days = 7;
        format = 'MM-DD';
        break;
      case '30d':
        days = 30;
        format = 'MM-DD';
        break;
      case '90d':
        days = 90;
        format = 'MM-DD';
        break;
      case '1y':
        days = 365;
        format = 'YYYY-MM';
        break;
      default:
        days = 7;
        format = 'MM-DD';
    }

    let baseValue = 100;
    for (let i = days; i >= 0; i--) {
      const date = now.subtract(i, 'day');
      const dateStr = date.format(format);

      // 模拟收益增长，带有随机波动
      baseValue += Math.random() * 10 - 2;
      baseValue = Math.max(baseValue, 50); // 确保不低于50

      dataPoints.push(baseValue.toFixed(2));
      labels.push(dateStr);
    }

    return { labels, data: dataPoints };
  };

  // 生成模拟收益数据
  const generateEarningsData = () => {
    return {
      totalEarnings: (Math.random() * 1000 + 500).toFixed(2),
      dailyAverage: (Math.random() * 50 + 10).toFixed(2),
      monthlyEarnings: (Math.random() * 500 + 200).toFixed(2),
      annualizedAPY: (Math.random() * 10 + 10).toFixed(2),
      bestDay: (Math.random() * 100 + 20).toFixed(2),
      worstDay: -(Math.random() * 20 + 5).toFixed(2),
      totalDeposits: (Math.random() * 5000 + 1000).toFixed(2),
      currentValue: (Math.random() * 6000 + 2000).toFixed(2)
    };
  };

  // 加载分析数据
  const loadAnalyticsData = async () => {
    if (!isConnected) {
      return;
    }

    setLoading(true);
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      const chart = generateChartData(timeRange);
      const earnings = generateEarningsData();

      setChartData(chart);
      setEarningsData(earnings);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      loadAnalyticsData();
    }
  }, [isConnected, timeRange]);

  // 收益趋势图表配置
  const earningsChartOption = {
    title: {
      text: '收益趋势',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        const data = params[0];
        return `日期: ${data.name}<br/>收益: $${data.value}`;
      }
    },
    xAxis: {
      type: 'category',
      data: chartData?.labels || [],
      axisLabel: {
        rotate: timeRange === '24h' ? 0 : 45,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      name: '收益 (USD)',
      axisLabel: {
        formatter: '${value}'
      }
    },
    series: [{
      name: '收益',
      type: 'line',
      data: chartData?.data || [],
      smooth: true,
      lineStyle: {
        color: '#1890ff',
        width: 3
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: 'rgba(24, 144, 255, 0.3)'
          }, {
            offset: 1, color: 'rgba(24, 144, 255, 0.1)'
          }]
        }
      },
      itemStyle: {
        color: '#1890ff'
      }
    }],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    }
  };

  // 资产分布饼图配置
  const assetDistributionOption = {
    title: {
      text: '资产分布',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: ${c} ({d}%)'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [{
      name: '资产分布',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      data: [
        { value: 2480.50, name: 'DOT 质押' },
        { value: 1890.75, name: 'GLMR 质押' },
        { value: 1250.30, name: 'KSM 质押' },
        { value: 856.20, name: '流动资金' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  // 收益率柱状图配置
  const yieldComparisonOption = {
    title: {
      text: '各资产收益率对比',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: ['DOT', 'GLMR', 'KSM']
    },
    yAxis: {
      type: 'value',
      name: '年化收益率 (%)',
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [{
      name: '年化收益率',
      type: 'bar',
      data: [15.8, 12.5, 18.2],
      itemStyle: {
        color: function(params) {
          const colors = ['#1890ff', '#52c41a', '#722ed1'];
          return colors[params.dataIndex];
        }
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}%'
      }
    }],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    }
  };

  // 未连接钱包状态
  if (!isConnected) {
    return (
      <div className="flex-center min-h-96">
        <Card className="text-center p-8">
          <RiseOutlined className="text-6xl text-gray-400 mb-4" />
          <Title level={3}>连接钱包查看收益分析</Title>
          <Text type="secondary">
            连接您的钱包以查看详细的收益分析和图表
          </Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和控制 */}
      <div className="flex-between">
        <div>
          <Title level={2} className="mb-1">收益分析</Title>
          <Text type="secondary">
            查看您的质押收益趋势和资产表现
          </Text>
        </div>

        <Space>
          <Select
            value={timeRange}
            onChange={setTimeRange}
            style={{ width: 120 }}
          >
            {timeRangeOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Space>
      </div>

      {/* 收益统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总收益"
              value={earningsData?.totalEarnings || 0}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#52c41a' }}
              suffix={<RiseOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="日均收益"
              value={earningsData?.dailyAverage || 0}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#1890ff' }}
              suffix={<DollarOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="年化收益率"
              value={earningsData?.annualizedAPY || 0}
              precision={2}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
              prefix={<PercentageOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="当前市值"
              value={earningsData?.currentValue || 0}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]}>
        {/* 收益趋势图 */}
        <Col xs={24} lg={16}>
          <Card loading={loading}>
            <ReactECharts
              option={earningsChartOption}
              style={{ height: '400px' }}
              notMerge={true}
              lazyUpdate={true}
            />
          </Card>
        </Col>

        {/* 资产分布饼图 */}
        <Col xs={24} lg={8}>
          <Card loading={loading}>
            <ReactECharts
              option={assetDistributionOption}
              style={{ height: '400px' }}
              notMerge={true}
              lazyUpdate={true}
            />
          </Card>
        </Col>
      </Row>

      {/* 收益率对比 */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card loading={loading}>
            <ReactECharts
              option={yieldComparisonOption}
              style={{ height: '300px' }}
              notMerge={true}
              lazyUpdate={true}
            />
          </Card>
        </Col>
      </Row>

      {/* 额外统计信息 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card title="收益统计" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div className="flex-between">
                <Text>最佳单日收益:</Text>
                <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>
                  ${earningsData?.bestDay || 0}
                </Text>
              </div>
              <div className="flex-between">
                <Text>最差单日收益:</Text>
                <Text style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                  ${earningsData?.worstDay || 0}
                </Text>
              </div>
              <div className="flex-between">
                <Text>总质押金额:</Text>
                <Text style={{ fontWeight: 'bold' }}>
                  ${earningsData?.totalDeposits || 0}
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12}>
          <Card title="本月收益" size="small">
            <Statistic
              value={earningsData?.monthlyEarnings || 0}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#52c41a', fontSize: '24px' }}
              suffix={
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  / 月
                </Text>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* 数据说明 */}
      <Alert
        message="数据说明"
        description="当前显示的是模拟数据，用于演示图表功能。实际使用时将显示真实的链上收益数据。"
        type="info"
        showIcon
        closable
      />
    </div>
  );
};

export default Analytics;