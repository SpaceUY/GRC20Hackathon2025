import { Id, SystemIds, type Op } from '@graphprotocol/grc-20';
import { createRelationOp, createTripletOp } from '../grc20/GRC20Service';
import { env } from '../config';
import { personModel } from '../arxiv/schemas';
import { fromDBToGRC20 } from './createBase';

export function createPerson(person): {
  entityId: string;
  operations: Op[];
} {
  if (!env.spaceId) throw new Error('Space ID not set in .env file');

  const operations: Op[] = [];

  const entityId =
    person.mainnetGrc20Id || person.testnetGrc20Id || Id.generate();

  operations.push(
    // Assign name to entity
    createTripletOp(person.name, SystemIds.NAME_ATTRIBUTE, entityId)
  );

  operations.push(
    // Add person type relation
    createRelationOp(entityId, SystemIds.PERSON_TYPE, SystemIds.TYPES_ATTRIBUTE)
  );

  return {
    entityId,
    operations
  };
}

async function main() {
  await fromDBToGRC20(personModel, createPerson);
}

// main();
