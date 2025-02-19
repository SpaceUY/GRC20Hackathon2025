import { Id, SystemIds } from '@graphprotocol/grc-20';
import {
  createRelationOp,
  createTripletOp,
  publish
} from '../grc20/GRC20Service';
import { env } from '../config';
import { academicFieldModel } from '../arxiv/schemas';
import mongoose from 'mongoose';

async function createAcademicField(name: string) {
  if (!env.spaceId) throw new Error('Space ID not set in .env file');

  const nameAttributeID = SystemIds.NAME_ATTRIBUTE;
  const typeAttributeID = SystemIds.TYPES_ATTRIBUTE;
  const academicFieldTypeId = SystemIds.ACADEMIC_FIELD_TYPE;

  const entityId = Id.generate();

  const createAcademyFieldOp = await createTripletOp(
    name,
    nameAttributeID,
    entityId
  );

  const addAcademicFieldTypeOp = await createRelationOp(
    entityId,
    academicFieldTypeId,
    typeAttributeID
  );

  await publish(
    [createAcademyFieldOp, addAcademicFieldTypeOp],
    `Create ${name} entity with type academic field`
  );

  return entityId;
}

const existingAcademicFields = {
  'Computer Science': 'Mvc9y2pNs8YhKGqYK3roHz'
};

async function main() {
  const connection = await mongoose.connect(env.mongoURL);
  console.log('Connected to MongoDB:', connection.connection.name);

  const academicFieldDocuments = await academicFieldModel.find();

  for (const academicField of academicFieldDocuments) {
    if (!academicField.name) continue;
    if (env.chain === 'testnet' && academicField.testnetGrc20Id) continue;
    if (env.chain === 'mainnet' && academicField.mainnetGrc20Id) continue;
    if (academicField.name === 'Other') continue;

    if (existingAcademicFields[academicField.name]) {
      if (env.chain === 'testnet') {
        academicField.testnetGrc20Id =
          existingAcademicFields[academicField.name];
      } else if (env.chain === 'mainnet') {
        academicField.mainnetGrc20Id =
          existingAcademicFields[academicField.name];
      }

      await academicField.save();
      continue;
    }

    const entityId = await createAcademicField(academicField.name);

    if (env.chain === 'testnet') {
      academicField.testnetGrc20Id = entityId;
    } else if (env.chain === 'mainnet') {
      academicField.mainnetGrc20Id = entityId;
    }

    await academicField.save();
  }
}

main();
