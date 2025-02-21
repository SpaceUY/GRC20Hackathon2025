import mongoose from 'mongoose';
import { Id, SystemIds, type Op } from '@graphprotocol/grc-20';
import {
  createRelationOp,
  createTripletOp,
  publish
} from '../grc20/GRC20Service';
import { env } from '../config';
import { academicFieldModel } from '../arxiv/schemas';
import { fromDBToGRC20 } from './createBase';

async function createAcademicField(name: string) {
  if (!env.spaceId) throw new Error('Space ID not set in .env file');

  const operations: Op[] = [];

  const entityId = Id.generate();

  operations.push(
    // Assign name to entity
    createTripletOp(name, SystemIds.NAME_ATTRIBUTE, entityId)
  );

  operations.push(
    // Add academic field type relation
    createRelationOp(
      entityId,
      SystemIds.ACADEMIC_FIELD_TYPE,
      SystemIds.TYPES_ATTRIBUTE
    )
  );

  return { entityId, operations };
}

async function main() {
  await fromDBToGRC20(academicFieldModel, createAcademicField);
}

main();
