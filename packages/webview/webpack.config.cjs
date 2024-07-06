// @ts-check
const path = require("path");

const outputPath = path.resolve(__dirname, "./dist/");

/**@type {import('webpack').Configuration}*/
const config = {
    target: "web",

    entry: path.resolve(__dirname, "src/index.ts"),
    output: {
        filename: "webview.js",
        path: outputPath
    },
    devtool: "eval-source-map",
    mode: "development",

    resolve: {
        fallback: {
            fs: false,
            net: false
        },
        alias: {
            process: "process/browser"
        },
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: ["ts-loader"]
            },
            {
                test: /\.js$/,
                use: ["source-map-loader"],
                enforce: "pre"
            },
            {
                test: /\.css$/,
                exclude: /\.useable\.css$/,
                use: ["style-loader", "css-loader"]
            }
        ]
    },
    ignoreWarnings: [/Failed to parse source map/, /Can't resolve .* in '.*ws\/lib'/],
    performance: {
        hints: false
    }
};

module.exports = config;
