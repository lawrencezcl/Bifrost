// 资产详情页面
import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const AssetDetail = () => {
  return (
    <div className="space-y-6">
      <Card>
        <Title level={2}>资产详情</Title>
        <Text type="secondary">
          资产详情页面正在开发中...
        </Text>
      </Card>
    </div>
  );
};

export default AssetDetail;