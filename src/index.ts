import mongoose from 'mongoose';
import config from './config';
import { downloadRePEcData } from './ftpDownload';
import { saveEconPapers } from './queryArxiv';

const main = async () => {
  // const connection = await mongoose.connect(config.mongoURL);
  // 1- We get all the papers metadata from ArXiv
  await saveEconPapers();

  // 2- We store the papers metadata in the database
};

main();
