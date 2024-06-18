import { AstNode, AstNodeDescription, DefaultIndexManager, LangiumDocument, URI } from "langium";
import { SemanticRoot, findSemanticRoot } from "../../utils/ast-util.js";
import { Model } from "../generated/ast.js";
import { TontoSharedServices } from "../tonto-module.js";

export class TontoIndexManager extends DefaultIndexManager {
    constructor(protected services: TontoSharedServices) {
        super(services);
    }

    getElementById(globalId: string, type?: string): AstNodeDescription | undefined {
        console.log(this.allElements());
        return this.allElements().find(desc => desc.name === globalId && (!type || desc.type === type));
    }

    resolveElement(description?: AstNodeDescription): AstNode | undefined {
        if (!description) {
            return undefined;
        }
        const document = this.services.workspace.LangiumDocuments.getDocument(description.documentUri);
        return document
            ? this.serviceRegistry.getServices(document.uri).workspace.AstNodeLocator.getAstNode(document.parseResult.value, description.path)
            : undefined;
    }

    resolveElementById(globalId: string, type?: string): AstNode | undefined {
        return this.resolveElement(this.getElementById(globalId, type));
    }

    resolveSemanticElement(uri: URI): SemanticRoot | undefined {
        const document = this.services.workspace.LangiumDocuments.getDocument(uri) as LangiumDocument<Model>;
        return document ? findSemanticRoot(document) : undefined;
    }
}