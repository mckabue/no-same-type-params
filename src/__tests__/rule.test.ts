import { RuleTester } from 'eslint'
import * as tsParser from '@typescript-eslint/parser'
import noSameTypeParams from '../rule'

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
})

ruleTester.run('no-same-type-params', noSameTypeParams, {
  valid: [
    // Different types — no violation
    { code: `const fn = (a: string, b: number) => {}` },
    // Single parameter — no violation
    { code: `const fn = (a: string) => {}` },
    // No parameters — no violation
    { code: `const fn = () => {}` },
    // Object parameter — no violation
    { code: `const fn = (opts: { source: string, dest: string }) => {}` },
    // Non-consecutive same types with different type in between
    { code: `const fn = (a: string, b: number, c: string) => {}` },
    // Untyped parameters — no violation (can't compare)
    { code: `const fn = (a, b) => {}` },
    // One typed, one untyped — no violation
    { code: `const fn = (a: string, b) => {}` },
    // Function declaration with different types
    { code: `function fn(a: string, b: number): void {}` },
    // Method-like function expression with different types
    { code: `const obj = { fn: function(a: string, b: number) {} }` },
    // Complex types that differ
    { code: `const fn = (a: string[], b: number[]) => {}` },
    // Optional params with different types
    { code: `const fn = (a: string, b?: number) => {}` },
  ],
  invalid: [
    // Two consecutive string params
    {
      code: `const fn = (a: string, b: string) => {}`,
      errors: [{ messageId: 'sameTypeParams' }],
    },
    // Two consecutive number params
    {
      code: `const fn = (a: number, b: number) => {}`,
      errors: [{ messageId: 'sameTypeParams' }],
    },
    // Three consecutive string params — reports at positions 1 and 2
    {
      code: `const fn = (a: string, b: string, c: string) => {}`,
      errors: [
        { messageId: 'sameTypeParams' },
        { messageId: 'sameTypeParams' },
      ],
    },
    // Function declaration with consecutive same types (like S3Adapter.copy)
    {
      code: `function copy(source: string, dest: string, adapterId: string) {}`,
      errors: [
        { messageId: 'sameTypeParams' },
        { messageId: 'sameTypeParams' },
      ],
    },
    // Arrow function with consecutive same types (like S3Adapter.move)
    {
      code: `const move = (sourceKey: string, destKey: string, adapterId: string) => {}`,
      errors: [
        { messageId: 'sameTypeParams' },
        { messageId: 'sameTypeParams' },
      ],
    },
    // Mixed: different types then consecutive same types
    {
      code: `const fn = (a: number, b: string, c: string) => {}`,
      errors: [{ messageId: 'sameTypeParams' }],
    },
    // Default values with same types
    {
      code: `const fn = (a: string = 'x', b: string = 'y') => {}`,
      errors: [{ messageId: 'sameTypeParams' }],
    },
    // Complex same types (arrays)
    {
      code: `const fn = (a: string[], b: string[]) => {}`,
      errors: [{ messageId: 'sameTypeParams' }],
    },
    // Union types that are the same
    {
      code: `const fn = (a: string | number, b: string | number) => {}`,
      errors: [{ messageId: 'sameTypeParams' }],
    },
    // Function expression
    {
      code: `const obj = { fn: function(a: string, b: string) {} }`,
      errors: [{ messageId: 'sameTypeParams' }],
    },
  ],
})
