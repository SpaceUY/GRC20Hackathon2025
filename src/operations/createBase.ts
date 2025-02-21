import mongoose from 'mongoose';
import { env } from '../config';
import { publish } from '../grc20/GRC20Service';

export async function fromDBToGRC20(model: mongoose.Model<any>, createEntity) {
  const connection = await mongoose.connect(env.mongoURL);
  console.log('Connected to MongoDB:', connection.connection.name);

  const fieldToCheck =
    env.chain === 'mainnet' ? 'mainnetGrc20Id' : 'testnetGrc20Id';

  const documents = await model.find({
    $or: [{ [fieldToCheck]: null }, { [fieldToCheck]: { $exists: false } }]
  });

  console.log(`Creating ${documents.length} ${model.modelName} entities`);

  try {
    const tripleOps = (
      await Promise.all(
        documents.map(async (document) => {
          const { entityId, operations } = createEntity(document);

          if (env.chain === 'mainnet') {
            document.mainnetGrc20Id = entityId;
          } else {
            document.testnetGrc20Id = entityId;
          }

          await document.save();

          return operations;
        })
      )
    ).flat();

    await publish(tripleOps, `Create ${model.modelName} entities`);
  } catch (error) {
    console.error('Error creating papers:', error);
  }
}
