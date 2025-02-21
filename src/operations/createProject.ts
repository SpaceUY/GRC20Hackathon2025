import { Id, SystemIds, type Op } from '@graphprotocol/grc-20';
import {
  createRelationOp,
  createTripletOp,
  publish
} from '../grc20/GRC20Service';

function createProject() {
  const operations: Op[] = [];

  const entityId = 'UG39GhyzSv91SiXSJYLCPV';

  operations.push(
    // Assign name to entity
    createTripletOp('arXiv', SystemIds.NAME_ATTRIBUTE, entityId)
  );

  operations.push(
    // Add project type relation
    createRelationOp(
      entityId,
      SystemIds.PROJECT_TYPE,
      SystemIds.TYPES_ATTRIBUTE
    )
  );

  operations.push(
    // Assign description to entity
    createTripletOp(
      'arXiv is a free distribution service and an open-access archive for nearly 2.4 million scholarly articles in the fields of physics, mathematics, computer science, quantitative biology, quantitative finance, statistics, electrical engineering and systems science, and economics. Materials on this site are not peer-reviewed by arXiv.',
      SystemIds.DESCRIPTION_ATTRIBUTE,
      entityId
    )
  );

  operations.push(
    // Add website to entity
    createTripletOp(
      'https://arxiv.org/',
      'WVVjk5okbvLspwdY1iTmwp',
      entityId,
      'URL'
    )
  );

  return operations;
}

async function main() {
  const operations = createProject();
  await publish(operations, 'Create arXiv project entity');
}

main();
