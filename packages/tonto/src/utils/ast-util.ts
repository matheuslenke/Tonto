import { AstNode, LangiumDocument, isAstNode } from "langium";
import { Model, PackageDeclaration, TontoDiagramView, isModel } from "../language/index.js";

export type SemanticRoot = TontoDiagramView | PackageDeclaration;

/**
 * Retrieve the document in which the given AST node is contained. A reference to the document is
 * usually held by the root node of the AST.
 */
export function findDocument<T extends AstNode = AstNode>(node?: AstNode): LangiumDocument<T> | undefined {
    if (!node) {
        return undefined;
    }
    const rootNode = findRootNode(node);
    const result = rootNode.$document;
    return result ? <LangiumDocument<T>>result : undefined;
}

/**
 * Returns the root node of the given AST node by following the `$container` references.
 */
export function findRootNode(node: AstNode): AstNode {
    while (node.$container) {
        node = node.$container;
    }
    return node;
}

export type DocumentContent = LangiumDocument<Model> | AstNode;
export type TypeGuard<T> = (item: unknown) => item is T;

export function findSemanticRoot(input: DocumentContent): SemanticRoot | undefined;
export function findSemanticRoot<T extends SemanticRoot>(input: DocumentContent, guard: TypeGuard<T>): T | undefined;
export function findSemanticRoot<T extends SemanticRoot>(input: DocumentContent, guard?: TypeGuard<T>): SemanticRoot | T | undefined {
    const root = isAstNode(input) ? input.$document?.parseResult?.value ?? findRootNode(input) : input.parseResult?.value;
    const semanticRoot = isModel(root) ? root.module ?? root.diagram : undefined;
    return !semanticRoot ? undefined : !guard ? semanticRoot : guard(semanticRoot) ? semanticRoot : undefined;
}

/**
 * Returns the Package name based on the Document
 */
export function getPackageName(document: LangiumDocument<AstNode>): string | undefined {
    const model = document.parseResult.value;
    if (isModel(model)) {
        return model.module?.id;
    }
    return undefined;
}

/**
 * Retrieve the document in which the given AST node is contained. A reference to the document is
 * usually held by the root node of the AST.
 *
 * @throws an error if the node is not contained in a document.
 */
export function getDocument<T extends AstNode = AstNode>(node: AstNode): LangiumDocument<T> {
    const rootNode = findRootNode(node);
    const result = rootNode.$document;
    if (!result) {
        throw new Error("AST node has no document.");
    }
    return result as LangiumDocument<T>;
}