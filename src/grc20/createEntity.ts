import { Id, SystemIds, type Op } from '@graphprotocol/grc-20';
import { createRelationOp, createTripletOp } from '../grc20/GRC20Service';
import { env } from '../config';

if (!env.spaceId) throw new Error('Space ID not set in .env file');

export type NewEntity = {
  entityId: string;
  operations: Op[];
};

export function createAcademicField(academicField): NewEntity {
  if (!env.spaceId) throw new Error('Space ID not set in .env file');

  const operations: Op[] = [];

  const entityId =
    academicField.mainnetGrc20Id ||
    academicField.testnetGrc20Id ||
    Id.generate();

  operations.push(
    // Assign name to entity
    createTripletOp(academicField.name, SystemIds.NAME_ATTRIBUTE, entityId)
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

export function createPerson(person): NewEntity {
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

export function createPaper(paper): NewEntity {
  if (!env.spaceId) throw new Error('Space ID not set in .env file');

  const operations: Op[] = [];

  const entityId =
    paper.mainnetGrc20Id || paper.testnetGrc20Id || Id.generate();

  operations.push(
    // Assign name to entity
    createTripletOp(paper.name, SystemIds.NAME_ATTRIBUTE, entityId)
  );

  operations.push(
    // Assign abstract to entity
    createTripletOp(
      paper.abstract,
      '92PL1JTfCkuKDT4BLXsFX3', // Abstract property ID
      entityId
    )
  );

  operations.push(
    // Add paper type relation
    createRelationOp(
      entityId,
      'MHRJ4V8Vy4ka9GfX915owL', // Paper type ID
      SystemIds.TYPES_ATTRIBUTE
    )
  );

  const projectRelationId = Id.generate();
  operations.push(
    // Add publish in relation
    createRelationOp(
      entityId,
      'UG39GhyzSv91SiXSJYLCPV', // arXiv project ID
      '61dgWvCDk8QRW2yrfkHuia', // Published in property ID
      projectRelationId
    )
  );

  operations.push(
    // Add authors
    ...paper.authors
      .map((author) => {
        let authorId =
          env.chain === 'mainnet'
            ? author.mainnetGrc20Id
            : author.testnetGrc20Id;
        if (!authorId) {
          throw new Error(`Author ${author.name} not found in GRC20`);
          const newAuthor = createPerson(author);
          authorId = newAuthor.entityId;
          operations.push(...newAuthor.operations);
        }
        return createRelationOp(
          entityId,
          env.chain === 'mainnet'
            ? author.mainnetGrc20Id
            : author.testnetGrc20Id,
          'JzFpgguvcCaKhbQYPHsrNT' // Authors attribute ID
        );
      })
      .filter(Boolean)
  );

  operations.push(
    // Add topics
    ...paper.categories
      .map((category) => {
        let topicId =
          env.chain === 'mainnet'
            ? category.mainnetGrc20Id
            : category.testnetGrc20Id;
        if (!topicId) {
          throw new Error(`AcademyField ${category.name} not found in GRC20`);
          const newCategory = createAcademicField(category);
          topicId = newCategory.entityId;
          operations.push(...newCategory.operations);
        }
        return createRelationOp(
          entityId,
          env.chain === 'mainnet'
            ? category.mainnetGrc20Id
            : category.testnetGrc20Id,
          '9bCuX6B9KZDSaY8xtghNZo' // Topics property ID
        );
      })
      .filter(Boolean)
  );

  operations.push(
    // Add publish date
    createTripletOp(
      paper.publishDate.toISOString(),
      'KPNjGaLx5dKofVhT6Dfw22', // Publish date property ID
      entityId,
      'TIME'
    )
  );

  operations.push(
    // Add download link
    createTripletOp(
      paper.downloadLink,
      '93stf6cgYvBsdPruRzq1KK', // Web URL property ID TODO: using download link here, check if ok
      entityId,
      'URL'
    )
  );

  return {
    entityId,
    operations
  };
}
