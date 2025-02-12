import { model, Schema } from 'mongoose';

const authorSchema = new Schema({
  name: String,
  email: String
});

export const authorModel = model('Author', authorSchema);

const journalSchema = new Schema({
  name: String,
  papers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Paper'
    }
  ]
});

export const journalModel = model('Journal', journalSchema);

const paperSchema = new Schema({
  authors: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Author'
    }
  ],
  title: String,
  abstract: String,
  journal: {
    type: Schema.Types.ObjectId,
    ref: 'Journal'
  },
  year: Number,
  pages: String,
  files: [
    {
      url: String,
      format: String
    }
  ],
  source: String
});

export const paperModel = model('Paper', paperSchema);
