import { saveEconAndFinancePapers } from './arxiv/queryArxiv';
import { readArxivFilesAndSaveToDB } from './arxiv/arxivToMongo';
import { createSpace } from './grc20/GRC20Service';
import { env } from './config';
import { fromDBToGRC20 } from './operations/createBase';
import {
  academicFieldModel,
  paperModel,
  personModel,
  tagModel
} from './arxiv/schemas';
import {
  createAcademicField,
  createPaper,
  createPerson,
  createTag
} from './grc20/createEntity';

const personalSpaceId = env.spaceId;
const economicsSpaceId = 'RKitsfRCkb2dUnFxKTD5id';
const financeSpaceId = '4cxfKQZNUTd2ubhmaiZxP9';

const main = async () => {
  // 1- We get all the papers metadata from ArXiv
  // and download it to the local folder

  await saveEconAndFinancePapers();

  // 2- We store the papers metadata in the database

  await readArxivFilesAndSaveToDB();

  // 3- You need a space to deploy the information
  // if you have it already created or know the space you are
  // going to use, set it up in the .env file. If the spaceId
  // is not set, it will create a new space. Replace the name for
  // the one you want.

  // 4- Create entities in the GRC-20
  // Entities should be created from the ones with no relations
  // to the ones with relations to them. Since you need to have
  // the entities created before creating the relations.

  // Tags
  await fromDBToGRC20({
    model: tagModel,
    createEntity: createTag,
    searchQuery: {
      name: {
        $in: ['Economics', 'General economics', 'Physics and society']
      }
    }
  });

  // Academic fields
  await fromDBToGRC20({
    model: academicFieldModel,
    createEntity: createAcademicField
  });

  // Persons
  await fromDBToGRC20({
    model: personModel,
    createEntity: createPerson,
    searchQuery: {
      name: {
        $in: ['Fernando DePaolis', 'M. Clara DePaolis Kaluza', 'Phil Murphy']
      }
    }
  });

  // Papers
  await fromDBToGRC20({
    model: paperModel,
    createEntity: createPaper,
    limit: 1,
    populate: ['authors', 'categories', 'tags'],
    searchQuery: { arxivId: 'http://arxiv.org/abs/2005.11285v2' },
    spaceId: economicsSpaceId
  });

  process.exit(0);
};

main();
