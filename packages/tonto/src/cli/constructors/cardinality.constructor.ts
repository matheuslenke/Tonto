
import { CompositeGeneratorNode } from "langium/generate";
import { Cardinality } from "ontouml-js";


export function constructCardinality(cardinality: Cardinality, fileNode: CompositeGeneratorNode) {
    const bounds = cardinality.getCardinalityBounds();
    if (bounds) {
        const targetLowerBound = bounds.lowerBound;
        const targetUpperBound = bounds.upperBound;

        if (targetLowerBound === targetUpperBound) {
            fileNode.append(`[${targetLowerBound}] `);
        } else {
            fileNode.append(` [${targetLowerBound}..${targetUpperBound}] `);
        }
    }
}
