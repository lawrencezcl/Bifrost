// 设置页面
import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const Settings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <Title level={2}>设置</Title>
        <Text type="secondary">
          设置页面正在开发中...
        </Text>
      </Card>
    </div>
  );
};

export default Settings;