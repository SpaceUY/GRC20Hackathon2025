import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import mongoose from 'mongoose';
import config from './config';
import { paperModel, personModel, academicFieldModel } from './schemas';

const ARXIV_FOLDER = join(__dirname, '../downloads/arxiv');

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

function getCategory(cat: string): string {
  if (cat.startsWith('econ') || cat.startsWith('q-fin.EC')) return 'Economics';
  if (cat.startsWith('cs')) return 'Computer Science';
  if (cat.startsWith('eess'))
    return 'Electrical Engineering and Systems Science';
  if (cat.startsWith('math')) return 'Mathematics';
  if (
    cat.startsWith('astro') ||
    cat.startsWith('cond-mat') ||
    cat.startsWith('gr-qc') ||
    cat.startsWith('hep') ||
    cat.startsWith('math-ph') ||
    cat.startsWith('nlin') ||
    cat.startsWith('nucl') ||
    cat.startsWith('physics') ||
    cat.startsWith('quant-ph')
  )
    return 'Physics';
  if (cat.startsWith('q-bio')) return 'Quantitative Biology';
  if (cat.startsWith('q-fin')) return 'Quantitative Finance';
  if (cat.startsWith('stat')) return 'Statistics';
  return 'Other';
}

async function dataToDB(data: ArxivPaper) {
  const existingPaper = await paperModel.findOne({ arxivId: data.id });
  if (existingPaper) {
    console.log(`Paper ${data.title} already exists in the database`);
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
      const academicField = await academicFieldModel.findOne({
        name: getCategory(category)
      });

      if (!academicField) {
        const newAcademicField = await academicFieldModel.create({
          name: getCategory(category)
        });
        console.log(`Created new academic field: ${newAcademicField.name}`);

        return newAcademicField;
      }

      return academicField;
    })
  );

  const paper = await paperModel.create({
    name: data.title,
    abstract: data.abstract,
    authors: authors.map((author) => author?._id),
    categories: categories.map((category) => category?._id),
    publishDate: new Date(data.published),
    updateDate: new Date(data.updated),
    downloadLink: data.pdfLink,
    sourceLink: data.arxivLink,
    arxivId: data.id
  });

  console.log(`Created new paper: ${paper.name}`);
}

export async function readArxivFiles() {
  let connection;
  try {
    connection = await mongoose.connect(config.mongoURL);
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
