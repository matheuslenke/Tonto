import { JSDocDocumentationProvider } from "langium";
import { TontoServices } from "../tonto-module.js";

export class TontoDocumentationProvider extends JSDocDocumentationProvider {
    constructor(services: TontoServices) {
        super(services);
      }
}