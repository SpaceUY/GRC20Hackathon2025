import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { env, chains } from './config';

const account = privateKeyToAccount(env.wallet.privateKey as `0x${string}`);

export const wallet = createWalletClient({
  account: account,
  chain: chains.TESTNET,
  transport: http(env.rpcURL.testnet, { batch: true })
});
