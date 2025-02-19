import { Id, SystemIds } from '@graphprotocol/grc-20';
import {
  createRelationOp,
  createTripletOp,
  publishToGeo,
  publishToIPFS
} from '../grc20/GRC20Service';
import { env } from '../config';

async function createAcademicField(name: string) {
  if (!env.spaceId) throw new Error('Space ID not set in .env file');

  const nameAttributeID = SystemIds.NAME_ATTRIBUTE;
  const typeAttributeID = SystemIds.TYPES_ATTRIBUTE;
  const academicFieldTypeId = SystemIds.ACADEMIC_FIELD_TYPE;

  const entityId = Id.generate();

  const createAcademyFieldOp = await createTripletOp(
    'Economics',
    nameAttributeID,
    entityId
  );

  const addAcademicFieldTypeOp = await createRelationOp(
    entityId,
    academicFieldTypeId,
    typeAttributeID
  );

  const hash = await publishToIPFS(
    [createAcademyFieldOp, addAcademicFieldTypeOp],
    `Create ${name} entity with type academic field`
  );

  await publishToGeo(env.spaceId, hash);
}

async function main() {
  await createAcademicField('Economics');
  await createAcademicField('Finances');
}

main();
