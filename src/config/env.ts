import { z } from 'zod';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const ConfigSchema = z.object({
  MONGOBD_URL: z.string(),
  TESTNET_RPC_URL: z.string(),
  MAINNET_RPC_URL: z.string(),
  WALLET_PRIVATE_KEY_TESTNET: z.string(),
  WALLET_PRIVATE_KEY_MAINNET: z.string(),
  TESTNET_PERSONAL_SPACE_ID: z.string().optional(),
  MAINNET_PERSONAL_SPACE_ID: z.string().optional(),
  CHAIN: z.enum(['testnet', 'mainnet']).default('testnet')
});

const data = ConfigSchema.parse(process.env);

console.log(chalk.greenBright('Working on chain:', data.CHAIN));

export default {
  mongoURL: data.MONGOBD_URL,
  rpcURL: {
    testnet: data.TESTNET_RPC_URL,
    mainnet: data.MAINNET_RPC_URL
  },
  wallet: {
    privateKey: {
      testnet: data.WALLET_PRIVATE_KEY_TESTNET,
      mainnet: data.WALLET_PRIVATE_KEY_MAINNET
    }
  },
  spaceId: {
    testnet: data.TESTNET_PERSONAL_SPACE_ID,
    mainnet: data.MAINNET_PERSONAL_SPACE_ID
  },
  chain: data.CHAIN
};
