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

const OPERATIONS_LIMIT = 18000;

export function createTripletOp(
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

export function createRelationOp(
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
  if (ops.length === 0) throw new Error('No operations to publish');

  const groups: Op[][] = [];
  for (let i = 0; i < ops.length; i += OPERATIONS_LIMIT) {
    groups.push(ops.slice(i, i + OPERATIONS_LIMIT));
  }

  for (let i = 0; i < groups.length; i++) {
    const groupName = `${opName}. (${i + 1}/${groups.length})`;
    console.log(`Publishing ${chalk.green(groupName)}...`);

    let tries = 0;
    const maxTries = 3;
    while (tries < maxTries) {
      try {
        const hash = await publishToIPFS(groups[i], groupName);
        await publishToGeo(hash);
        break;
      } catch (error) {
        tries++;
        if (tries === maxTries) {
          console.error(
            `Error publishing to Geo after ${maxTries} attempts ${error}`
          );
        } else {
          console.warn(`Attempt ${tries} failed, retrying...`);
        }
      }
    }
  }
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
