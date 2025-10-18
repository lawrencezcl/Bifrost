// 通知中心组件
import { useState } from 'react';
import { Dropdown, List, Typography, Empty, Button } from 'antd';
import { BellOutlined } from '@ant-design/icons';

const { Text } = Typography;

const NotificationCenter = () => {
  const [open, setOpen] = useState(false);

  const notifications = []; // 暂时为空

  const notificationList = (
    <div className="w-80 max-h-96 overflow-auto">
      <div className="p-4 border-b">
        <Text className="font-medium">通知</Text>
      </div>

      {notifications.length === 0 ? (
        <div className="p-4">
          <Empty
            description="暂无通知"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item className="px-4">
              <List.Item.Meta
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Dropdown
      menu={{ items: [] }}
      dropdownRender={() => notificationList}
      trigger={['click']}
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
    >
      <Button
        type="text"
        icon={<BellOutlined />}
        onClick={() => setOpen(!open)}
      />
    </Dropdown>
  );
};

export default NotificationCenter;