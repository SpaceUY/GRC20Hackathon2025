import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const ConfigSchema = z.object({
  MONGOBD_URL: z.string(),
  TESTNET_RPC_URL: z.string(),
  MAINNET_RPC_URL: z.string(),
  WALLET_PRIVATE_KEY: z.string(),
  SPACE_ID: z.string().optional(),
  CHAIN: z.enum(['testnet', 'mainnet']).default('testnet')
});

const data = ConfigSchema.parse(process.env);

export default {
  mongoURL: data.MONGOBD_URL,
  rpcURL: {
    testnet: data.TESTNET_RPC_URL,
    mainnet: data.MAINNET_RPC_URL
  },
  wallet: {
    privateKey: data.WALLET_PRIVATE_KEY
  },
  spaceId: data.SPACE_ID,
  chain: data.CHAIN
};
