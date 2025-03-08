import { getSmartAccountWalletClient } from '@graphprotocol/grc-20';
import { privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, http } from 'viem';
import { env, chains } from '../config';

// IMPORTANT: Be careful with your private key. Don't commit it to version control.
// You can get your private key using https://www.geobrowser.io/export-wallet
// const privateKey = `0x${env.wallet.privateKey[env.chain]}` as `0x${string}`;

const privateKey =
  env.chain === 'mainnet'
    ? env.wallet.privateKey.mainnet
    : env.wallet.privateKey.testnet;

const rpcUrl =
  env.chain === 'mainnet' ? env.rpcURL.mainnet : env.rpcURL.testnet;

const account = privateKeyToAccount(`0x${privateKey.replace('0x', '')}`);

export const wallet = createWalletClient({
  account: account,
  chain: env.chain === 'mainnet' ? chains.MAINNET : chains.TESTNET,
  transport: http(rpcUrl, { batch: true })
});

export const smartWallet = getSmartAccountWalletClient({
  privateKey: `0x${privateKey}`
});
