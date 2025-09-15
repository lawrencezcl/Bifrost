// 网络配置文件 - Testnet集成
export const NETWORKS = {
  // Bifrost测试网
  BIFROST_TESTNET: {
    name: 'Bifrost Testnet',
    rpcUrl: 'wss://bifrost-rpc.testnet.liebi.com/ws',
    chainId: 'bifrost-testnet',
    symbol: 'BNC',
    decimals: 12,
    blockExplorer: 'https://bifrost-testnet.subscan.io',
    faucet: 'https://bifrost-testnet.liebi.com/faucet',
    chainType: 'substrate',
    supportedAssets: ['BNC', 'DOT', 'KSM', 'GLMR'],
    contracts: {
      liquidStaking: 'bifrost-liquid-staking-pallet',
      vToken: 'bifrost-vtoken-pallet'
    }
  },

  // Moonbase Alpha测试网
  MOONBASE_ALPHA: {
    name: 'Moonbase Alpha',
    rpcUrl: 'wss://wss.api.moonbase.moonbeam.network',
    chainId: 1287,
    symbol: 'DEV',
    decimals: 18,
    blockExplorer: 'https://moonbase.moonscan.io',
    faucet: 'https://faucet.moonbeam.network',
    chainType: 'ethereum',
    supportedAssets: ['DEV', 'GLMR'],
    contracts: {
      liquidStaking: '0x1234567890123456789012345678901234567890', // 待部署
      vToken: '0x2345678901234567890123456789012345678901' // 待部署
    }
  },

  // Kusama Asset Hub测试网
  KUSAMA_ASSET_HUB_TESTNET: {
    name: 'Kusama Asset Hub Testnet',
    rpcUrl: 'wss://kusama-asset-hub-rpc.polkadot.io',
    chainId: 'kusama-asset-hub-testnet',
    symbol: 'KSM',
    decimals: 12,
    blockExplorer: 'https://kusama-asset-hub.subscan.io',
    chainType: 'substrate',
    supportedAssets: ['KSM', 'USDT'],
    contracts: {
      liquidStaking: 'kusama-liquid-staking-pallet'
    }
  }
};

// 默认网络配置
export const DEFAULT_NETWORK = NETWORKS.BIFROST_TESTNET;

// 支持的钱包
export const SUPPORTED_WALLETS = {
  POLKADOT_JS: {
    name: 'Polkadot.js Extension',
    id: 'polkadot-js',
    icon: '/images/wallets/polkadot-js.svg',
    downloadUrl: 'https://polkadot.js.org/extension/',
    supportedNetworks: ['substrate']
  },
  TALISMAN: {
    name: 'Talisman',
    id: 'talisman',
    icon: '/images/wallets/talisman.svg',
    downloadUrl: 'https://talisman.xyz',
    supportedNetworks: ['substrate', 'ethereum']
  },
  SUBWALLET: {
    name: 'SubWallet',
    id: 'subwallet-js',
    icon: '/images/wallets/subwallet.svg',
    downloadUrl: 'https://subwallet.app',
    supportedNetworks: ['substrate', 'ethereum']
  },
  METAMASK: {
    name: 'MetaMask',
    id: 'metamask',
    icon: '/images/wallets/metamask.svg',
    downloadUrl: 'https://metamask.io',
    supportedNetworks: ['ethereum']
  }
};

// 资产配置
export const SUPPORTED_ASSETS = {
  DOT: {
    symbol: 'DOT',
    name: 'Polkadot',
    decimals: 10,
    vTokenSymbol: 'vDOT',
    stakingRewards: {
      apy: 15.8,
      minStakeAmount: '1',
      maxStakeAmount: '10000',
      unbondingPeriod: 28 // 天数
    },
    networks: ['BIFROST_TESTNET']
  },
  GLMR: {
    symbol: 'GLMR',
    name: 'Moonbeam',
    decimals: 18,
    vTokenSymbol: 'vGLMR',
    stakingRewards: {
      apy: 12.5,
      minStakeAmount: '10',
      maxStakeAmount: '50000',
      unbondingPeriod: 7
    },
    networks: ['BIFROST_TESTNET', 'MOONBASE_ALPHA']
  },
  KSM: {
    symbol: 'KSM',
    name: 'Kusama',
    decimals: 12,
    vTokenSymbol: 'vKSM',
    stakingRewards: {
      apy: 18.2,
      minStakeAmount: '0.1',
      maxStakeAmount: '1000',
      unbondingPeriod: 7
    },
    networks: ['BIFROST_TESTNET', 'KUSAMA_ASSET_HUB_TESTNET']
  }
};

// API端点配置
export const API_ENDPOINTS = {
  PRICE_API: 'https://api.coingecko.com/api/v3',
  BIFROST_API: 'https://api.bifrost-finance.io',
  SUBSCAN_API: 'https://bifrost.api.subscan.io'
};

// 测试网环境配置
export const TEST_CONFIG = {
  enableTestMode: true,
  mockPrices: {
    DOT: 6.65,
    GLMR: 1.48,
    KSM: 18.15,
    BNC: 0.35
  },
  testAccounts: [
    {
      name: 'Alice',
      address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      mnemonic: 'bottom drive obey lake curtain smoke basket hold race lonely fit walk'
    },
    {
      name: 'Bob',
      address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
      mnemonic: 'serious canyon grape candy bright vast battle soft anchor abandon arrange brain'
    }
  ]
};