/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

 import { DefaultNameProvider } from 'langium';
 import { isContextModule, ContextModule } from './generated/ast';
 
 export function toQualifiedName(pack: ContextModule, childName: string): string {
     return (isContextModule(pack.$container) ? toQualifiedName(pack.$container, pack.name) : pack.name) + '.' + childName;
 }
 
 export class TontoNameProvider extends DefaultNameProvider {
 
     /**
      * @param qualifier if the qualifier is a `string`, simple string concatenation is done: `qualifier.name`.
      *      if the qualifier is a `Package` fully qualified name is created: `package1.package2.name`.
      * @param name simple name
      * @returns qualified name separated by `.`
      */
     getQualifiedName(qualifier: ContextModule | string, name: string): string {
         let prefix = qualifier;
         if (isContextModule(prefix)) {
             prefix = (isContextModule(prefix.$container) ? this.getQualifiedName(prefix.$container, prefix.name) : prefix.name);
         } 
         return (prefix ? prefix + '.' : '') + name;
     }
 
 }