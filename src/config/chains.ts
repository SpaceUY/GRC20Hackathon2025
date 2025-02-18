import type { Chain } from 'viem';
import env from './env';

const TESTNET: Chain = {
  id: 19411,
  name: 'Geo Genesis Testnet',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: [env.rpcURL.testnet]
    },
    public: {
      http: [env.rpcURL.testnet]
    }
  }
};

const MAINNET: Chain = {
  id: 80451,
  name: 'Geo Genesis Mainnet',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: [env.rpcURL.mainnet]
    },
    public: {
      http: [env.rpcURL.mainnet]
    }
  }
};

export default {
  TESTNET,
  MAINNET
};
