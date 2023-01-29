import {
  NonSortal,
  OntologicalNature,
  Sortal,
  UltimateSortal,
} from "../generated/ast";

function checkNatureCompatibleWithStereotype(
  nature: OntologicalNature,
  stereotype: UltimateSortal | NonSortal | Sortal | undefined | string
): boolean {
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

    case "quantities":
      if (stereotype === "quantity") {
        return true;
      }
      return false;

    case "types":
      if (stereotype === "type") {
        return true;
      }
      return false;

    default:
      return false;
  }
}

export { checkNatureCompatibleWithStereotype };
