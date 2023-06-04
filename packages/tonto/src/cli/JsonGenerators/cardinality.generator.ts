import { Property, CardinalityValues } from "ontouml-js";
import { Cardinality } from "../../language-server/generated/ast";

export function setPropertyCardinality(
  cardinality: Cardinality | undefined,
  end: Property
): void {
  if (!cardinality) {
    end.cardinality.setOneToOne(); // Default Value
    return;
  }

  if (cardinality.lowerBound === "*") {
    end.cardinality.setZeroToMany();
    return;
  }
  if (typeof cardinality.lowerBound === "number") {
    end.cardinality.setLowerBoundFromNumber(cardinality.lowerBound);
    // end.cardinality.setUpperBoundFromNumber(cardinality.lowerBound);
  }
  if (cardinality.upperBound && cardinality.upperBound === "*") {
    end.cardinality.upperBound = CardinalityValues.MANY;
  } else if (
    cardinality.upperBound &&
    typeof cardinality.upperBound === "number"
  ) {
    end.cardinality.setUpperBoundFromNumber(cardinality.upperBound);
  }
}