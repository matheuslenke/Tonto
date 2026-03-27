import { Class, Generalization, GeneralizationSet, Package, Relation } from "ontouml-js";
import { Model } from "../language/index.js";
import { ParseProjectContext, parseProject } from "./utils/parseProject.js";

export interface diagramContent {
    packages: Package,
    class: Array<Class>,
    specializations: Array<Generalization>,
    specializationSets: Array<GeneralizationSet>,
    relations: Array<Relation>
}

export function extractContent(model: Model, name: string | undefined): diagramContent {
    const ctx = <ParseProjectContext>{
        model,
        name,
    };
    return generate(ctx);
}

function generate(ctx: ParseProjectContext): diagramContent {
    // Every OntoUML element can be created from a constructor that can receive a partial object
    // as references for its creation
    const project = parseProject(ctx);
    const packs = project.getAllPackages();
    packs.shift();

    const content: diagramContent = {
        packages: packs[0],
        class: packs[0].getAllClasses(),
        specializations: packs[0].getAllGeneralizations(),
        specializationSets: packs[0].getAllGeneralizationSets(),
        relations: packs[0].getAllRelations()
    };

    content.specializationSets.forEach((genSet) => {
        genSet.generalizations.forEach((genSetGen) => {

            const index = content.specializations.findIndex((gen) => { return gen === genSetGen; });
            if (index >= 0) content.specializations.splice(index, 1);
        });
    });
    return content;
}