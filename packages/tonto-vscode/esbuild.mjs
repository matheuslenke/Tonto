//@ts-check
import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');
const minify = process.argv.includes('--minify');

/**
 * This is the entry point for building the Extension
 */
const ctx = await esbuild.context({
        // Two entry points, one for the extension, one for the language server
        entryPoints: ["src/extension.ts", "src/language-server/main.ts"],
        outdir: "out",
        bundle: true,
        loader: { ".ts": "ts" },
        external: ["vscode"], // the vscode-module is created on-the-fly and must be excluded.
        platform: "node", // VSCode extensions run in a node process
        sourcemap: "both",
        minify,
    })

if (watch) {
    await ctx.watch();
} else {
    await ctx.rebuild();
    ctx.dispose();
}