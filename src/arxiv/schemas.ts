import { model, Schema } from 'mongoose';

const personSchema = new Schema({
  name: { type: String, unique: true },
  mainnetGrc20Id: String,
  testnetGrc20Id: String
});

export const personModel = model('Person', personSchema);

const academicField = new Schema({
  name: { type: String, unique: true },
  mainnetGrc20Id: String,
  testnetGrc20Id: String
});

export const academicFieldModel = model('AcademicField', academicField);

const paperSchema = new Schema({
  name: { type: String, unique: true },
  abstract: String,
  authors: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Person'
    }
  ],
  categories: [
    {
      type: Schema.Types.ObjectId,
      ref: 'AcademicField'
    }
  ],
  publishDate: Date, // QNEgnzBktEnx638zzVJU73
  updateDate: Date,
  downloadLink: String,
  sourceLink: String,
  arxivId: String,
  mainnetGrc20Id: String,
  testnetGrc20Id: String
});

export const paperModel = model('Paper', paperSchema);
