import mongoose from 'mongoose';
import { Id, SystemIds, type Op } from '@graphprotocol/grc-20';
import { env } from '../config';
import { paperModel } from '../arxiv/schemas';
import {
  createRelationOp,
  createTripletOp,
  publish
} from '../grc20/GRC20Service';
import { fromDBToGRC20 } from './createBase';

function createPaper(paper) {
  if (!env.spaceId) throw new Error('Space ID not set in .env file');

  const operations: Op[] = [];

  const entityId = Id.generate();

  operations.push(
    // Assign name to entity
    createTripletOp(paper.name, SystemIds.NAME_ATTRIBUTE, entityId)
  );

  operations.push(
    // Assign description to entity
    createTripletOp(paper.abstract, SystemIds.DESCRIPTION_ATTRIBUTE, entityId)
  );

  operations.push(
    // Add paper type relation
    createRelationOp(
      entityId,
      'MHRJ4V8Vy4ka9GfX915owL', // Paper type ID
      SystemIds.TYPES_ATTRIBUTE
    )
  );

  operations.push(
    // Add publish in relation
    createRelationOp(
      entityId,
      '6Q6Q6Q6Q6Q6Q6Q6Q6Q6Q6Q', //TODO: Add real Arxiv project ID
      '61dgWvCDk8QRW2yrfkHuia' // Published in attribute ID
    )
  );

  operations.push(
    // Add authors
    ...paper.authors
      .map(({ mainnetGrc20Id, testnetGrc20Id }) => {
        const authorId =
          env.chain === 'mainnet' ? mainnetGrc20Id : testnetGrc20Id;
        if (!authorId) return;
        return createRelationOp(
          entityId,
          env.chain === 'mainnet' ? mainnetGrc20Id : testnetGrc20Id,
          'JzFpgguvcCaKhbQYPHsrNT' // Authors attribute ID
        );
      })
      .filter(Boolean)
  );

  // TODO: How do I add the relation to the academic fields?

  return {
    entityId,
    operations
  };
}

async function main() {
  await fromDBToGRC20(paperModel, createPaper);
}

main();
