import { paperModel } from '../arxiv/schemas';
import { fromDBToGRC20 } from './createBase';
import { createPaper } from '../grc20/createEntity';

async function main() {
  fromDBToGRC20({
    model: paperModel,
    createEntity: createPaper,
    limit: 1,
    populate: ['authors', 'categories']
  });
}

main();
