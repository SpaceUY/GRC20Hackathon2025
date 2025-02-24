import { academicFieldModel } from '../arxiv/schemas';
import { createAcademicField } from '../grc20/createEntity';
import { fromDBToGRC20 } from './createBase';

async function main() {
  await fromDBToGRC20({
    model: academicFieldModel,
    createEntity: createAcademicField
  });
}

main();
