# FrostyFlow - Bifrost多链流动性质押一站式交互平台

## 项目简介

FrostyFlow 是为 Bifrost 生态系统设计的多链流动性质押一站式交互平台，旨在解决用户在多链切换、资产监控、操作流程中的核心痛点。

## 核心功能

### 1. 多链统一入口
- 支持 Polkadot.js、MetaMask、Talisman 等主流钱包
- 自动识别已添加的 Bifrost 兼容链
- 一键添加链配置
- 无缝链切换体验

### 2. 流动性质押全流程
- **质押铸造**: DOT→vDOT, GLMR→vGLMR 等
- **质押赎回**: 支持即时赎回和标准赎回
- **实时进度追踪**: 区块确认进度、交易状态监控
- **Gas 优化**: 三种确认速度模式

### 3. 多链资产可视化
- 多链资产总览（USD 价值、总收益）
- 单链资产明细（质押记录、收益记录）
- 收益趋势图表（7天/30天/90天）
- 资产提醒设置

### 4. 新手引导系统
- 分步引导弹窗
- 常见问题浮窗
- 操作视频教程

## 技术栈

- **前端框架**: React 18
- **UI 组件库**: Ant Design 5.x
- **状态管理**: Redux Toolkit
- **图表可视化**: ECharts 5.x
- **多链交互**: Bifrost SDK + Polkadot.js API
- **构建工具**: Vite
- **部署**: Vercel

## 快速开始

### 环境要求
- Node.js 18+
- npm 9+

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

服务器将在 http://localhost:5174 启动（如果5173端口被占用，会自动使用下一个可用端口）

### 构建生产版本
```bash
npm run build
```

## Vercel 部署指南

1. **准备工作**
   - 将仓库推送到 GitHub/GitLab
   - 注册 [Vercel](https://vercel.com) 账号并关联代码仓库

2. **导入项目**
   - 在 Vercel 创建新项目，选择 `frosty-flow` 仓库
   - Vercel 会自动识别到 `vercel.json` 并使用 `npm run build` 构建，输出目录为 `dist`

3. **配置环境变量**
   - 在「Project Settings → Environment Variables」中，根据 `.env.production.example` 创建变量
   - 重要变量：`VITE_RPC_ENDPOINT`、`VITE_API_BASE_URL`、`VITE_SUBSCAN_API_KEY` 等
   - 如果只需演示数据，可将 `VITE_ENABLE_MOCK` 设为 `true`

4. **部署与访问**
   - 保存配置后点击「Deploy」即可触发构建
   - 部署完成后，Vercel 会生成一个 `https://<project>.vercel.app` 的访问地址
   - 如需自定义域名，可在 Vercel 的「Domains」面板中绑定

## 模拟运行环境

为了方便UI/UX测试，我们提供了一个完整的模拟运行环境，无需连接真实的区块链网络即可测试所有功能。

### 启动模拟环境
```bash
npm run dev
```

### 测试页面
1. **资产总览** - http://localhost:5174/
2. **质押铸造** - http://localhost:5174/stake
3. **质押赎回** - http://localhost:5174/redeem

详细说明请查看 [MOCK_RUN.md](MOCK_RUN.md)

## 支持的链和资产

### 主网
- **Bifrost Passet Hub**
  - DOT → vDOT
  - 其他 Polkadot 生态资产

### 测试网
- **Moonbase Alpha**
  - GLMR → vGLMR
  - 测试用代币

## 开发计划

- [x] 基础架构搭建
- [x] 钱包连接模块
- [x] 链管理和切换
- [x] 资产总览界面
- [x] 质押铸造功能
- [x] 质押赎回功能
- [ ] 收益分析图表
- [ ] 新手引导系统
- [x] 移动端适配

## 许可证

本项目采用 MIT 许可证。

## 致谢

- [Bifrost](https://bifrost.finance/) - 提供强大的流动性质押基础设施
- [Polkadot.js](https://polkadot.js.org/) - 优秀的 Polkadot 生态开发工具
- [Ant Design](https://ant.design/) - 精美的 React UI 组件库