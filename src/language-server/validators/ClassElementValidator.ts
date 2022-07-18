import { ClassElement } from './../generated/ast';
import { ValidationAcceptor } from "langium";
import { EndurantTypes } from "../models/EndurantType";
import { checkCircularSpecializationRecursive } from '../utils/CheckCircularSpecializationRecursive';
// import {OntologicalNature, natureUtils} from '../models/Natures'

// const allowedStereotypeRestrictedToMatches = {
//   [EndurantTypes.ABSTRACT]: [OntologicalNature.abstract],
//   [EndurantTypes.DATATYPE]: [OntologicalNature.abstract],
//   [EndurantTypes.ENUMERATION]: [OntologicalNature.abstract],

//   [EndurantTypes.EVENT]: [OntologicalNature.event],
//   [EndurantTypes.SITUATION]: [OntologicalNature.situation],

//   [EndurantTypes.CATEGORY]: natureUtils.EndurantNatures,
//   [EndurantTypes.MIXIN]: natureUtils.EndurantNatures,
//   [EndurantTypes.ROLE_MIXIN]: natureUtils.EndurantNatures,
//   [EndurantTypes.PHASE_MIXIN]: natureUtils.EndurantNatures,
//   [EndurantTypes.HISTORICAL_ROLE_MIXIN]: natureUtils.EndurantNatures,

//   [EndurantTypes.KIND]: [OntologicalNature.functional_complex],
//   [EndurantTypes.COLLECTIVE]: [OntologicalNature.collective],
//   [EndurantTypes.QUANTITY]: [OntologicalNature.quantity],
//   [EndurantTypes.RELATOR]: [OntologicalNature.relator],
//   [EndurantTypes.MODE]: [OntologicalNature.extrinsic_mode, OntologicalNature.intrinsic_mode],
//   [EndurantTypes.QUALITY]: [OntologicalNature.quality],

//   [EndurantTypes.SUBKIND]: natureUtils.EndurantNatures,
//   [EndurantTypes.ROLE]: natureUtils.EndurantNatures,
//   [EndurantTypes.PHASE]: natureUtils.EndurantNatures,
//   [EndurantTypes.HISTORICAL_ROLE]: natureUtils.EndurantNatures,

//   [EndurantTypes.TYPE]: [OntologicalNature.type]
// };

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

  checkClassElementStartsWithCapital(classElement: ClassElement, accept: ValidationAcceptor): void {
    if (classElement.name) {
        const firstChar = classElement.name.substring(0, 1);
        if (firstChar.toUpperCase() !== firstChar) {
            accept('warning', 'Class name should start with a capital.', { node: classElement, property: 'name' });
        }
    }
  }

  /*
  * Checks if a Rigid stereotype specializes a anti-rigid stereotype
  */
  checkRigidSpecializesAntiRigid(classElement: ClassElement, accept: ValidationAcceptor): void {
    if (!classElement || !classElement.classElementType) {
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
            if (!refElement || !refElement.classElementType) {
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
        if (reference.name) {
          names.push(reference.name)
        }
      }
    })
  }

  /*
  * The element specializations must have ontological natures that are contained in the ontological natures of its superclasses
  */
  checkCompatibleNatures(classElement: ClassElement, accept: ValidationAcceptor): void {
    const ElementNatures = classElement.ontologicalNatures
    if (ElementNatures) {
      classElement.specializationEndurants.forEach(specializationEndurant => {
        let specializationNatures = specializationEndurant.ref?.ontologicalNatures
        specializationNatures?.natures.forEach(nature => {
          let natureExists = ElementNatures.natures.find(item => item === nature)
          if (!natureExists && nature !== 'objects') {
            accept('error', 'This element cannot be restricted to Natures that its superclass is not restricted', { node: classElement, property: 'ontologicalNatures' })
          }
        })
      })
    }
  }

  /*
  * Checks if an Element has a ciclic specialization
  */
  checkCircularSpecialization(classElement: ClassElement, accept: ValidationAcceptor): void {
    classElement.specializationEndurants.forEach(specializationItem => {
        const specItem = specializationItem.ref
        if (!specItem) { return }
        checkCircularSpecializationRecursive(specItem, [], accept)
    })
  }


}