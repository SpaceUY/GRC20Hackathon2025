import {
  ID,
  Relation,
  Triple,
  IPFS,
  getChecksumAddress,
  type ValueType,
  type Op
} from '@graphprotocol/grc-20';
import chalk from 'chalk';
import { wallet } from './wallet';

const GRC20_API_URL = 'https://api-testnet.grc-20.thegraph.com';

export async function createTripletOp(
  value: string,
  attributeId: string,
  type: ValueType = 'TEXT'
) {
  const newEntityId = ID.generate();

  return Triple.make({
    attributeId,
    entityId: newEntityId,
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

export async function publishToIPFS(
  operations: [Op],
  opName: string = 'new edit'
) {
  const hash = await IPFS.publishEdit({
    name: opName,
    author: wallet.account.address,
    ops: operations
  });

  console.log(`Published ${opName} to IPFS with hash ${chalk.green(hash)}`);

  return hash;
}

export async function publishToGeo(
  spaceId: string,
  cid: string,
  network: 'TESTNET' | 'MAINNET' = 'TESTNET'
) {
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

  console.log('Publish txResult', txResult);

  return txResult;
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
