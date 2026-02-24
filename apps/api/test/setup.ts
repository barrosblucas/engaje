import * as path from 'node:path';
// Jest test setup — load environment variables for tests
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
