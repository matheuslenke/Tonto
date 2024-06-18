import { GeneralizationSet } from "../generated/ast.js";

export function getGensetsWhereSpecific(declaration: string, genSets: GeneralizationSet[]): GeneralizationSet[] {
    return genSets.filter((genSet) => {
        const specificItem = genSet.specificItems.find((specific) => specific.ref?.id === declaration);
        return specificItem ?? undefined;
    });
}
