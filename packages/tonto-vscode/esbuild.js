//@ts-check
const watch = process.argv.includes("--watch");
const minify = process.argv.includes("--minify");
const successExtension = watch
    ? "Watch build Extension succeeded"
    : "Build Extension succeeded";

function getTime() {
    const date = new Date();
    return `[${`${padZeroes(date.getHours())}:${padZeroes(
        date.getMinutes()
    )}:${padZeroes(date.getSeconds())}`}] `;
}

function padZeroes(i) {
    return i.toString().padStart(2, "0");
}

const esbuild = require("esbuild");

/**
 * This is the entry point for building the Extension
 */
esbuild
    .build({
        // Two entry points, one for the extension, one for the language server
        entryPoints: ["src/extension.ts", "src/language-server/main.ts"],
        outdir: "out",
        bundle: true,
        loader: { ".ts": "ts" },
        external: ["vscode"], // the vscode-module is created on-the-fly and must be excluded.
        platform: "node", // VSCode extensions run in a node process
        sourcemap: !minify,
        watch: watch
            ? {
                onRebuild(error) {
                    if (error) console.error("Watch build failed");
                    else console.log(successExtension);
                },
            }
            : false,
        minify,
    })
    .then(() => console.log(`${getTime()}${successExtension}`))
    .catch(() => process.exit(1));