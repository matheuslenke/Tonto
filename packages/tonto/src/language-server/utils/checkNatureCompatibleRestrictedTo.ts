import {
  OntologicalNature,
} from "../generated/ast";

function checkNatureCompatibleRestrictedTo(
  generalNature: OntologicalNature,
  specificNature: OntologicalNature
): boolean {
  if (generalNature === "objects") {
    return true;
  }
  return generalNature === specificNature;
}

export { checkNatureCompatibleRestrictedTo };
