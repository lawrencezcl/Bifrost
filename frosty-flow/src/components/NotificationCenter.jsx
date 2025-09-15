// 通知中心组件
import { useState } from 'react';
import { Dropdown, List, Typography, Empty, Button } from 'antd';

const { Text } = Typography;

const NotificationCenter = ({ children }) => {
  const [visible, setVisible] = useState(false);

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
      overlay={notificationList}
      trigger={['click']}
      placement="bottomRight"
      visible={visible}
      onVisibleChange={setVisible}
    >
      {children}
    </Dropdown>
  );
};

export default NotificationCenter;