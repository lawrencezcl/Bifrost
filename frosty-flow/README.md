# FrostyFlow - Bifrost多链流动性质押一站式交互平台

<div align="center">

![FrostyFlow Logo](https://img.shields.io/badge/FrostyFlow-v1.0-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![Ant Design](https://img.shields.io/badge/Ant%20Design-5.20.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

## 项目简介

FrostyFlow 是为 Bifrost 生态系统设计的**现代化多链流动性质押一站式交互平台**。该平台提供了完整的 Web3 用户体验，支持多链资产管理、实时收益分析、交易监控等功能，旨在解决用户在 DeFi 流动性质押中的核心痛点。

## 🌟 核心功能

### 1. 🛡️ 多链钱包集成
- **多钱包支持**: Polkadot.js Extension、Talisman、SubWallet、MetaMask
- **自动链识别**: 智能识别已添加的 Bifrost 兼容链
- **一键链配置**: 简化的网络添加流程
- **无缝切换**: 优雅的链切换体验

### 2. 💰 流动性质押全流程
- **质押铸造**: DOT→vDOT, GLMR→vGLMR, KSM→vKSM
- **质押赎回**: 即时赎回和标准赎回两种模式
- **实时进度追踪**: 区块确认进度、交易状态实时监控
- **Gas 优化**: 三种确认速度模式可选

### 3. 📊 多链资产可视化
- **资产总览**: 多链资产的 USD 价值和总收益统计
- **收益分析**: 7天/30天/90天/1年收益趋势图表
- **交易监控**: 实时交易状态跟踪和历史记录
- **资产分布**: 可视化资产配置饼图

### 4. 📱 响应式设计
- **移动端优化**: 专为移动设备设计的界面
- **触摸友好**: 大按钮和优化间距
- **自适应布局**: 完美适配各种屏幕尺寸

### 5. 🔔 智能通知系统
- **交易提醒**: 重要交易状态变更通知
- **收益提醒**: 收益到账通知
- **系统通知**: 平台状态和更新通知

## 🛠️ 技术栈

### 前端技术
- **前端框架**: React 18.2.0 (Hooks + Concurrent Features)
- **UI 组件库**: Ant Design 5.20.0 (企业级组件)
- **状态管理**: Redux Toolkit (现代化状态管理)
- **路由管理**: React Router v6 (声明式路由)
- **图表可视化**: ECharts 5.4.0 + echarts-for-react
- **样式处理**: CSS-in-JS + PostCSS
- **日期处理**: Day.js (轻量级日期库)

### 区块链技术
- **多链交互**: Polkadot.js API 10.13.1
- **钱包集成**: @polkadot/extension-dapp 0.46.9
- **加密工具**: @polkadot/util-crypto 12.6.2
- **密钥管理**: @polkadot/keyring 13.5.6

### 开发工具
- **构建工具**: Vite 5.4.0 (极速构建)
- **代码规范**: ESLint + Prettier
- **数学计算**: BigNumber.js 9.1.0
- **HTTP 客户端**: Axios 1.6.0

## 🚀 快速开始

### 环境要求
- **Node.js**: 18.0.0 或更高版本
- **npm**: 9.0.0 或更高版本
- **现代浏览器**: Chrome 90+, Firefox 88+, Safari 14+

### 安装依赖
```bash
# 克隆项目
git clone <repository-url>
cd frosty-flow

# 安装依赖
npm install
```

### 启动开发服务器
```bash
npm run dev
```

服务器将在 http://localhost:5173 启动（如果5173端口被占用，会自动使用下一个可用端口）

### 构建生产版本
```bash
npm run build
```

构建产物将生成在 `dist/` 目录中，可以部署到任何静态文件服务器。

### 代码检查
```bash
npm run lint
```

## 📱 应用界面

### 主要页面
1. **资产总览** (`/`) - 多链资产总览和统计
2. **质押铸造** (`/stake`) - 流动性质押界面
3. **质押赎回** (`/redeem`) - 赎回操作界面
4. **收益分析** (`/analytics`) - 图表和分析界面
5. **设置** (`/settings`) - 应用设置
6. **帮助中心** (`/help`) - 用户指南
7. **测试页面** (`/test`) - 开发测试页面

### 功能特性
- **响应式设计**: 完美适配桌面端和移动端
- **主题切换**: 支持明暗主题切换
- **实时更新**: 交易状态实时监控
- **离线提示**: 网络状态智能检测
- **错误处理**: 完善的错误恢复机制

## 🔗 支持的链和资产

### 测试网络
- **Bifrost Testnet** ⭐ 推荐用于测试
  - RPC: `wss://bifrost-rpc.testnet.liebi.com/ws`
  - 资产: BNC, DOT, KSM, GLMR
  - 水龙头: https://bifrost-testnet.liebi.com/faucet

- **Moonbase Alpha**
  - RPC: `wss://wss.api.moonbase.moonbeam.network`
  - 资产: DEV, GLMR
  - 水龙头: https://faucet.moonbeam.network

- **Kusama Asset Hub Testnet**
  - RPC: `wss://kusama-asset-hub-rpc.polkadot.io`
  - 资产: KSM, USDT

### 支持的钱包
- **Polkadot.js Extension** (推荐)
- **Talisman** (多链支持)
- **SubWallet** (移动端友好)
- **MetaMask** (EVM 兼容链)

## 📊 项目状态

### ✅ 已完成功能
- [x] 基础架构搭建
- [x] 钱包连接模块 (多钱包支持)
- [x] 链管理和无缝切换
- [x] 资产总览界面 (实时数据)
- [x] 质押铸造功能 (收益计算)
- [x] 质押赎回功能 (即时/标准模式)
- [x] 收益分析图表 (ECharts 集成)
- [x] 交易监控系统 (实时状态追踪)
- [x] 响应式设计 (移动端优化)
- [x] 通知中心系统
- [x] 生产环境构建优化

### 🚧 即将开发
- [ ] 新手引导系统
- [ ] 高级收益分析功能
- [ ] 流动性挖矿功能
- [ ] 治理投票功能
- [ ] 更多网络支持
- [ ] 社交功能集成

## 🧪 测试指南

### 模拟环境测试
项目内置了完整的模拟环境，无需连接真实区块链即可测试所有功能：

1. **启动应用**: `npm run dev`
2. **访问**: http://localhost:5173
3. **体验功能**:
   - 点击"连接钱包"查看钱包连接界面
   - 浏览各个页面的 UI 和交互
   - 查看收益分析图表
   - 测试交易监控功能

### 真实网络测试
要连接真实测试网络：

1. **获取测试币**: 访问对应水龙头获取测试代币
2. **连接钱包**: 安装 Polkadot.js Extension 或其他支持的钱包
3. **切换网络**: 在应用中选择测试网络
4. **执行交易**: 执行真实的质押和赎回操作

详细测试说明请查看 [TESTNET_GUIDE.md](TESTNET_GUIDE.md)

## 📁 项目结构

```
src/
├── components/          # 可复用组件
│   ├── Layout.jsx       # 主布局组件
│   ├── WalletConnector.jsx # 钱包连接
│   ├── ChainSelector.jsx    # 链选择器
│   ├── NotificationCenter.jsx # 通知中心
│   └── TransactionMonitor.jsx # 交易监控
├── pages/               # 页面组件
│   ├── Dashboard.jsx    # 资产总览
│   ├── StakeMint.jsx    # 质押铸造
│   ├── StakeRedeem.jsx  # 质押赎回
│   ├── Analytics.jsx    # 收益分析
│   ├── Settings.jsx     # 设置页面
│   ├── Help.jsx         # 帮助中心
│   └── TestDashboard.jsx # 测试页面
├── services/            # 服务层
│   ├── mockService.js   # 模拟数据服务
│   ├── transactionService.js # 交易服务
│   ├── walletService.js # 钱包服务
│   └── bifrostService.js # Bifrost 服务
├── store/               # 状态管理
│   ├── slices/          # Redux slices
│   └── index.js         # Store 配置
├── config/              # 配置文件
│   └── networks.js      # 网络配置
├── utils/               # 工具函数
├── styles/              # 样式文件
└── assets/              # 静态资源
```

## 🔧 开发指南

### 添加新功能
1. 在 `services/` 中添加业务逻辑
2. 在 `store/slices/` 中添加状态管理
3. 在 `components/` 或 `pages/` 中添加 UI 组件
4. 更新路由配置
5. 添加测试用例

### 代码规范
- 使用 TypeScript (如果启用)
- 遵循 ESLint 规则
- 组件使用函数式组件 + Hooks
- 状态管理使用 Redux Toolkit
- 样式使用 CSS Modules 或 styled-components

### 部署建议
- **Vercel**: 推荐用于快速部署
- **Netlify**: 适合静态网站部署
- **AWS S3 + CloudFront**: 企业级部署
- **Docker**: 容器化部署

## 📈 性能优化

### 已实现优化
- ✅ 代码分割和懒加载
- ✅ 图片和资源优化
- ✅ Bundle 大小分析
- ✅ React.memo 优化重渲染
- ✅ 虚拟滚动（大数据列表）

### 继续优化方向
- 🔄 Service Worker 缓存
- 🔄 Web Workers 计算
- 🔄 更精细的代码分割
- 🔄 图片 CDN 优化

## 🤝 贡献指南

我们欢迎所有形式的贡献：

1. **报告问题**: 在 Issues 中报告 bug 或提出建议
2. **提交代码**: Fork 项目并提交 Pull Request
3. **改进文档**: 帮助完善文档和示例
4. **分享反馈**: 使用后分享使用体验

### 提交规范
- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

## 🙏 致谢

感谢以下开源项目和技术支持：

- [Bifrost](https://bifrost.finance/) - 强大的流动性质押基础设施
- [Polkadot.js](https://polkadot.js.org/) - 优秀的 Polkadot 生态开发工具
- [Ant Design](https://ant.design/) - 精美的 React UI 组件库
- [React](https://reactjs.org/) - 现代化的前端框架
- [Vite](https://vitejs.dev/) - 极速的前端构建工具
- [ECharts](https://echarts.apache.org/) - 强大的数据可视化库

---

<div align="center">

**🌟 如果这个项目对您有帮助，请给我们一个 Star！**

Made with ❤️ by FrostyFlow Team

</div>