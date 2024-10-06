import { resolve as _resolve } from "path";
const __dirname = import.meta.dirname;
const commonConfig = {
    target: "node",
    mode: "none",
    devtool: "nosources-source-map",
    externals: {
        vscode: "commonjs vscode" // the vscode-module is created on-the-fly and must be excluded
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                enforce: "pre",
                loader: "source-map-loader",
                exclude: /vscode/
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader"
                    }
                ]
            }
        ]
    }
};
const lspConfig = {
    ...commonConfig,
    entry: "./src/language/main.ts", // the entry point of the language server
    output: {
        path: _resolve(__dirname, "out", "language"),
        filename: "main.js",
        libraryTarget: "commonjs2",
        devtoolModuleFilenameTemplate: "../../[resource-path]",
        clean: true
    }
};
const vscodeConfig = {
    ...commonConfig,
    entry: "./src/index.ts", // the entry point of this extension
    output: {
        path: _resolve(__dirname, "out"),
        filename: "extension.js",
        libraryTarget: "commonjs2",
        devtoolModuleFilenameTemplate: "../[resource-path]"
    }
};

const webviewConfig = {
    ...commonConfig,
    entry: _resolve(__dirname, "src/webview/main.ts"),
    output: {
		filename: "webview.js",
        path: _resolve(__dirname, "out"),
        libraryTarget: "commonjs2",
    },
};
export default [lspConfig, vscodeConfig];
