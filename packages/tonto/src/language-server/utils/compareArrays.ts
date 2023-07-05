import { OntologicalNature } from "ontouml-js";

export function compareArrays(array1: OntologicalNature[], array2: OntologicalNature[]): boolean {
  if (array1.length !== array2.length) {
    return false;
  }

  // Sort the arrays to ensure consistent comparison
  const sortedArray1 = array1.sort();
  const sortedArray2 = array2.sort();

  // Compare each element of the arrays
  for (let i = 0; i < sortedArray1.length; i++) {
    if (sortedArray1[i] !== sortedArray2[i]) {
      return false;
    }
  }

  // All elements match
  return true;
}
