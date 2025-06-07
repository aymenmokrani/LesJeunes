import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  // Base JavaScript configuration
  js.configs.recommended,

  // Prettier configuration (disables conflicting rules)
  prettierConfig,

  {
    // File patterns this config applies to
    files: ['**/*.ts', '**/*.tsx'],

    // Language options
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        global: 'readonly',
        module: 'writable',
        require: 'readonly',
        // Jest globals
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
        test: 'readonly',
      },
    },

    // Plugins
    plugins: {
      '@typescript-eslint': typescript,
      prettier: prettier,
    },

    // Rules
    rules: {
      // TypeScript rules
      ...typescript.configs.recommended.rules,
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      // Disable no-undef - TypeScript handles undefined variables better
      'no-undef': 'off',

      // Prettier rules
      'prettier/prettier': 'error',
    },
  },

  {
    // Ignore patterns
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'eslint.config.mjs', // Can remove this line since we're not using eslint.config.mjs anymore
      '*.config.js',
      '*.config.mjs',
    ],
  },
];
