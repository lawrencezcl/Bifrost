// UI 状态管理
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // 主题设置
  theme: localStorage.getItem('theme') || 'light',
  
  // 语言设置
  language: localStorage.getItem('language') || 'zh',
  
  // 侧边栏状态
  sidebarCollapsed: JSON.parse(localStorage.getItem('sidebarCollapsed') || 'false'),
  
  // 通知设置
  notifications: {
    enabled: JSON.parse(localStorage.getItem('notificationsEnabled') || 'true'),
    sound: JSON.parse(localStorage.getItem('notificationSound') || 'true'),
    email: JSON.parse(localStorage.getItem('emailNotifications') || 'false'),
    types: {
      transaction: true,
      yield: true,
      unlock: true,
      price: false
    }
  },
  
  // 活跃通知列表
  activeNotifications: [],
  
  // 模态框状态
  modals: {
    walletConnect: false,
    chainSwitch: false,
    stakeMint: false,
    stakeRedeem: false,
    settings: false,
    help: false
  },
  
  // 加载状态
  globalLoading: false,
  
  // 新手引导
  tutorial: {
    enabled: JSON.parse(localStorage.getItem('tutorialEnabled') || 'true'),
    currentStep: 0,
    completed: JSON.parse(localStorage.getItem('tutorialCompleted') || 'false'),
    steps: [
      {
        target: '#wallet-connect',
        title: '连接钱包',
        content: '首先需要连接您的Web3钱包，支持Polkadot.js、Talisman等钱包。'
      },
      {
        target: '#chain-selector',
        title: '选择链',
        content: '选择您想要进行流动性质押的区块链网络。'
      },
      {
        target: '#asset-overview',
        title: '资产总览',
        content: '这里展示您在各个链上的资产总价值和收益情况。'
      },
      {
        target: '#stake-mint-btn',
        title: '质押铸造',
        content: '点击这里开始质押您的资产，获得流动性质押代币。'
      },
      {
        target: '#asset-dashboard',
        title: '资产监控',
        content: '在这里可以查看详细的资产情况和收益趋势。'
      }
    ]
  },
  
  // 搜索状态
  search: {
    query: '',
    results: [],
    isSearching: false
  },
  
  // 页面状态
  currentPage: 'dashboard',
  breadcrumb: [],
  
  // 错误提示
  toast: {
    visible: false,
    type: 'info', // 'success' | 'error' | 'warning' | 'info'
    title: '',
    message: '',
    duration: 3000
  }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // 切换主题
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    
    // 设置主题
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', state.theme);
    },
    
    // 切换语言
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('language', state.language);
    },
    
    // 切换侧边栏
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      localStorage.setItem('sidebarCollapsed', JSON.stringify(state.sidebarCollapsed));
    },
    
    // 更新通知设置
    updateNotificationSettings: (state, action) => {
      state.notifications = { ...state.notifications, ...action.payload };
      
      // 保存到 localStorage
      localStorage.setItem('notificationsEnabled', JSON.stringify(state.notifications.enabled));
      localStorage.setItem('notificationSound', JSON.stringify(state.notifications.sound));
      localStorage.setItem('emailNotifications', JSON.stringify(state.notifications.email));
    },
    
    // 添加通知
    addNotification: (state, action) => {
      const notification = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        read: false,
        ...action.payload
      };
      
      state.activeNotifications.unshift(notification);
      
      // 限制通知数量
      if (state.activeNotifications.length > 50) {
        state.activeNotifications = state.activeNotifications.slice(0, 50);
      }
    },
    
    // 标记通知为已读
    markNotificationRead: (state, action) => {
      const id = action.payload;
      const notification = state.activeNotifications.find(n => n.id === id);
      if (notification) {
        notification.read = true;
      }
    },
    
    // 清除所有通知
    clearAllNotifications: (state) => {
      state.activeNotifications = [];
    },
    
    // 删除通知
    removeNotification: (state, action) => {
      const id = action.payload;
      state.activeNotifications = state.activeNotifications.filter(n => n.id !== id);
    },
    
    // 控制模态框
    setModalVisible: (state, action) => {
      const { modal, visible } = action.payload;
      state.modals[modal] = visible;
    },
    
    // 关闭所有模态框
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },
    
    // 设置全局加载状态
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
    
    // 新手引导控制
    setTutorialStep: (state, action) => {
      state.tutorial.currentStep = action.payload;
    },
    
    // 下一步引导
    nextTutorialStep: (state) => {
      if (state.tutorial.currentStep < state.tutorial.steps.length - 1) {
        state.tutorial.currentStep += 1;
      } else {
        state.tutorial.completed = true;
        state.tutorial.enabled = false;
        localStorage.setItem('tutorialCompleted', 'true');
        localStorage.setItem('tutorialEnabled', 'false');
      }
    },
    
    // 跳过引导
    skipTutorial: (state) => {
      state.tutorial.enabled = false;
      state.tutorial.completed = true;
      localStorage.setItem('tutorialCompleted', 'true');
      localStorage.setItem('tutorialEnabled', 'false');
    },
    
    // 重置引导
    resetTutorial: (state) => {
      state.tutorial.currentStep = 0;
      state.tutorial.completed = false;
      state.tutorial.enabled = true;
      localStorage.setItem('tutorialCompleted', 'false');
      localStorage.setItem('tutorialEnabled', 'true');
    },
    
    // 搜索控制
    setSearchQuery: (state, action) => {
      state.search.query = action.payload;
    },
    
    // 设置搜索结果
    setSearchResults: (state, action) => {
      state.search.results = action.payload;
      state.search.isSearching = false;
    },
    
    // 设置搜索状态
    setSearching: (state, action) => {
      state.search.isSearching = action.payload;
    },
    
    // 设置当前页面
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    
    // 更新面包屑
    setBreadcrumb: (state, action) => {
      state.breadcrumb = action.payload;
    },
    
    // 显示 Toast 消息
    showToast: (state, action) => {
      state.toast = {
        visible: true,
        type: 'info',
        duration: 3000,
        ...action.payload
      };
    },
    
    // 隐藏 Toast 消息
    hideToast: (state) => {
      state.toast.visible = false;
    }
  }
});

export const {
  toggleTheme,
  setTheme,
  setLanguage,
  toggleSidebar,
  updateNotificationSettings,
  addNotification,
  markNotificationRead,
  clearAllNotifications,
  removeNotification,
  setModalVisible,
  closeAllModals,
  setGlobalLoading,
  setTutorialStep,
  nextTutorialStep,
  skipTutorial,
  resetTutorial,
  setSearchQuery,
  setSearchResults,
  setSearching,
  setCurrentPage,
  setBreadcrumb,
  showToast,
  hideToast
} = uiSlice.actions;

export default uiSlice.reducer;