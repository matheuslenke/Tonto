import { Endurant } from './../generated/ast';
import { EndurantTypes } from './../models/EndurantType';
import { ValidationAcceptor } from "langium";
import { Endurant as EndurantModel} from '../models/Endurant'

export class EndurantValidator {
  checkEndurantIsValid(endurantItem: Endurant, accept: ValidationAcceptor): void {

  }

  checkKindSpecialization(endurantItem: Endurant, accept: ValidationAcceptor): void {
    const endurantType = endurantItem.type.stereotype
    if (endurantType === EndurantTypes.KIND || endurantType === EndurantTypes.SUBKIND  ) {
      const endurant = new EndurantModel()
      endurant.type = EndurantTypes.KIND

      endurantItem.specializationEndurants.forEach( specializationItem => {
        const refElement = specializationItem.ref?.$cstNode?.element as Endurant
        const refType = refElement.type.stereotype

        console.log(refType)
        if( refType === EndurantTypes.KIND || refType === EndurantTypes.COLLECTIVE ||
          refType === EndurantTypes.QUANTITY ||
          refType === EndurantTypes.QUALITY || refType === EndurantTypes.MODE ) {
          console.log("Error na referencia")
          accept('error', 'Every sortal class must specialize a unique ultimate sortal (Kind, Collective, Quantity, Relator, Quality or mode', {node: endurantItem, property: 'name'} )
        }
      })

      // const ultimateSortalAncestors = _class.getUltimateSortalAncestors();

      // if (_class.hasUltimateSortalStereotype() && ultimateSortalAncestors.length > 0) {
      //   return VerificationIssue.createClassIdentityProviderSpecialization(_class, ultimateSortalAncestors);
      // } else if (!_class.hasUltimateSortalStereotype() && ultimateSortalAncestors.length > 1) {
      //   return VerificationIssue.createClassMultipleIdentityProviders(_class, ultimateSortalAncestors);
      // } else if (!_class.hasUltimateSortalStereotype() && ultimateSortalAncestors.length === 0 && !_class.isRestrictedToType()) {
      //   // TODO: review this coding based on language updates
      //   return VerificationIssue.createClassMissingIdentityProvider(_class);
      // }
    }
  }
}