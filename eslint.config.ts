import { includeIgnoreFile } from '@eslint/compat';
import type { ConfigWithExtendsArray } from '@eslint/config-helpers';
import { defineConfig } from '@eslint/config-helpers';
import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import eslintPluginVitest from '@vitest/eslint-plugin';
import { flatConfigs as eslintPluginImportX } from 'eslint-plugin-import-x';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import { resolve } from 'node:path';
import { configs as tseslint } from 'typescript-eslint';

const gitignorePath = resolve(import.meta.dirname, '.gitignore');

export default defineConfig(
  //#region global
  includeIgnoreFile(gitignorePath),
  {
    name: 'ignored files',
    ignores: [
      // TODO @Shinigami92 2025-06-20: Angular example has its own tsconfig and it is too cumbersome right now to make it work
      'examples/angular/**/*.ts',
    ],
  },
  {
    name: 'linter options',
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
  //#endregion

  //#region prettier
  eslintPluginPrettierRecommended,
  //#endregion

  //#region eslint (js)
  eslint.configs.recommended,
  {
    name: 'eslint overrides',
    rules: {
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'logical-assignment-operators': 'error',
      'no-else-return': 'error',
      'prefer-exponentiation-operator': 'error',
      'prefer-template': 'error',
    },
  },
  //#endregion

  //#region typescript-eslint
  ...(tseslint.strictTypeChecked as ConfigWithExtendsArray),
  {
    name: 'typescript-eslint overrides',
    languageOptions: {
      parserOptions: {
        project: true,
        warnOnUnsupportedTypeScriptVersion: false,
      },
    },
    rules: {
      '@typescript-eslint/array-type': [
        'error',
        { default: 'array-simple', readonly: 'generic' },
      ],
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': 'allow-with-description',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
          fixStyle: 'separate-type-imports',
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          format: ['PascalCase'],
          selector: ['class', 'interface', 'typeAlias'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
        {
          format: ['UPPER_CASE', 'snake_case'],
          selector: ['enumMember'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
        {
          format: ['PascalCase'],
          selector: ['typeParameter'],
          prefix: ['T'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
      ],
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        {
          ignoreArrowShorthand: true,
        },
      ],
      '@typescript-eslint/no-inferrable-types': [
        'error',
        { ignoreParameters: true },
      ],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/prefer-regexp-exec': 'error',
      '@typescript-eslint/restrict-plus-operands': [
        'error',
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: true,
          allowRegExp: false,
        },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        { requireDefaultForNonUnion: true },
      ],
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  //#endregion

  //#region stylistic
  {
    name: 'stylistic overrides',
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'block-like', next: '*' },
      ],
    },
  },
  //#endregion

  //#region import-x
  // @ts-expect-error: suppress type error
  eslintPluginImportX.recommended,
  eslintPluginImportX.typescript,
  {
    rules: {
      'import-x/consistent-type-specifier-style': ['error', 'prefer-top-level'],
    },
  },
  //#endregion

  //#region unicorn
  eslintPluginUnicorn.configs.recommended,
  {
    name: 'unicorn overrides',
    rules: {
      'unicorn/filename-case': 'off',
      'unicorn/import-style': 'off', // subjective & doesn't do anything for us
      'unicorn/no-array-callback-reference': 'off', // reduces readability
      'unicorn/no-nested-ternary': 'off', // incompatible with prettier
      'unicorn/no-object-as-default-parameter': 'off', // https://github.com/sindresorhus/eslint-plugin-unicorn/issues/2199
      'unicorn/no-null': 'off', // incompatible with TypeScript
      'unicorn/no-zero-fractions': 'off', // deactivated to raise awareness of floating operations
      'unicorn/number-literal-case': 'off', // incompatible with prettier
      'unicorn/numeric-separators-style': 'off', // "magic numbers" may carry specific meaning
      'unicorn/prefer-string-slice': 'off', // string.substring is sometimes easier to use
      'unicorn/prefer-ternary': 'off', // ternaries aren't always better

      // TODO @Shinigami92 2025-06-14: Maybe enable later
      'unicorn/prevent-abbreviations': 'off',
    },
  },
  //#endregion

  //#region overrides
  {
    name: '**/test/**/*.ts overrides',
    files: ['**/test/**/*.spec.ts', '**/test/**/*.spec.d.ts'],
    plugins: {
      vitest: eslintPluginVitest,
    },
    rules: {
      'deprecation/deprecation': 'off',

      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowNumber: true,
          allowBoolean: true,
          allowAny: true,
        },
      ],

      ...eslintPluginVitest.configs.recommended.rules,

      'vitest/expect-expect': 'off',
      'vitest/no-alias-methods': 'error',
      'vitest/prefer-each': 'error',
      'vitest/prefer-to-have-length': 'error',
      'vitest/valid-expect': ['error', { maxArgs: 2 }],
    },
    settings: {
      vitest: {
        typecheck: true,
      },
    },
  },
  //#endregion

  {
    name: 'custom',
    plugins: {
      custom: {
        rules: {
          'no-arrow-parameter-types': {
            meta: {
              fixable: 'code',
              hasSuggestions: true,
              type: 'suggestion',
              dialects: ['typescript'],
              schema: [
                {
                  type: 'object',
                  properties: {
                    allowOptional: {
                      type: 'boolean',
                      default: false,
                      description:
                        'Allow type annotations when the parameter is optional. Sometimes useful for overloaded functions.',
                    },
                  },
                },
              ],
              defaultOptions: [
                {
                  allowOptional: false,
                },
              ],
            },
            create(context) {
              const options = context.options[0] as { allowOptional: boolean };

              return {
                ArrowFunctionExpression(node) {
                  const paramsWithTypeAnnotation = node.params.filter(
                    (
                      // @ts-expect-error: will be inferred when moved into an official plugin
                      param
                    ) => param.typeAnnotation !== undefined
                  );

                  const isCatchClause =
                    node.parent.callee?.property?.name === 'catch';

                  if (paramsWithTypeAnnotation.length > 0 && !isCatchClause) {
                    for (const param of paramsWithTypeAnnotation) {
                      if (param.optional && options.allowOptional) {
                        continue;
                      }

                      context.report({
                        node: param,
                        message:
                          'Arrow function parameters should not have type annotations. Instead the Object where the operation is used should be typed correctly.',
                        fix(fixer) {
                          if (param.optional) {
                            return null;
                          }

                          if (
                            node.parent.type === 'VariableDeclarator' &&
                            !node.parent.id.typeAnnotation
                          ) {
                            const variableDeclarationNode = node.parent;

                            const isAsyncFunction: boolean = node.async;

                            const isBodyBlockStatement =
                              node.body.type === 'BlockStatement';

                            const hasReturnType = node.returnType !== undefined;

                            const lastParam = node.params.at(-1);

                            const paramIdDifferentLine =
                              lastParam.loc.start.line !==
                              variableDeclarationNode.id.loc.end.line;

                            const paramBlockDifferentLine =
                              lastParam.loc.end.line !==
                              node.body.loc.start.line;

                            const behindClosingParenthesis = hasReturnType
                              ? (node.returnType.range[1] as number)
                              : (lastParam.range[1] as number) + ')'.length;

                            const fixes = [
                              // Removes `=> `
                              fixer.replaceTextRange(
                                [
                                  behindClosingParenthesis,
                                  node.body.range[0] as number,
                                ],
                                !hasReturnType &&
                                  paramBlockDifferentLine &&
                                  paramIdDifferentLine
                                  ? ')'
                                  : ''
                              ),
                              // Removes ` = ` or ` = async `
                              fixer.replaceTextRange(
                                [
                                  variableDeclarationNode.id.range[1] as number,
                                  (variableDeclarationNode.init
                                    .range[0] as number) +
                                    (isAsyncFunction ? 'async '.length : 0),
                                ],
                                ''
                              ),
                              // Replaces `const ` with `function ` or `async function `
                              fixer.replaceTextRange(
                                [
                                  variableDeclarationNode.parent
                                    .range[0] as number,
                                  variableDeclarationNode.range[0] as number,
                                ],
                                isAsyncFunction
                                  ? 'async function '
                                  : 'function '
                              ),
                            ];

                            // If the body is not a BlockStatement, we need to wrap it in curly braces
                            if (!isBodyBlockStatement) {
                              fixes.push(
                                fixer.insertTextBefore(node.body, '{return '),
                                fixer.insertTextAfter(node.body, '}')
                              );
                            }

                            return fixes;
                          }

                          return fixer.removeRange(
                            param.typeAnnotation.range as [number, number]
                          );
                        },
                        suggest: [
                          {
                            desc: 'Remove type annotation',
                            fix(fixer) {
                              if (param.optional) {
                                return fixer.removeRange([
                                  (param.typeAnnotation.range[0] as number) - 1, // Remove the `?` before the type annotation
                                  param.typeAnnotation.range[1] as number,
                                ]);
                              }

                              return null;
                            },
                          },
                        ],
                      });
                    }
                  }
                },
              };
            },
          },
        },
      },
    },
    rules: {
      'custom/no-arrow-parameter-types': ['error', { allowOptional: true }],
    },
  }
);
