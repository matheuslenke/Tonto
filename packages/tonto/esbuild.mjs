//@ts-check
/**
 * @typedef {import('esbuild').BuildOptions} BuildOptions
 */

import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');

/**
 * @type {BuildOptions}
 */
const sharedConfig = {
    bundle: true,
    sourcemap: true,
    target: "ES2020",
    loader: { '.ts': 'ts' },
    external: [
        'vscode',
        'chevrotain',
        'langium',
        'langium-sprotty',
        '@inquirer/prompts',
        'chalk',
        'commander',
        'elkjs',
        'esbuild',
        'glob',
        'node-fetch-native',
        'ontouml-js',
        'reflect-metadata',
        'rimraf',
        'sprotty',
        'sprotty-elk',
        'uuid',
        'vscode-languageclient',
        'vscode-languageserver',
        'vscode-languageserver-types',
        'vscode-uri'
    ],
    platform: 'node',
};

/**
 * @type {BuildOptions[]}
 */
const configs = [
    // Library CJS
    {
        ...sharedConfig,
        entryPoints: ['src/index.ts'],
        format: 'cjs',
        outfile: 'lib/index.js',
    },
    // CLI CJS
    {
        ...sharedConfig,
        entryPoints: ['src/cli/main.ts'],
        format: 'cjs',
        outfile: 'lib/cli/main.js',
        external: [...(sharedConfig.external || []), './index.cjs'],
    },
];

for (const config of configs) {
    const ctx = await esbuild.context(config);
    if (watch) {
        await ctx.watch();
    } else {
        await ctx.rebuild();
        await ctx.dispose();
    }
}
