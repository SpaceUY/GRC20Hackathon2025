import {
  Id,
  Relation,
  Triple,
  Ipfs,
  getChecksumAddress,
  type ValueType,
  type Op
} from '@graphprotocol/grc-20';
import chalk from 'chalk';
import { wallet } from './wallet';
import { env } from '../config';

const GRC20_API_URL = 'https://api-testnet.grc-20.thegraph.com';

export async function createTripletOp(
  value: string,
  attributeId: string,
  entityId: string = Id.generate(),
  type: ValueType = 'TEXT'
) {
  return Triple.make({
    attributeId,
    entityId,
    value: {
      type,
      value
    }
  });
}

export async function createRelationOp(
  fromId: string,
  toId: string,
  relationTypeId: string
) {
  return Relation.make({
    fromId,
    toId,
    relationTypeId
  });
}

export async function removeEntity(entityId: string, attributeId: string) {
  return Triple.remove({
    entityId,
    attributeId
  });
}

export async function removeRelation(relationId: string) {
  return Relation.remove(relationId);
}

async function publishToIPFS(operations: Op[], opName: string = 'new edit') {
  const hash = await Ipfs.publishEdit({
    name: opName,
    author: wallet.account.address,
    ops: operations
  });

  console.log(`Published ${opName} to IPFS with hash ${chalk.green(hash)}`);

  return hash;
}

async function publishToGeo(
  cid: string,
  network: 'TESTNET' | 'MAINNET' = 'TESTNET'
) {
  const spaceId = env.spaceId;
  if (!spaceId) throw new Error('Space ID not set in .env file');

  const result = await fetch(
    `${GRC20_API_URL}/space/${spaceId}/edit/calldata`,
    {
      method: 'POST',
      body: JSON.stringify({
        cid,
        network
      })
    }
  );

  const { to, data } = await result.json();

  const txResult = await wallet.sendTransaction({
    to,
    value: 0n,
    data
  });

  console.log(
    `Published to Geo with transaction hash ${chalk.green(txResult)}`
  );

  return txResult;
}

export async function publish(ops: Op[], opName: string) {
  const hash = await publishToIPFS(ops, opName);
  await publishToGeo(hash);
}

export async function createSpace(name: string) {
  const result = await fetch(`${GRC20_API_URL}/deploy`, {
    method: 'POST',
    body: JSON.stringify({
      initialEditorAddress: getChecksumAddress(wallet.account.address),
      spaceName: name
    })
  });

  const { spaceId } = await result.json();
  console.log(
    `New Space ${chalk.green(name)} created with ID: ${chalk.green(spaceId)}`
  );

  return spaceId;
}
