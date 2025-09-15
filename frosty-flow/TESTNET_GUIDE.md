# FrostyFlow Testnet 集成测试指南

## 🎯 项目概述

FrostyFlow 现已成功集成 Testnet 功能，支持真实的钱包连接和区块链交互。

## 🔧 技术栈更新

### 新增依赖
- `@polkadot/api` - Polkadot/Substrate API
- `@polkadot/extension-dapp` - 钱包扩展集成
- `@polkadot/util` & `@polkadot/util-crypto` - 工具库

### 核心文件
- `src/config/networks.js` - 网络配置
- `src/services/walletService.js` - 钱包服务
- `src/components/WalletConnector.jsx` - 钱包连接组件

## 🌐 支持的测试网络

### 1. Bifrost Testnet (推荐)
- **RPC**: `wss://bifrost-rpc.testnet.liebi.com/ws`
- **资产**: BNC, DOT, KSM, GLMR
- **功能**: 流动性质押、vToken 铸造/赎回

### 2. Moonbase Alpha
- **RPC**: `wss://wss.api.moonbase.moonbeam.network`
- **资产**: DEV, GLMR
- **类型**: EVM 兼容

### 3. Kusama Asset Hub Testnet
- **RPC**: `wss://kusama-asset-hub-rpc.polkadot.io`
- **资产**: KSM, USDT

## 👛 支持的钱包

### Substrate 钱包
1. **Polkadot.js Extension** (推荐)
   - 下载: https://polkadot.js.org/extension/
   - 支持所有 Substrate 链

2. **Talisman**
   - 下载: https://talisman.xyz
   - 多链支持

3. **SubWallet**
   - 下载: https://subwallet.app
   - 移动端友好

### EVM 钱包
4. **MetaMask**
   - 用于 Moonbase Alpha 网络

## 🧪 测试步骤

### 阶段 1: 环境准备
1. **安装钱包扩展**
   ```bash
   # 访问并安装 Polkadot.js Extension
   https://polkadot.js.org/extension/
   ```

2. **创建测试账户**
   - 在钱包中创建新账户
   - 记录助记词和地址

3. **获取测试代币**
   - Bifrost 测试网水龙头: https://bifrost-testnet.liebi.com/faucet
   - Moonbase Alpha 水龙头: https://faucet.moonbeam.network

### 阶段 2: 钱包连接测试
1. **启动应用**
   ```bash
   npm run dev
   # 访问 http://localhost:5174 (如果5173被占用)
   ```

2. **连接钱包**
   - 点击"连接钱包"按钮
   - 选择已安装的钱包
   - 在钱包扩展中确认连接

3. **选择网络**
   - 选择 "Bifrost Testnet"
   - 等待网络连接确认

### 阶段 3: 功能测试
1. **余额查询**
   - 验证账户余额正确显示
   - 检查多资产余额

2. **质押功能**
   - 选择质押资产 (DOT/GLMR/KSM)
   - 输入质押数量
   - 确认交易签名
   - 验证交易状态

3. **赎回功能**
   - 选择已质押的 vToken
   - 选择赎回类型（标准/即时）
   - 确认赎回交易

## 🎨 UI/UX 模拟测试

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

## 🔍 调试和监控

### 浏览器控制台
监控以下日志信息：
```javascript
// 钱包连接状态
console.log('Wallet status:', walletService.getStatus());

// 网络连接信息
console.log('Network info:', {
  chain: api.rpc.system.chain(),
  version: api.rpc.system.version()
});

// 交易状态
console.log('Transaction status:', status.type);
```

### 区块链浏览器
- Bifrost: https://bifrost-testnet.subscan.io
- Moonbase: https://moonbase.moonscan.io
- 验证交易哈希和状态

## ⚠️ 常见问题

### 1. 钱包连接失败
- 确保钱包扩展已安装并启用
- 刷新页面重试
- 检查浏览器控制台错误

### 2. 网络连接超时
- 检查网络连接
- 尝试切换 RPC 端点
- 等待网络稳定

### 3. 交易失败
- 检查账户余额是否足够
- 确认网络费用设置
- 验证交易参数

## 🚀 下一步开发

### 即将实现的功能
1. **多链资产桥接**
2. **收益历史追踪**
3. **流动性挖矿**
4. **治理投票**

### 主网部署准备
1. **安全审计**
2. **性能优化**
3. **监控告警**
4. **用户文档**

## 📞 技术支持

如果在测试过程中遇到问题，请提供以下信息：
- 浏览器版本和控制台错误
- 钱包类型和版本
- 网络配置
- 重现步骤

---

**注意**: 这是测试网版本，所有交易都使用测试代币，没有真实价值。