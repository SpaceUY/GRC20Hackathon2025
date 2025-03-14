import {
  Id,
  Relation,
  Triple,
  Ipfs,
  getChecksumAddress,
  type ValueType,
  type Op,
  Graph
} from '@graphprotocol/grc-20';
import chalk from 'chalk';
import { smartWallet, wallet } from './wallet';
import { env } from '../config';

const GRC20_API_URL = 'https://api-testnet.grc-20.thegraph.com';

const OPERATIONS_LIMIT = 2500;

export async function createImage(imageUrl: string) {
  return Graph.createImage({
    url: imageUrl
  });
}

export async function searchQuery(query: string) {
  const words = query.split(/\s+/).filter((word) => word.length > 0);
  const queryString = words
    .map((word) => `q=${encodeURIComponent(word)}`)
    .join('&');
  const response = await fetch(`${GRC20_API_URL}/search?${queryString}`);
  const data = await response.json();

  return data.results;
}

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
  relationTypeId: string,
  relationId?: string
) {
  return Relation.make({
    fromId,
    toId,
    relationTypeId,
    relationId
  });
}

export async function removeEntity(entityId: string, attributeId: string) {
  return Triple.remove({
    entityId,
    attributeId
  });
}

export function removeRelation(relationId: string) {
  return Relation.remove(relationId);
}

async function publishToIPFS(operations: Op[], opName: string = 'new edit') {
  const author =
    env.chain === 'mainnet'
      ? (await smartWallet).account.address
      : wallet.account.address;
  const hash = await Ipfs.publishEdit({
    name: opName,
    author,
    ops: operations
  });

  console.log(
    `Published ${chalk.green(opName)} to IPFS with hash ${chalk.green(hash)}`
  );

  return hash;
}

async function publishToGeo({
  cid,
  network = env.chain === 'mainnet' ? 'MAINNET' : 'TESTNET',
  opName = 'new edit',
  spaceId = env.chain === 'mainnet' ? env.spaceId.mainnet : env.spaceId.testnet
}: {
  cid: string;
  network?: 'TESTNET' | 'MAINNET';
  opName?: string;
  spaceId?: string;
}) {
  if (!spaceId)
    throw new Error(
      'Missing space ID, set SPACE_ID in .env file or parse it as an argument'
    );

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

  let txResult;
  if (env.chain === 'mainnet') {
    txResult = await (
      await smartWallet
    ).sendTransaction({
      to,
      value: 0n,
      data
    });
  } else {
    txResult = await wallet.sendTransaction({
      to,
      value: 0n,
      data
    });
  }

  console.log(
    `Published ${chalk.green(opName)} to Geo with transaction hash ${chalk.green(txResult)}`
  );

  return txResult;
}

export async function publish({
  ops,
  opName,
  spaceId = env.chain === 'mainnet' ? env.spaceId.mainnet : env.spaceId.testnet
}: {
  ops: Op[];
  opName: string;
  spaceId?: string;
}) {
  if (!spaceId)
    throw new Error(
      'Missing space ID, set SPACE_ID in .env file or parse it as an argument'
    );

  if (ops.length === 0) throw new Error('No operations to publish');

  const groups: Op[][] = [];
  for (let i = 0; i < ops.length; i += OPERATIONS_LIMIT) {
    groups.push(ops.slice(i, i + OPERATIONS_LIMIT));
  }

  for (let i = 0; i < groups.length; i++) {
    const groupName = `${opName}.${groups.length > 1 ? ` (${i + 1}/${groups.length})` : ''}`;
    console.log(`Publishing ${chalk.green(groupName)}...`);

    let tries = 0;
    const maxTries = 3;
    while (tries < maxTries) {
      try {
        const hash = await publishToIPFS(groups[i], groupName);
        await publishToGeo({
          cid: hash,
          opName: groupName,
          spaceId
        });
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
      initialEditorAddress: getChecksumAddress((await wallet).account.address),
      spaceName: name
    })
  });

  const { spaceId } = await result.json();
  console.log(
    `New Space ${chalk.green(name)} created with ID: ${chalk.green(spaceId)}`
  );

  return spaceId;
}
