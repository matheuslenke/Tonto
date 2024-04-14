import { CompositeGeneratorNode } from "langium/generate";

export abstract class ASTDeclarationItem {
    abstract writeToNode(node: CompositeGeneratorNode): void;
    abstract getNumberOfInternalElements(): number;
}