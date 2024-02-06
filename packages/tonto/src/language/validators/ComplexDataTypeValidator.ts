/* eslint-disable max-len */
import { ValidationAcceptor } from "langium";
import { DataType } from "../generated/ast.js";
import { formPhrase } from "../utils/formPhrase.js";

export class ComplexDataTypeValidator {
  /**
   * Verify if the class is not restricted with an incompatible Nature with this
   * class stereotype.
   */
  checkCompatibleNatures(complexDataType: DataType, accept: ValidationAcceptor): void {
    const elementNatures = complexDataType.ontologicalNature?.natures;
    const wrongNatures = elementNatures?.flatMap((nature) => {
      if (nature !== "abstract-individuals") {
        return nature;
      }
      return [];
    });
    if (wrongNatures && wrongNatures.length > 0) {
      formPhrase;
      accept(
        "error",
        `Incompatible stereotype and Nature restriction combination. Datatype ${
          complexDataType.name
        } is incompatible with the following natures: ${formPhrase(wrongNatures as string[])}`,
        {
          node: complexDataType,
          property: "ontologicalNature",
        }
      );
    }
  }

  checkSpecialization(dataType: DataType, accept: ValidationAcceptor): void {
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
                index,
              }
            );
          }
        } else {
          accept(
            "error",
            "Specialization of a DataType can only be another DataType or a Class with nature 'abstract-individuals'",
            {
              node: dataType,
              property: "specializationEndurants",
              index,
            }
          );
        }
      }
    });
  }
}
