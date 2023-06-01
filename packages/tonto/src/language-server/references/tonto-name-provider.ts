import { AstNode, DefaultNameProvider } from "langium";
import { ContextModule, ClassDeclaration, isContextModule, isClassDeclaration, isElementRelation, isAttribute, isGeneralizationSet, isDataType, isEnumElement } from "../generated/ast";

export function toQualifiedName(
  pack: ContextModule | ClassDeclaration,
  childName: string
): string {
  return (
    (isContextModule(pack.$container) || isClassDeclaration(pack.$container)
      ? toQualifiedName(pack.$container, pack.name)
      : pack.name) +
    "." +
    childName
  );
}

export class TontoQualifiedNameProvider extends DefaultNameProvider {
  /**
   * @param qualifier if the qualifier is a `string`, simple string concatenation is done: `qualifier.name`.
   *      if the qualifier is a `Package` fully qualified name is created: `package1.package2.name`.
   * @param name simple name
   * @returns qualified name separated by `.`
   */
  getQualifiedName(
    node: AstNode
  ): string | undefined {
    if (isElementRelation(node)) {
      if (!node.name) {
        return undefined;
      }
      const parent = node.$container;
      if (isClassDeclaration(parent)) {
        return `${parent.name}.${node.name}`;
      } else if (node.firstEnd?.$refText) {
        return `${node.firstEnd?.$refText}.${node.name}`;
      }
      return node.name;
    }
    if (isContextModule(node)) {
      return node.name;
    }
    if (
      isClassDeclaration(node) ||
      isAttribute(node) ||
      isGeneralizationSet(node) ||
      isDataType(node) ||
      isEnumElement(node)
    ) {
      const parent = node.$container;
      return `${parent.name}.${node.name}`;
    }
    return undefined;
  }
}
