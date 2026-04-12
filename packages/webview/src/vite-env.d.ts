/// <reference types="vite/client" />

declare module "*.css";

type VscodeApi = {
    getState: () => unknown;
    postMessage: (message: unknown) => void;
    setState: (state: unknown) => void;
};

declare function acquireVsCodeApi(): VscodeApi;
