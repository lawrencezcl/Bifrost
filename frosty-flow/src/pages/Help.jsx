// 帮助中心页面
import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const Help = () => {
  return (
    <div className="space-y-6">
      <Card>
        <Title level={2}>帮助中心</Title>
        <Text type="secondary">
          帮助中心页面正在开发中...
        </Text>
      </Card>
    </div>
  );
};

export default Help;