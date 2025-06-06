import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    languageOptions: {
      parserOptions: {
        // ✅ Force ESLint to use root tsconfig, not create one in src/
        project: './tsconfig.json',
        tsconfigRootDir: __dirname, // Frontend root directory
        sourceType: 'module',
      },
    },
    ignores: [
      'src/tsconfig.json', //  Ignore auto-generated tsconfig in src
      '**/tsconfig.json', //  Ignore any auto-generated tsconfigs
      '!tsconfig.json', //  But keep the root one
      '../backend/**/*', //  Ignore backend completely
    ],
  },
];

export default eslintConfig;
