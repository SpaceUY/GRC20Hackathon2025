import {
  ID,
  type CreateRelationOp,
  type DeleteRelationOp,
  type DeleteTripleOp,
  Relation,
  type SetTripleOp,
  Triple,
  SYSTEM_IDS,
  IPFS,
  getChecksumAddress,
  CONTENT_IDS,
  type Op
} from '@graphprotocol/grc-20';
import { wallet } from './wallet';

const GRC20_API_URL = 'https://api-testnet.grc-20.thegraph.com';

export async function createTriplet(value: string) {
  const newEntityId = ID.generate();
  const namePropertyId = SYSTEM_IDS.NAME_ATTRIBUTE;

  const tripleOp = Triple.make({
    attributeId: namePropertyId,
    entityId: newEntityId,
    value: {
      type: 'TEXT',
      value
    }
  });

  const hash = await IPFS.publishEdit({
    name: `Create new entity with name ${value}`,
    author: wallet.account.address,
    ops: [tripleOp]
  });
}

export async function publishToIPFS(operations: [Op], opName?: string) {
  const hash = await IPFS.publishEdit({
    name: opName || 'Publish to IPFS',
    author: wallet.account.address,
    ops: operations
  });
}

export async function createRelation(
  fromId: string,
  toId: string,
  relationTypeId: string
) {
  const relationOp = Relation.make({
    fromId,
    toId,
    relationTypeId
  });

  const hash = await IPFS.publishEdit({
    name: `Add relation from ${fromId} to ${toId} with type ${relationTypeId}`,
    author: wallet.account.address,
    ops: [relationOp]
  });

  console.log('Relation created with IPFS hash:', hash);

  return hash;
}

export async function publishData(
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
  console.log('New Space created with ID:', spaceId);

  return spaceId;
}
