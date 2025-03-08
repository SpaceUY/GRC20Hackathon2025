import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import mongoose from 'mongoose';
import { env } from '../config';
import {
  paperModel,
  personModel,
  academicFieldModel,
  tagModel
} from './schemas';
import { ARXIV_TAXONOMY } from './taxonomy';
import chalk from 'chalk';

const ARXIV_FOLDER = join(__dirname, '../../downloads/arxiv');

interface ArxivPaper {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  categories: string[];
  published: string;
  updated: string;
  pdfLink: string;
  arxivLink: string;
}

async function dataToDB(data: ArxivPaper) {
  const existingPaper = await paperModel.findOne({ arxivId: data.id });
  if (existingPaper && existingPaper.tags.length > 0) {
    // console.log(`Paper ${data.title} already exists in the database`);
    return;
  }

  const authors = await Promise.all(
    data.authors.map(async (author: any) => {
      const person = await personModel.findOne({ name: author });

      if (!person) {
        const newPerson = await personModel.create({ name: author });
        console.log(`Created new person: ${author}`);
        return newPerson;
      }

      return person;
    })
  );

  const categories = await Promise.all(
    data.categories.map(async (category: any) => {
      const taxonomy = ARXIV_TAXONOMY[category] || { academicField: 'Other' };

      const { academicField } = taxonomy;

      let academicFieldObj;

      // Create academic field
      academicFieldObj = await academicFieldModel.findOneAndUpdate(
        {
          name: academicField
        },
        {
          name: academicField
        },
        {
          upsert: true,
          new: true
        }
      );

      if (academicFieldObj.isNew)
        console.log(
          chalk.green(`Created new academic field: ${academicFieldObj.name}`)
        );

      return academicFieldObj;
    })
  );

  const tags = await Promise.all(
    data.categories.map(async (category: any) => {
      const { tag } = ARXIV_TAXONOMY[category] || { tag: 'Other' };

      const tagObj = await tagModel.findOneAndUpdate(
        { name: tag },
        { name: tag },
        { upsert: true, new: true }
      );

      if (tagObj.isNew)
        console.log(chalk.green(`Created new tag: ${tagObj.name}`));

      return tagObj;
    })
  );

  const paper = await paperModel.findOneAndUpdate(
    { arxivId: data.id },
    {
      name: data.title,
      abstract: data.abstract,
      authors: authors.map((author) => author?._id),
      categories: categories.map((category) => category?._id),
      tags: tags.map((tag) => tag?._id),
      publishDate: new Date(data.published),
      updateDate: new Date(data.updated),
      downloadLink: data.pdfLink,
      sourceLink: data.arxivLink,
      arxivId: data.id
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  );

  const action = paper.isNew ? 'Created new' : 'Updated';
  console.log(chalk.green(`${action} paper: ${paper.name}`));
}

export async function readArxivFilesAndSaveToDB() {
  let connection;
  try {
    connection = await mongoose.connect(env.mongoURL);
    console.log('Connected to MongoDB:', connection.connection.name);

    const files = await readdir(ARXIV_FOLDER);
    console.log(`Reading ${files.length} arXiv files`);

    for (const file of files) {
      const content = await readFile(join(ARXIV_FOLDER, file));
      const data = JSON.parse(content.toString());

      await Promise.all(
        data.map(async (paper: ArxivPaper) => {
          await dataToDB(paper);
        })
      ).catch((error) => {
        console.error(
          'Error saving papers to database:',
          error instanceof Error ? error.message : error
        );
      });
    }
  } catch (error) {
    console.error(
      'Error reading arXiv files:',
      error instanceof Error ? error.message : error
    );
  } finally {
    if (connection) {
      await connection.disconnect();
      console.log('Disconnected from MongoDB');
    }
  }
}
