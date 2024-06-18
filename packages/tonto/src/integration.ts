import { TontoServices, TontoSharedServices } from "./language/tonto-module.js";

export const TontoLSPServices = Symbol("TontoLSPServices");
export interface TontoLSPServices {
    shared: TontoSharedServices;
    language: TontoServices;
}