import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const ConfigSchema = z.object({
  MONGOBD_URL: z.string()
});

const data = ConfigSchema.parse(process.env);

export default {
  mongoURL: data.MONGOBD_URL
};
