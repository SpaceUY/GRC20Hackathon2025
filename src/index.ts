import { saveEconAndFinancePapers } from './arxiv/queryArxiv';
import { readArxivFilesAndSaveToDB } from './arxiv/arxivToMongo';
import { createSpace } from './grc20/GRC20Service';
import { env } from './config';

const main = async () => {
  // 1- We get all the papers metadata from ArXiv
  // and download it to the local folder
  // await saveEconAndFinancePapers();

  // 2- We store the papers metadata in the database
  // await readArxivFilesAndSaveToDB();

  // 3- You need a space to deploy the information
  // if you have it already created or know the space you are
  // going to use, set it up in the .env file. If the spaceId
  // is not set, it will create a new space. Replace the name for
  // the one you want.
  let spaceId = env.spaceId;
  if (!spaceId) {
    spaceId = await createSpace('new test space');
  }

  // 4- Publish the information to the space
};

main();
