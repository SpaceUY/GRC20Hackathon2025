import mongoose from 'mongoose';
import { env } from '../config';
import { publish } from '../grc20/GRC20Service';

export async function fromDBToGRC20(model: mongoose.Model<any>, createEntity) {
  const connection = await mongoose.connect(env.mongoURL);
  console.log('Connected to MongoDB:', connection.connection.name);

  const session = await mongoose.startSession();

  const fieldToCheck =
    env.chain === 'mainnet' ? 'mainnetGrc20Id' : 'testnetGrc20Id';

  const documents = await model.find({
    $or: [{ [fieldToCheck]: null }, { [fieldToCheck]: { $exists: false } }]
  });

  try {
    session.startTransaction();
    const tripleOps = (
      await Promise.all(
        documents.map(async (document) => {
          const { entityId, operations } = createEntity(document);

          if (env.chain === 'mainnet') {
            document.mainnetGrc20Id = entityId;
          } else {
            document.testnetGrc20Id = entityId;
          }

          await document.save({ session });

          return operations;
        })
      )
    ).flat();

    await publish(tripleOps, `Create ${model.name} entities`);

    await session.commitTransaction();
  } catch (error) {
    session.abortTransaction();
    console.error('Error creating papers:', error);
  } finally {
    session.endSession();
  }
}
