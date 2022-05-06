import { EndurantTypes } from './../models/EndurantType';
import { ValidationAcceptor } from "langium";
import { Endurant } from "../generated/ast";
import { Endurant as EndurantModel} from '../models/Endurant'

export class EndurantValidator {
  checkEndurantIsValid(endurantItem: Endurant, accept: ValidationAcceptor): void {

  }

  checkKindSpecialization(endurantItem: Endurant, accept: ValidationAcceptor): void {
    if (endurantItem.$type === EndurantTypes.KIND) {
      const endurant = new EndurantModel()
      endurant.type = EndurantTypes.KIND

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