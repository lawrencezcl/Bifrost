// 存储工具函数
class StorageUtils {
  // 本地存储
  setItem(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('存储数据失败:', error);
    }
  }

  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('读取数据失败:', error);
      return defaultValue;
    }
  }

  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('删除数据失败:', error);
    }
  }

  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('清空存储失败:', error);
    }
  }
}

export default new StorageUtils();