import { OntologicalNature } from "ontouml-js";
import { ClassDeclaration, isUltimateSortal, OntologicalNature as ASTNature } from "../generated/ast.js";
import { isNonSortalOntoCategory } from "./OntologicalCategory.js";

function getNatureFromAst(nature: ASTNature): OntologicalNature[] {
    switch (nature) {
        case "collectives":
            return [OntologicalNature.collective];
        case "extrinsic-modes":
            return [OntologicalNature.extrinsic_mode];
        case "intrinsic-modes":
            return [OntologicalNature.intrinsic_mode];
        case "functional-complexes":
            return [OntologicalNature.functional_complex];
        case "objects":
            return [OntologicalNature.functional_complex, OntologicalNature.collective, OntologicalNature.quantity];
        case "qualities":
            return [OntologicalNature.quality];
        case "quantities":
            return [OntologicalNature.quantity];
        case "relators":
            return [OntologicalNature.relator];
        case "types":
            return [OntologicalNature.type];
        case "abstract-individuals":
            return [OntologicalNature.abstract];
        case "events":
            return [OntologicalNature.event];
        case "situations":
            return [OntologicalNature.situation];
        default:
            return [];
    }
}

function getAstNatureFromOntoumljs(nature: OntologicalNature): string {
    switch (nature) {
        case OntologicalNature.functional_complex:
            return "functional-complexes";
        case OntologicalNature.collective:
            return "collectives";
        case OntologicalNature.quantity:
            return "quantities";
        case OntologicalNature.relator:
            return "relators";
        case OntologicalNature.intrinsic_mode:
            return "intrinsic-modes";
        case OntologicalNature.extrinsic_mode:
            return "extrinsic-modes";
        case OntologicalNature.quality:
            return "qualities";
        case OntologicalNature.event:
            return "events";
        case OntologicalNature.situation:
            return "situations";
        case OntologicalNature.type:
            return "types";
        case OntologicalNature.abstract:
            return "abstract-individuals";
    }
}

function getNatureFromUltimateSortal(classDeclaration: ClassDeclaration): OntologicalNature | undefined {
    if (isUltimateSortal(classDeclaration?.classElementType.ontologicalCategory)) {
        switch (classDeclaration?.classElementType.ontologicalCategory) {
            case "collective":
                return OntologicalNature.collective;
            case "extrinsicMode":
                return OntologicalNature.extrinsic_mode;
            case "intrinsicMode":
                return OntologicalNature.intrinsic_mode;
            case "kind":
                return OntologicalNature.functional_complex;
            case "mode":
                return OntologicalNature.intrinsic_mode;
            case "powertype":
                return OntologicalNature.type;
            case "quality":
                return OntologicalNature.quality;
            case "quantity":
                return OntologicalNature.quantity;
            case "relator":
                return OntologicalNature.relator;
            case "type":
                return OntologicalNature.type;
        }
    }
    return undefined;
}

function getDefaultNatureFromNonSortal(classDeclaration: ClassDeclaration): OntologicalNature[] {
    if (isNonSortalOntoCategory(classDeclaration.classElementType.ontologicalCategory)) {
        return [OntologicalNature.functional_complex];
    }
    if (classDeclaration.classElementType.ontologicalCategory === "class") {
        return Object.values(OntologicalNature);
    }
    return [];
}

export const tontoNatureUtils = {
    getNatureFromAst,
    getNatureFromUltimateSortal,
    getDefaultNatureFromNonSortal,
    getAstNatureFromOntoumljs,
};
