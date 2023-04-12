/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

import { AstNode, DefaultNameProvider } from "langium";
import {
  ClassDeclaration,
  ContextModule,
  ElementRelation,
  Model,
  isAttribute,
  isClassDeclaration,
  isComplexDataType,
  isContextModule,
  isElementRelation,
  isEnum,
  isEnumElement,
  isGeneralizationSet,
} from "./generated/ast";

export function toQualifiedName(
  pack: ContextModule,
  childName: string
): string {
  return (
    (isContextModule(pack.$container)
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
    qualifier:
      | Model
      | ContextModule
      | ClassDeclaration
      | ElementRelation
      | string,
    name: string
  ): string {
    let prefix = qualifier;
    while (isContextModule(prefix) || isClassDeclaration(prefix)) {
      if (name) {
        name = `${prefix.name}.${name}`;
        prefix = prefix.$container;
      }
    }
    return (prefix ? prefix + "." : "") + name;
  }

  getName(node: AstNode): string | undefined {
    if (isElementRelation(node)) {
      const parent = node.$container;
      if (isClassDeclaration(parent)) {
        return `${parent.name}.${node.name}`;
      }
      return node.name;
    }
    if (
      isClassDeclaration(node) ||
      isContextModule(node) ||
      isAttribute(node) ||
      isGeneralizationSet(node) ||
      isComplexDataType(node) ||
      isEnum(node) ||
      isEnumElement(node)
    ) {
      return node.name;
    }
    return undefined;
  }
}
