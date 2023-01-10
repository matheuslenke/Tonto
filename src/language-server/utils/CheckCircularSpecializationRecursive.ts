import { ValidationAcceptor } from "langium";
import { ClassDeclaration, GeneralizationSet } from "../generated/ast";

const checkCircularSpecializationRecursive = (
  actualElement: ClassDeclaration,
  verificationList: ClassDeclaration[],
  genSets: GeneralizationSet[],
  accept: ValidationAcceptor
): void => {
  actualElement.specializationEndurants.forEach((specializationItem) => {
    const specItem = specializationItem.ref;
    if (!specItem) {
      return;
    }
    const specializationExists = verificationList.find(
      (item) => item.name === specItem.name
    );

    if (specializationExists) {
      accept(
        "error",
        "There is a ciclic specialization. Please review all Elements specializations",
        { node: actualElement, property: "specializationEndurants" }
      );
      accept(
        "error",
        "There is a ciclic specialization. Please review all Elements specializations",
        { node: specItem, property: "name" }
      );
      return;
    }
    const newVerificationList = [...verificationList, actualElement];
    checkCircularSpecializationRecursive(specItem, newVerificationList, [], accept);
  });
};

export { checkCircularSpecializationRecursive };
