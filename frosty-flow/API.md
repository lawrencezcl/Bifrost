# FrostyFlow API Documentation

## 📖 Overview

FrostyFlow provides a comprehensive API for integrating with multi-chain liquid staking functionality. This document covers all available services, components, and integration points.

## 🛠️ Services Architecture

### Service Layer Overview

```
src/services/
├── mockService.js          # Mock data simulation
├── walletService.js        # Wallet connection management
├── transactionService.js   # Transaction monitoring
├── bifrostService.js       # Bifrost API integration
└── api/                    # External API integrations
    ├── wallet.js           # Wallet API wrapper
    ├── bifrost.js          # Bifrost SDK wrapper
    └── polkadot.js         # Polkadot.js utilities
```

## 🛡️ Wallet Service

### walletService.js

Core wallet management service providing abstraction over different wallet providers.

#### Methods

##### `connectWallet(walletType)`

Connects to a specific wallet provider.

```javascript
// Example usage
import walletService from '../services/walletService';

try {
  const result = await walletService.connectWallet('polkadot-js');
  console.log('Connected:', result);
} catch (error) {
  console.error('Connection failed:', error);
}
```

**Parameters:**
- `walletType` (string): Wallet type (`'polkadot-js'`, `'talisman'`, `'subwallet'`, `'metamask'`)

**Returns:**
```javascript
{
  wallet: WalletInstance,
  accounts: Account[],
  selectedAccount: Account,
  signer: Signer
}
```

##### `disconnect()`

Disconnects the current wallet.

```javascript
walletService.disconnect();
```

##### `getAccounts()`

Retrieves all accounts from connected wallet.

```javascript
const accounts = await walletService.getAccounts();
console.log('Available accounts:', accounts);
```

##### `switchAccount(account)`

Switches to a different account.

```javascript
await walletService.switchAccount(selectedAccount);
```

### Events

Wallet service emits events for state changes:

```javascript
walletService.on('accountChanged', (newAccount) => {
  console.log('Account changed:', newAccount);
});

walletService.on('walletDisconnected', () => {
  console.log('Wallet disconnected');
});
```

## 🔄 Transaction Service

### transactionService.js

Transaction monitoring and status tracking service.

#### Methods

##### `addTransaction(txHash, transactionData)`

Adds a new transaction to monitor.

```javascript
import transactionService from '../services/transactionService';

const transaction = transactionService.addTransaction('0x123...', {
  type: 'stake_mint',
  asset: 'DOT',
  amount: '100',
  from: '0xabc...',
  to: '0xdef...'
});
```

##### `getTransaction(txHash)`

Retrieves transaction details.

```javascript
const transaction = transactionService.getTransaction('0x123...');
console.log('Transaction:', transaction);
```

##### `getTransactionsByAccount(address)`

Gets all transactions for a specific account.

```javascript
const transactions = transactionService.getTransactionsByAccount('0xabc...');
```

##### `onStatusChange(txHash, callback)`

Subscribe to transaction status changes.

```javascript
transactionService.onStatusChange('0x123...', (transaction) => {
  console.log('Status changed:', transaction.status);
});
```

### Transaction States

```javascript
const states = {
  'pending': 'Transaction submitted, waiting for inclusion',
  'in_block': 'Transaction included in a block',
  'finalized': 'Transaction finalized',
  'failed': 'Transaction failed'
};
```

## 💰 Mock Service

### mockService.js

Comprehensive mock service for development and testing.

#### Methods

##### `getUserAssets(address)`

Returns mock user assets data.

```javascript
import mockService from '../services/mockService';

const assets = await mockService.getUserAssets('0xabc...');
console.log('User assets:', assets);
```

**Returns:**
```javascript
[
  {
    symbol: 'DOT',
    name: 'Polkadot',
    balance: { free: '1000', frozen: '0' },
    vsToken: { vToken: 'vDOT', balance: '950' },
    price: 25.50,
    chainName: 'Bifrost Testnet',
    apy: 15.8,
    totalValue: 25500,
    yieldEarned: 250.50
  }
]
```

##### `getAssetPrices()`

Returns current asset prices.

```javascript
const prices = await mockService.getAssetPrices();
console.log('Prices:', prices);
```

##### `simulateStake(asset, amount)`

Simulates a staking operation.

```javascript
const result = await mockService.simulateStake('DOT', '100');
console.log('Stake result:', result);
```

##### `simulateRedeem(asset, amount, redemptionType)`

Simulates a redemption operation.

```javascript
const result = await mockService.simulateRedeem('vDOT', '100', 'instant');
console.log('Redeem result:', result);
```

## 🔗 Redux Store

### Store Structure

```javascript
{
  wallet: {
    isConnected: boolean,
    currentWallet: string,
    accounts: Account[],
    selectedAccount: Account,
    isConnecting: boolean,
    error: string
  },
  chain: {
    currentChain: ChainConfig,
    isConnected: boolean,
    isConnecting: boolean,
    supportedChains: ChainConfig[],
    api: ApiInstance
  },
  asset: {
    assets: Asset[],
    prices: PriceMap,
    loading: boolean,
    error: string
  },
  transaction: {
    transactions: Transaction[],
    loading: boolean,
    error: string
  },
  ui: {
    theme: 'light' | 'dark',
    notifications: Notification[],
    sidebarCollapsed: boolean
  }
}
```

### Actions

#### Wallet Actions

```javascript
import { connectWallet, disconnect, switchAccount } from '../store/slices/walletSlice';

// Connect wallet
dispatch(connectWallet('polkadot-js'));

// Disconnect wallet
dispatch(disconnect());

// Switch account
dispatch(switchAccount(account));
```

#### Chain Actions

```javascript
import { switchChain, connectToChain } from '../store/slices/chainSlice';

// Switch chain
dispatch(switchChain(bifrostTestnet));

// Connect to chain
dispatch(connectToChain(moonbaseAlpha));
```

#### Asset Actions

```javascript
import { updateAssets, updatePrices } from '../store/slices/assetSlice';

// Update assets
dispatch(updateAssets(assetsData));

// Update prices
dispatch(updatePrices(pricesData));
```

## 🎨 Components

### Layout Component

Main application layout with sidebar navigation.

```jsx
import Layout from '../components/Layout';

<Layout>
  {/* Page content */}
</Layout>
```

**Props:**
- `children` (ReactNode): Page content
- `theme` (string): Theme mode ('light' | 'dark')
- `sidebarCollapsed` (boolean): Sidebar collapse state

### WalletConnector Component

Wallet connection modal component.

```jsx
import WalletConnector from '../components/WalletConnector';

<WalletConnector
  visible={modalVisible}
  onClose={() => setModalVisible(false)}
  onConnected={handleWalletConnected}
/>
```

**Props:**
- `visible` (boolean): Modal visibility
- `onClose` (function): Close handler
- `onConnected` (function): Connection success handler

### ChainSelector Component

Network selection component.

```jsx
import ChainSelector from '../components/ChainSelector';

<ChainSelector
  currentChain={currentChain}
  onChainChange={handleChainChange}
/>
```

**Props:**
- `currentChain` (object): Currently selected chain
- `onChainChange` (function): Chain change handler
- `disabled` (boolean): Disable selector

### TransactionMonitor Component

Transaction history and monitoring component.

```jsx
import TransactionMonitor from '../components/TransactionMonitor';

<TransactionMonitor
  visible={visible}
  onClose={() => setVisible(false)}
  accountAddress={accountAddress}
/>
```

**Props:**
- `visible` (boolean): Drawer visibility
- `onClose` (function): Close handler
- `accountAddress` (string): Account address filter

## 📄 Pages

### Dashboard Page

Asset overview and statistics dashboard.

```jsx
import Dashboard from '../pages/Dashboard';

<Dashboard />
```

**Features:**
- Multi-chain asset overview
- Total value and earnings statistics
- Asset performance charts
- Quick action buttons

### StakeMint Page

Liquid staking interface.

```jsx
import StakeMint from '../pages/StakeMint';

<StakeMint />
```

**Features:**
- Asset selection and amount input
- Real-time yield calculations
- Fee estimation
- Transaction confirmation

### StakeRedeem Page

Redemption interface.

```jsx
import StakeRedeem from '../pages/StakeRedeem';

<StakeRedeem />
```

**Features:**
- Instant vs standard redemption
- Fee calculation
- Redemption preview
- Transaction tracking

### Analytics Page

Charts and analytics dashboard.

```jsx
import Analytics from '../pages/Analytics';

<Analytics />
```

**Features:**
- Earnings trend charts
- Asset distribution visualization
- Yield comparison charts
- Performance statistics

## 🔧 Configuration

### Network Configuration

Networks are configured in `src/config/networks.js`:

```javascript
export const NETWORKS = {
  BIFROST_TESTNET: {
    name: 'Bifrost Testnet',
    chainId: 'bifrost-testnet',
    rpc: 'wss://bifrost-rpc.testnet.liebi.com/ws',
    symbol: 'BNC',
    decimals: 12,
    blockExplorer: 'https://bifrost-testnet.subscan.io'
  },
  // ... other networks
};
```

### Adding New Networks

1. Add network configuration to `networks.js`
2. Update supported assets
3. Test connection and functionality

### Environment Variables

Create `.env.local` for development:

```bash
# API Endpoints
VITE_API_BASE_URL=https://api.frostyflow.dev

# Network Configuration
VITE_DEFAULT_NETWORK=bifrost-testnet

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_MOCK_MODE=true

# Wallet Configuration
VITE_SUPPORTED_WALLETS=polkadot-js,talisman,subwallet
```

## 🧪 Testing

### Mock Mode

Enable mock mode for development without blockchain connection:

```javascript
// In src/config/mock.js
export const MOCK_CONFIG = {
  enableTestMode: true,
  simulateTransactions: true,
  mockDelay: 1000
};
```

### Test Utilities

```javascript
// Test utilities
export const testUtils = {
  createMockWallet: () => ({
    accounts: mockAccounts,
    selectedAccount: mockAccounts[0]
  }),

  createMockTransaction: () => ({
    hash: '0x' + Array.from({length: 64}, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')
  }),

  waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};
```

## 🔌 Integration Examples

### Basic Wallet Integration

```javascript
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { connectWallet, disconnect } from '../store/slices/walletSlice';

const WalletComponent = () => {
  const dispatch = useDispatch();
  const { isConnected, selectedAccount } = useSelector(state => state.wallet);

  const handleConnect = async () => {
    try {
      await dispatch(connectWallet('polkadot-js'));
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleDisconnect = () => {
    dispatch(disconnect());
  };

  return (
    <div>
      {isConnected ? (
        <div>
          <p>Connected: {selectedAccount?.address}</p>
          <button onClick={handleDisconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  );
};
```

### Transaction Monitoring Integration

```javascript
import { useEffect } from 'react';
import transactionService from '../services/transactionService';

const TransactionMonitor = ({ txHash }) => {
  useEffect(() => {
    const handleStatusChange = (transaction) => {
      console.log('Transaction status:', transaction.status);
    };

    transactionService.onStatusChange(txHash, handleStatusChange);

    return () => {
      // Cleanup listener
    };
  }, [txHash]);

  return <div>Monitoring transaction: {txHash}</div>;
};
```

### Custom Hooks

```javascript
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

// Custom hook for wallet connection
export const useWallet = () => {
  const wallet = useSelector(state => state.wallet);
  return wallet;
};

// Custom hook for assets
export const useAssets = () => {
  const assets = useSelector(state => state.asset.assets);
  const loading = useSelector(state => state.asset.loading);
  return { assets, loading };
};

// Custom hook for transactions
export const useTransactions = (address) => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (address) {
      const txs = transactionService.getTransactionsByAccount(address);
      setTransactions(txs);
    }
  }, [address]);

  return transactions;
};
```

## 📚 Error Handling

### Error Types

```javascript
export const ERROR_TYPES = {
  WALLET_CONNECTION: 'WALLET_CONNECTION',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INVALID_AMOUNT: 'INVALID_AMOUNT'
};
```

### Error Handling Pattern

```javascript
const handleOperation = async () => {
  try {
    setLoading(true);
    const result = await someOperation();
    onSuccess(result);
  } catch (error) {
    console.error('Operation failed:', error);
    onError(error.message);
  } finally {
    setLoading(false);
  }
};
```

## 🔍 Debugging

### Debug Mode

Enable debug mode for detailed logging:

```javascript
// In src/config/debug.js
export const DEBUG_CONFIG = {
  enabled: process.env.NODE_ENV === 'development',
  logLevel: 'debug',
  showPerformanceMetrics: true
};
```

### Browser DevTools

Use Redux DevTools for state inspection:
- Install Redux DevTools extension
- State will be available in dev tools panel
- Time-travel debugging available

### Network Monitoring

Monitor network requests:
- Check browser network tab
- Verify API endpoints
- Analyze response times

## 🚀 Deployment

### Environment Setup

Production environment variables:

```bash
# Production
NODE_ENV=production
VITE_API_BASE_URL=https://api.frostyflow.dev
VITE_DEFAULT_NETWORK=bifrost-mainnet
VITE_ENABLE_MOCK_MODE=false
```

### Build Process

```bash
# Build for production
npm run build

# Preview build
npm run preview

# Analyze bundle
npm run analyze
```

### Static Deployment

The application is ready for static deployment to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

---

## 📞 Support

For API-related questions:
- **Documentation**: This file
- **Issues**: GitHub Issues
- **Discord**: Community support
- **Email**: support@frostyflow.dev

---

<div align="center">

**🔗 FrostyFlow API v1.0**

Made with ❤️ by the FrostyFlow Team

</div>