/* eslint-disable max-len */
import { ValidationAcceptor } from "langium";
import { DataType } from "../generated/ast";
import { natureUtils } from "../models/Natures";
import { OntologicalCategoryEnum } from "../models/OntologicalCategory";
import { allowedStereotypeRestrictedToMatches } from "../models/StereotypeUtils";
import { formPhrase } from "../utils/formPhrase";

export class ComplexDataTypeValidator {
  /**
   * Verify if the class is not restricted with an incompatible Nature with this
   * class stereotype.
   */
  checkCompatibleNatures(
    complexDataType: DataType,
    accept: ValidationAcceptor
  ): void {
    const elementNatures = complexDataType.ontologicalNature?.natures;
    const ontologicalCategory = OntologicalCategoryEnum.DATATYPE;

    if (elementNatures) {
      const incompatibleNatures = elementNatures.filter((nature) => {
        const realNature = natureUtils.getNatureFromAst(nature);
        if (realNature) {
          const stereotypeMatches =
            allowedStereotypeRestrictedToMatches[ontologicalCategory];
          const includesNature =
            !allowedStereotypeRestrictedToMatches[ontologicalCategory].includes(
              realNature
            );
          return stereotypeMatches && includesNature;
        }
        return false;
      });
      if (incompatibleNatures.length >= 1) {
        const naturesString = formPhrase(incompatibleNatures);
        accept(
          "error",
          `Incompatible stereotype and Nature restriction combination. Class ${complexDataType.name} has its value for 'restrictedTo' incompatible with the following natures: ${naturesString}`,
          {
            node: complexDataType,
            property: "name",
          }
        );
      }
    }
  }

  checkSpecialization(
    dataType: DataType,
    accept: ValidationAcceptor
  ): void {
    const specializationItems = dataType.specializationEndurants;

    specializationItems.forEach((specializationItem, index) => {
      const specItem = specializationItem.ref;
      if (!specItem) {
        return;
      }
      const type = specItem.$type;
      if (type === "ClassDeclaration") {
        const stereotype = specItem.classElementType;
        if (stereotype.ontologicalCategory === "class") {
          if (!specItem.ontologicalNatures?.natures.includes("abstract-individuals")) {
            accept(
              "error",
              "Specialization of a DataType can only be another DataType or a Class with nature 'abstract-individuals'",
              {
                node: dataType,
                property: "specializationEndurants",
                index
              }
            );
          }
        }
        else {
          accept(
            "error",
            "Specialization of a DataType can only be another DataType or a Class with nature 'abstract-individuals'",
            {
              node: dataType,
              property: "specializationEndurants",
              index
            }
          );
        }
      }
    });
  }
}
