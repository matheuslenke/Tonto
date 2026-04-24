 
import { Class, ClassStereotype, OntologicalNature, Package } from "ontouml-js";
import { ClassDeclaration, OntologicalNature as Nature } from "../../language/generated/ast.js";
import { tontoNatureUtils } from "../../language/models/Natures.js";
import {
    isBaseSortalOntoCategory,
    isNonSortalOntoCategory,
    isUltimateSortalOntoCategory
} from "../../language/models/OntologicalCategory.js";
import { getParentNatures } from "../../language/utils/getParentNatures.js";
import { setTontoSourceName } from "../utils/tontoMetadata.js";
import { getDescription, getMultilingualText } from "./utils/labelUtils.js";

export function classElementGenerator(classElement: ClassDeclaration, packageItem: Package): Class {
    const multiLingualName = getMultilingualText(classElement.label, classElement.name);
    const name = multiLingualName.getText();
    const description = getDescription(classElement.description);
    let createdClass: Class;

    if (classElement?.classElementType) {
        const stereotype = classElement?.classElementType.ontologicalCategory;
        let natures: OntologicalNature[] | undefined = [];
        let firstNature: OntologicalNature | undefined;
        natures = getOntoUMLNatures(classElement, classElement.ontologicalNatures?.natures ?? []);
        if (natures && natures.length > 0) {
            firstNature = natures[0];
        }
        switch (stereotype) {
            /**
       * Non sortals
       */
            case "category": {
                createdClass = packageItem.createCategory(name, natures);
                break;
            }
            case "mixin": {
                createdClass = packageItem.createMixin(name, natures);
                break;
            }
            case "phaseMixin": {
                createdClass = packageItem.createPhaseMixin(name, natures);
                break;
            }
            case "roleMixin": {
                createdClass = packageItem.createRoleMixin(name, natures);
                break;
            }
            case "historicalRoleMixin": {
                createdClass = packageItem.createHistoricalRoleMixin(name, natures);
                break;
            }
            /**
       * Non Endurants
       */
            case "event": {
                createdClass = packageItem.createEvent(name);
                break;
            }
            case "situation": {
                createdClass = packageItem.createSituation(name);
                break;
            }
            case "process": {
                // Compatibility mapping: OntoUML process currently serializes through event in this pipeline.
                createdClass = packageItem.createEvent(name);
                break;
            }
            /**
       * Ultimate Sortals
       */
            case "kind": {
                createdClass = packageItem.createKind(name);
                break;
            }
            case "collective": {
                createdClass = packageItem.createCollective(name);
                break;
            }
            case "quantity": {
                createdClass = packageItem.createQuantity(name);
                break;
            }
            case "quality": {
                createdClass = packageItem.createQuality(name);
                break;
            }
            case "mode": {
                createdClass = packageItem.createClass(name, ClassStereotype.MODE, natures);
                break;
            }
            case "intrinsicMode": {
                createdClass = packageItem.createIntrinsicMode(name);
                break;
            }
            case "extrinsicMode": {
                createdClass = packageItem.createExtrinsicMode(name);
                break;
            }

            /**
       * Base Sortals
       */
            case "subkind": {
                const subkind = packageItem.createSubkind(name, firstNature);
                if (!firstNature) {
                    subkind.restrictedTo = [];
                }
                createdClass = subkind;
                break;
            }
            case "phase": {
                const phase = packageItem.createPhase(name, firstNature);
                if (!firstNature) {
                    phase.restrictedTo = [];
                }
                createdClass = phase;
                break;
            }
            case "role": {
                const role = packageItem.createRole(name, firstNature);
                if (!firstNature) {
                    role.restrictedTo = [];
                }
                createdClass = role;
                break;
            }
            case "historicalRole": {
                if (firstNature) {
                    createdClass = packageItem.createHistoricalRole(name, { restrictedTo: [firstNature] });
                } else {
                    const historicalRole = packageItem.createHistoricalRole(name);
                    // historicalRole.restrictedTo = [];
                    createdClass = historicalRole;
                }
                break;
            }
            case "relator": {
                createdClass = packageItem.createRelator(name);
                break;
            }
            case "type": {
                createdClass = packageItem.createType(name);
                break;
            }
            case "powertype": {
                const powerType = packageItem.createType(name);
                powerType.isPowertype = true;
                createdClass = powerType;
                break;
            }
            /**
       * Undefined stereotype
       */
            case "class": {
                if (classElement.ontologicalNatures?.natures.includes("abstract-individuals")) {
                    createdClass = packageItem.createAbstract(name, { stereotype: ClassStereotype.ABSTRACT });
                } else {
                    createdClass = packageItem.createClass(name, undefined, natures);
                }
                break;
            }
            default:
                createdClass = packageItem.createClass(name);
                break;
        }
    } else {
        createdClass = packageItem.createClass(name);
    }

    createdClass.name = multiLingualName;

    createdClass.id = classElement.name;
    setTontoSourceName(createdClass, classElement.name);

    if (description) {
        createdClass.description = description;
    }

    return createdClass;
}

export function generalizationGenerator(model: Package, sourceClass: Class, targetClass: Class) {
    model.createGeneralization(sourceClass, targetClass);
}

export function createInstantiation(_model: Package, _sourceClass: Class, _targetClass: Class) {
    _model.createInstantiationRelation(_sourceClass, _targetClass);
}

function getOntoUMLNatures(classDeclaration: ClassDeclaration, natures: Nature[]): OntologicalNature[] | undefined {
    /**
   * If it is an UltimateSortal, it already has its own nature
   */
    if (isUltimateSortalOntoCategory(classDeclaration.classElementType.ontologicalCategory)) {
        const nature = tontoNatureUtils.getNatureFromUltimateSortal(classDeclaration);
        if (nature) {
            return [nature];
        }
        /**
         * If it is an BaseSortal, it can have a defined nature from it's parents or a declared one
         */
    } else if (isBaseSortalOntoCategory(classDeclaration.classElementType.ontologicalCategory)) {
        const parentNatures = getParentNatures(classDeclaration, new Set(), []);
        if (natures.length > 0) {
            const specifiedNatures = natures.flatMap((nature) => {
                return tontoNatureUtils.getNatureFromAst(nature);
            });
            return [...Array.from(parentNatures), ...specifiedNatures];
        }
        if (parentNatures.size > 0) {
            return Array.from(parentNatures);
        }
        return undefined;
        /**
         * If it is a Non Sortal, it can have functional-complexes by default, a declared one or based on its supertypes
         */
    } else if (isNonSortalOntoCategory(classDeclaration.classElementType.ontologicalCategory)) {
        if (natures.length > 0) {
            return natures.flatMap((nature) => {
                return tontoNatureUtils.getNatureFromAst(nature);
            });
        } else {
            return tontoNatureUtils.getDefaultNatureFromNonSortal(classDeclaration);
        }
    }
    return undefined;
}
