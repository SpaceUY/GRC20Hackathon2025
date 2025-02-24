import { Id, SystemIds, type Op } from '@graphprotocol/grc-20';
import { env } from '../config';
import { paperModel } from '../arxiv/schemas';
import {
  createRelationOp,
  createTripletOp,
  publish
} from '../grc20/GRC20Service';
import mongoose from 'mongoose';
import { createPerson } from './createPersons';
import { createAcademicField } from './createAcademicFields';

function createPaper(paper): {
  entityId: string;
  operations: Op[];
} {
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
      '61dgWvCDk8QRW2yrfkHuia', // Published in attribute ID
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

async function main() {
  const connection = await mongoose.connect(env.mongoURL);
  console.log('Connected to MongoDB:', connection.connection.name);

  const fieldToCheck =
    env.chain === 'mainnet' ? 'mainnetGrc20Id' : 'testnetGrc20Id';

  const paperDocuments = await paperModel
    .find({
      $or: [{ [fieldToCheck]: null }, { [fieldToCheck]: { $exists: false } }]
    })
    .populate('authors')
    .populate('categories')
    .limit(1);

  console.log(`Creating ${paperDocuments.length} papers`);

  const tripleOps: Op[] = [];
  const documentUpdates: any[] = [];

  paperDocuments.forEach((paper) => {
    const { entityId, operations } = createPaper(paper);
    paper[fieldToCheck] = entityId;
    documentUpdates.push(paper);
    tripleOps.push(...operations);
  });

  if (tripleOps.length === 0) {
    console.log('No new papers to create');
  } else {
    await publish(tripleOps, 'Create papers');
    await Promise.all(
      documentUpdates.map((document) =>
        document.save({ validateBeforeSave: false })
      )
    );
  }
}

main();
