import fs from 'fs';
import path from 'path';
import { Graph, SystemIds, type Op } from '@graphprotocol/grc-20';
import {
  createRelationOp,
  createTripletOp,
  publish
} from '../grc20/GRC20Service';

async function createProject() {
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

  // Upload banner image
  const { id: bannerId, ops: createBannerOps } = await Graph.createImage({
    blob: new Blob(
      [fs.readFileSync(path.join(__dirname, '../arxiv/img/arxiv-header.png'))],
      {
        type: 'image/png'
      }
    )
  });

  operations.push(
    // Add banner to entity
    createRelationOp(
      entityId, // arXiv entity ID
      bannerId,
      SystemIds.COVER_PROPERTY
    )
  );

  // Upload avatar image
  const { id: avatarId, ops: createAvatarOps } = await Graph.createImage({
    blob: new Blob(
      [
        fs.readFileSync(
          path.join(__dirname, '../arxiv/img/arxiv-logo-square.png')
        )
      ],
      {
        type: 'image/png'
      }
    )
  });

  operations.push(...createAvatarOps);

  operations.push(
    // Add avatar to entity
    createRelationOp(
      entityId, // arXiv entity ID
      avatarId,
      '399xP4sGWSoepxeEnp3UdR' // avatar property ID
    )
  );

  return operations;
}

async function main() {
  const operations = await createProject();
  await publish(operations, 'Create arXiv project entity');
}

main();
