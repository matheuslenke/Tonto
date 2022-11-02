import {
  BaseSortalStereotype,
  NonSortalStereotype,
  OntologicalNature,
  UltimateSortalStereotypes,
} from "../generated/ast";

function checkNatureCompatibleWithStereotype(
  nature: OntologicalNature,
  stereotype:
    | BaseSortalStereotype
    | NonSortalStereotype
    | UltimateSortalStereotypes
    | undefined
) {
  switch (nature) {
    case "relators":
      if (stereotype === "relator") {
        return true;
      }
      return false;

    case "collectives":
      if (stereotype === "collective") {
        return true;
      }
      return false;

    case "events":
      if (stereotype === "event") {
        return true;
      }
      return false;
    case "extrinsic-modes":
      if (stereotype === "extrinsicMode") {
        return true;
      }
      return false;
    case "functional-complexes":
      return true;

    case "intrinsic-modes":
      if (stereotype === "intrinsicMode") {
        return true;
      }
      return false;

    case "objects":
      return true;

    case "qualities":
      if (stereotype === "quality") {
        return true;
      }
      return false;

    case "types":
      return true;

    default:
      return true;
  }
}

export { checkNatureCompatibleWithStereotype };
