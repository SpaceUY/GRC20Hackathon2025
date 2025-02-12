import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const ConfigSchema = z.object({
  mongoURL: z.string()
});

export default ConfigSchema.parse(process.env);
