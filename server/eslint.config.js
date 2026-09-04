// server/eslint.config.js - ESLint v9+ Flat Config
// For Booking Hub server-side Node.js code

import js from '@eslint/js';
import globals from 'globals';

export default [
  // Base recommended rules
  js.configs.recommended,
  
  // Node.js configuration
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off', // We use console.log for debugging
      'no-undef': 'error',
      'no-extra-semi': 'error',
      'eqeqeq': ['warn', 'always'],
      'no-var': 'warn',
      'prefer-const': 'warn',
      'no-process-env': 'off', // We use process.env for config
    },
  },
  
  // Ignore patterns
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.min.js',
      '**/coverage/**',
    ],
  },
];