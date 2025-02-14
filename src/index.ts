import { saveEconAndFinancePapers } from './queryArxiv';
import { readArxivFiles } from './arxivToMongo';

const main = async () => {
  // 1- We get all the papers metadata from ArXiv
  // await saveEconAndFinancePapers();

  // 2- We store the papers metadata in the database
  await readArxivFiles();
};

main();
