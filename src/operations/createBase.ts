import mongoose, { Document } from 'mongoose';
import { env } from '../config';
import { publish } from '../grc20/GRC20Service';
import type { Op } from '@graphprotocol/grc-20';

export async function fromDBToGRC20(
  model: mongoose.Model<any>,
  createEntity: (doc) => { entityId: string; operations: Op[] }
) {
  const connection = await mongoose.connect(env.mongoURL);
  console.log('Connected to MongoDB:', connection.connection.name);

  const fieldToCheck =
    env.chain === 'mainnet' ? 'mainnetGrc20Id' : 'testnetGrc20Id';

  const documents = await model.find({
    $or: [{ [fieldToCheck]: null }, { [fieldToCheck]: { $exists: false } }]
  });

  console.log(`Creating ${documents.length} ${model.modelName} entities`);

  try {
    const documentUpdates: Document[] = [];
    const tripleOps: Op[] = documents
      .map((document) => {
        const { entityId, operations } = createEntity(document);

        if (env.chain === 'mainnet') {
          document.mainnetGrc20Id = entityId;
        } else {
          document.testnetGrc20Id = entityId;
        }

        documentUpdates.push(document);

        return operations;
      })
      .flat();

    await publish(tripleOps, `Create ${model.modelName} entities`);

    // We want to save the documents after the operations are published
    await Promise.all(documentUpdates.map((document) => document.save()));
  } catch (error) {
    console.error('Error creating papers:', error);
  }
}
