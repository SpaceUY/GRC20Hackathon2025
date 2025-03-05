import { getSmartAccountWalletClient } from '@graphprotocol/grc-20';
import { env } from '../config';

// IMPORTANT: Be careful with your private key. Don't commit it to version control.
// You can get your private key using https://www.geobrowser.io/export-wallet
const privateKey = `0x${env.wallet.privateKey[env.chain]}` as `0x${string}`;
const rpcUrl = env.rpcURL[env.chain];

export const walletClient = await getSmartAccountWalletClient({
  privateKey,
  rpcUrl
});
