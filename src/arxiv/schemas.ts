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
  mainnetSpaceId: String,
  testnetGrc20Id: String
});

export const academicFieldModel = model('AcademicField', academicField);

const tagSchema = new Schema({
  name: { type: String, unique: true },
  mainnetGrc20Id: String,
  testnetGrc20Id: String
});

export const tagModel = model('Tag', tagSchema);

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
  tags: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Tag'
    }
  ],
  publishDate: Date, // QNEgnzBktEnx638zzVJU73
  updateDate: Date,
  downloadLink: String,
  sourceLink: String,
  arxivId: String,
  /* Ideally both ids are the same, but it could
   * be the case that those are different
   * also assigning the id means that the paper
   * is already published in that network.
   */
  mainnetGrc20Id: String,
  testnetGrc20Id: String
});

export const paperModel = model('Paper', paperSchema);
