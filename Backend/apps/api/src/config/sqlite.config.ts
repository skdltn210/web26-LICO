import { registerAs } from '@nestjs/config';

export default registerAs('sqlite', () => ({
  database: ':memory:',
}));
