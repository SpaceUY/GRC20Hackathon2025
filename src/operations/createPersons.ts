import { personModel } from '../arxiv/schemas';
import { fromDBToGRC20 } from './createBase';
import { createPerson } from '../grc20/createEntity';

async function main() {
  await fromDBToGRC20({
    model: personModel,
    createEntity: createPerson
  });
}

main();
