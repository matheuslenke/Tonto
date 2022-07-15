import { ClassElement } from './../generated/ast';
import { ValidationAcceptor } from "langium";
import { EndurantTypes } from "../models/EndurantType";

export class ClassElementValidator {

  /*
  * Checks if a Kind specializes a unique ultimate sortal (Kind, Collective, Quantity, Relator, Quality or mode)
  */
  checkKindSpecialization(classElement: ClassElement, accept: ValidationAcceptor): void {
    if (!classElement || !classElement.classElementType) {
      return
    }
    const endurantType = classElement.classElementType.stereotype

    if (endurantType === null || endurantType === undefined) { return }
    // Check if it is an Sortal
    if (endurantType === EndurantTypes.KIND ||
      endurantType === EndurantTypes.SUBKIND ||
      endurantType === EndurantTypes.COLLECTIVE  ) {
      
      classElement.specializationEndurants.forEach( specializationItem => {
        const refElement = specializationItem.ref?.$cstNode?.element as ClassElement
        if(!refElement || !refElement.classElementType) {
          return
        }
        const refType = refElement.classElementType.stereotype

        // Check if it specializes another Sortal
        if( refType === EndurantTypes.KIND || refType === EndurantTypes.COLLECTIVE ||
          refType === EndurantTypes.QUANTITY ||
          refType === EndurantTypes.QUALITY || refType === EndurantTypes.MODE ) {
          // console.log("Error na referencia")
          accept('warning', 'Every sortal class must specialize a unique ultimate sortal (Kind, Collective, Quantity, Relator, Quality or mode)', { node: classElement } )
        }
      })
    }  
  }

  /*
  * Checks if a Rigid stereotype specializes a anti-rigid stereotype
  */
  checkRigidSpecializesAntiRigid(classElement: ClassElement, accept: ValidationAcceptor): void {
    if (!classElement.classElementType) {
      return
    }
    const endurantType = classElement.classElementType.stereotype

    if (endurantType === null || endurantType === undefined) { return }
    
    // Check if it is a rigid stereotype
    if (endurantType === EndurantTypes.KIND 
        || endurantType === EndurantTypes.SUBKIND
        || endurantType === EndurantTypes.COLLECTIVE
        || endurantType === EndurantTypes.CATEGORY
        ) {
          classElement.specializationEndurants.forEach( specializationItem => {
            const refElement = specializationItem.ref?.$cstNode?.element as ClassElement
            if (!refElement.classElementType) {
              return
            }
            const refType = refElement.classElementType.stereotype
      
            if( refType === EndurantTypes.PHASE || refType === EndurantTypes.ROLE ||
              refType === EndurantTypes.PHASE_MIXIN || refType === EndurantTypes.ROLE_MIXIN) {
              // console.log("Error na referencia")
              accept('warning', `Prohibited specialization: rigid/semi-rigid specializing an anti-rigid. The rigid/semi-rigid class ${classElement.name} cannot specialize the anti-rigid class ${refElement.name}`, {node: classElement} )
            }
          })
    }
  }

  checkDuplicatedReferenceNames(classElement: ClassElement, accept: ValidationAcceptor): void {
    const references = classElement.references

    let names: string[] = []

    references.forEach( reference => {
      const nameExists = names.find(name => name === reference.name)
      if (nameExists) {
        accept('error', 'Duplicated reference name', { node: reference })
      } else {
        names.push(reference.name)
      }
    })
  }
}