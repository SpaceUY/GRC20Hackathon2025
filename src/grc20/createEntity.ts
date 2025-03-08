import { Id, SystemIds, type Op } from '@graphprotocol/grc-20';
import { createRelationOp, createTripletOp } from '../grc20/GRC20Service';
import { env } from '../config';

if (!env.spaceId) throw new Error('Space ID not set in .env file');

export type NewEntity = {
  entityId: string;
  operations: Op[];
};

export function createTag(tag): NewEntity {
  if (!env.spaceId) throw new Error('Space ID not set in .env file');

  const operations: Op[] = [];

  const entityId = tag.mainnetGrc20Id || tag.testnetGrc20Id || Id.generate();

  operations.push(
    // Assign name to entity
    createTripletOp(tag.name, SystemIds.NAME_ATTRIBUTE, entityId)
  );

  operations.push(
    // Add tag type relation
    createRelationOp(
      entityId,
      'UnP1LtXV3EhrhvRADFcMZK', // Tag property ID
      SystemIds.TYPES_ATTRIBUTE
    )
  );

  return { entityId, operations };
}

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
      env.chain === 'mainnet'
        ? 'AU2SsFo229T757y2V1JzJ3'
        : 'UG39GhyzSv91SiXSJYLCPV', // arXiv project ID
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

  paper.categories.forEach((academicField) => {
    const academicFieldId =
      env.chain === 'mainnet'
        ? academicField.mainnetGrc20Id
        : academicField.testnetGrc20Id;

    if (!academicFieldId) {
      throw new Error(`AcademicField ${academicField.name} not found in GRC20`);
    }

    operations.push(
      // Add academic field
      createRelationOp(
        entityId,
        academicFieldId,
        env.chain === 'mainnet'
          ? '6xrjWUAjKEc5UFtk3onDpx'
          : '9bCuX6B9KZDSaY8xtghNZo' // Academic fields property ID. (using topics in testnet)
      )
    );

    if (env.chain === 'mainnet' && academicField.mainnetSpaceId) {
      operations.push(
        // Add relate space
        createRelationOp(
          entityId,
          academicField.mainnetGrc20Id,
          'CHwmK8bk4KMCqBNiV2waL9' // Relates spaces property ID
        )
      );
    }
  });

  paper.tags.forEach((tag) => {
    const tagId =
      env.chain === 'mainnet' ? tag.mainnetGrc20Id : tag.testnetGrc20Id;

    if (!tagId) {
      throw new Error(`Tag ${tag.name} not found in GRC20`);
    }

    operations.push(
      // Add tag
      createRelationOp(
        entityId,
        tagId,
        '5d9VVey3wusmk98Uv3v5LM' // Tags property ID
      )
    );
  });

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
    // Add source link
    createTripletOp(
      paper.sourceLink,
      '93stf6cgYvBsdPruRzq1KK', // Web URL property
      entityId,
      'URL'
    )
  );

  operations.push(
    // Add download link
    createTripletOp(
      paper.downloadLink,
      env.chain === 'mainnet'
        ? 'VF98P6w3kt2XJMWp7Ky54S'
        : 'GDAurTnB8YPL6UA5nfHpLb', // Download URL property
      entityId,
      'URL'
    )
  );

  return {
    entityId,
    operations
  };
}
