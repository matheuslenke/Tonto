import { ClassElement } from './../generated/ast';
import { ValidationAcceptor } from "langium";
import { Element, ElementReference } from "../generated/ast";
import { EndurantTypes } from "../models/EndurantType";

export class ClassElementValidator {
  checkEndurantIsValid(endurantItem: Element, accept: ValidationAcceptor): void {

  }

  checksExternalReference(reference: ElementReference, accept: ValidationAcceptor ) {
    if (reference.isAssociation) {
        // console.log(`${reference.name} is Association`)
    } else if (reference.isComposition) {
        // console.log(`${reference.name} is Composition`)
    }
}

  checkKindSpecialization(endurantItem: ClassElement, accept: ValidationAcceptor): void {
    const endurantType = endurantItem.type.stereotype

    if (endurantType === EndurantTypes.KIND || endurantType === EndurantTypes.SUBKIND  ) {
      
      endurantItem.specializationEndurants.forEach( specializationItem => {
        const refElement = specializationItem.ref?.$cstNode?.element as ClassElement
        const refType = refElement.type.stereotype
  
        if( refType === EndurantTypes.KIND || refType === EndurantTypes.COLLECTIVE ||
          refType === EndurantTypes.QUANTITY ||
          refType === EndurantTypes.QUALITY || refType === EndurantTypes.MODE ) {
          // console.log("Error na referencia")
          accept('info', 'Every sortal class must specialize a unique ultimate sortal (Kind, Collective, Quantity, Relator, Quality or mode', {node: endurantItem} )
        }
      })
    }  
  }
}