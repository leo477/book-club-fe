import tailwindcss from '@tailwindcss/postcss';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  plugins: [
    tailwindcss({ base: __dirname }),
  ],
};
