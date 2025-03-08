import mongoose, { Document } from 'mongoose';
import type { Op } from '@graphprotocol/grc-20';
import { env } from '../config';
import { publish } from '../grc20/GRC20Service';
import type { NewEntity } from '../grc20/createEntity';
import chalk from 'chalk';

export async function fromDBToGRC20({
  model,
  createEntity,
  limit,
  populate,
  searchQuery,
  spaceId
}: {
  model: mongoose.Model<any>;
  createEntity: (doc) => NewEntity;
  limit?: number;
  populate?: string[];
  searchQuery?: any;
  spaceId?: string;
}) {
  const connection = await mongoose.connect(env.mongoURL);
  console.log('Connected to MongoDB:', connection.connection.name);

  const fieldToCheck =
    env.chain === 'mainnet' ? 'mainnetGrc20Id' : 'testnetGrc20Id';

  let query = model.find({
    ...searchQuery,
    $or: [{ [fieldToCheck]: null }, { [fieldToCheck]: { $exists: false } }]
  });

  if (populate !== undefined) query = query.populate(populate);

  if (limit !== undefined) {
    query = query.limit(limit);
  }

  const documents = await query;

  console.log(
    `${chalk.green(`Creating ${documents.length} ${model.modelName} entities`)}`
  );

  try {
    const documentUpdates: Document[] = [];
    const tripleOps: Op[] = [];

    documents.forEach((document) => {
      const { entityId, operations } = createEntity(document);

      if (env.chain === 'mainnet') {
        document.mainnetGrc20Id = entityId;
      } else {
        document.testnetGrc20Id = entityId;
      }

      documentUpdates.push(document);
      tripleOps.push(...operations);

      console.log(
        chalk.green(`Created new ${model.modelName} entity: ${document.name}`)
      );
    });

    if (tripleOps.length === 0) {
      console.log('No new entities to create');
    } else {
      await publish({
        ops: tripleOps,
        opName: `Create ${model.modelName} entities`,
        spaceId
      });

      // We want to save the documents after the operations are published
      await Promise.all(documentUpdates.map((document) => document.save()));
    }
    process.exit(0);
  } catch (error) {
    console.error('Error creating papers:', error);
    process.exit(1);
  }
}
