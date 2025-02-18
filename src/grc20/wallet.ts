import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { env, chains } from '../config';

const account = privateKeyToAccount(
  `0x${env.wallet.privateKey.replace('0x', '')}`
);

export const wallet = createWalletClient({
  account,
  chain: chains.TESTNET,
  transport: http(env.rpcURL.testnet, { batch: true })
});
