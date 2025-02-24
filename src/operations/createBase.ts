import mongoose, { Document } from 'mongoose';
import { env } from '../config';
import { publish, searchQuery } from '../grc20/GRC20Service';
import type { Op } from '@graphprotocol/grc-20';

export async function fromDBToGRC20(
  model: mongoose.Model<any>,
  createEntity: (doc) => { entityId: string; operations: Op[] },
  limit?: number
) {
  const connection = await mongoose.connect(env.mongoURL);
  console.log('Connected to MongoDB:', connection.connection.name);

  const fieldToCheck =
    env.chain === 'mainnet' ? 'mainnetGrc20Id' : 'testnetGrc20Id';

  let query = model.find({
    $or: [{ [fieldToCheck]: null }, { [fieldToCheck]: { $exists: false } }]
  });

  if (limit !== undefined) {
    query = query.limit(limit);
  }

  const documents = await query;

  console.log(`Creating ${documents.length} ${model.modelName} entities`);

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
    });

    if (tripleOps.length === 0) {
      console.log('No new entities to create');
    } else {
      await publish(tripleOps, `Create ${model.modelName} entities`);

      // We want to save the documents after the operations are published
      await Promise.all(documentUpdates.map((document) => document.save()));
    }
    process.exit(0);
  } catch (error) {
    console.error('Error creating papers:', error);
    process.exit(1);
  }
}
