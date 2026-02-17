# @mckabue/no-same-type-params

> An ESLint rule that disallows consecutive function parameters sharing the same type annotation.

[![npm version](https://img.shields.io/npm/v/@mckabue/no-same-type-params.svg)](https://www.npmjs.com/package/@mckabue/no-same-type-params)
[![npm downloads](https://img.shields.io/npm/dm/@mckabue/no-same-type-params.svg)](https://www.npmjs.com/package/@mckabue/no-same-type-params)
[![license](https://img.shields.io/npm/l/@mckabue/no-same-type-params.svg)](https://www.npmjs.com/package/@mckabue/no-same-type-params)

## The Problem

Functions with multiple consecutive parameters of the same type are error-prone. Callers can easily swap arguments without any compiler warning:

```tsx
// 😱 Which string is source? Which is dest? Easy to mix up!
function copy(source: string, dest: string, adapterId: string) { ... }

// Swapped source and dest — no TypeScript error!
copy(destPath, sourcePath, adapterId);
```

## The Solution

This rule catches these signatures and encourages refactoring to object parameters:

```tsx
// ✅ Clear, self-documenting, impossible to swap
function copy({ source, dest, adapterId }: CopyParams) { ... }

copy({ source: sourcePath, dest: destPath, adapterId });
```

## Installation

```bash
npm install @mckabue/no-same-type-params --save-dev
# or
yarn add @mckabue/no-same-type-params --dev
# or
pnpm add @mckabue/no-same-type-params --save-dev
```

**Peer Dependencies:**
- `eslint`: >=8.0.0

You'll also need `@typescript-eslint/parser` for TypeScript support.

## Usage

### ESLint Flat Config (eslint.config.js)

```js
import noSameTypeParams from '@mckabue/no-same-type-params';
import * as tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      custom: {
        rules: {
          'no-same-type-params': noSameTypeParams,
        },
      },
    },
    rules: {
      'custom/no-same-type-params': 'warn',
    },
  },
];
```

### Legacy Config (.eslintrc)

```json
{
  "plugins": ["custom"],
  "rules": {
    "custom/no-same-type-params": "warn"
  }
}
```

## Examples

### ❌ Invalid (triggers warning)

```tsx
// Two consecutive string params
const fn = (a: string, b: string) => {};

// Three consecutive string params (2 warnings)
function copy(source: string, dest: string, adapterId: string) {}

// Default values with same types
const fn = (a: string = 'x', b: string = 'y') => {};

// Same array types
const fn = (a: string[], b: string[]) => {};

// Same union types
const fn = (a: string | number, b: string | number) => {};
```

### ✅ Valid (no warnings)

```tsx
// Different types
const fn = (a: string, b: number) => {};

// Object parameter
const fn = (opts: { source: string; dest: string }) => {};

// Non-consecutive same types (different type in between)
const fn = (a: string, b: number, c: string) => {};

// Untyped parameters (can't compare)
const fn = (a, b) => {};

// Single parameter
const fn = (a: string) => {};
```

## How It Works

The rule inspects `FunctionDeclaration`, `FunctionExpression`, and `ArrowFunctionExpression` nodes. For each pair of consecutive parameters:

1. Extracts the TypeScript type annotation (handles `Identifier`, `AssignmentPattern`, and `RestElement`)
2. Compares the source text of both type annotations
3. Reports if they match

Untyped parameters are ignored — only TypeScript-annotated parameters are compared.

## License

MIT © [Kabui Charles](https://github.com/mckabue)
