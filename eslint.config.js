import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  // ldgenx-atlas-2d holds the reference assets and preview of the applications atlas.
  { ignores: ['dist/**', '.prerender/**', '.wrangler/**', 'node_modules/**', 'ldgenx-atlas-2d/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    // French copy uses no-break spaces before « ; ! ? : » (see scripts/fr-typography.mjs).
    rules: {
      'no-irregular-whitespace': [
        'error',
        { skipStrings: true, skipTemplates: true, skipJSXText: true },
      ],
    },
  },
);
