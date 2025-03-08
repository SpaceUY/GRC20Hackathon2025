import { tagModel } from '../arxiv/schemas';
import { fromDBToGRC20 } from './createBase';
import { createTag } from '../grc20/createEntity';

async function main() {
  await fromDBToGRC20({
    model: tagModel,
    createEntity: createTag
  });
}

main();
