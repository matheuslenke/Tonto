import { Class, Package, Relation } from "ontouml-js";
import { ClassDeclaration, ContextModule } from "../../language/index.js";
import {
    JSON_GENERATION_STEPS,
    createJsonGenerationError,
    createJsonGenerationNodeInfo,
} from "../requests/jsonGeneration.js";
import { createInstantiation } from "./class.generator.js";

export function generateInstantiations(
    contextModule: ContextModule,
    classes: Class[],
    _relations: Relation[],
    packageItem: Package,
    resolveClass?: (classDeclaration: ClassDeclaration | undefined) => Class | undefined
): void {
    contextModule.declarations.forEach((declaration) => {
        if (declaration.$type === "ClassDeclaration") {
            const classElement = declaration as ClassDeclaration;
            const instanceOfClass = classElement.instanceOf?.ref;

            if (instanceOfClass) {
                const sourceClass = resolveClass?.(classElement)
                    ?? classes.find((item) => item.id === classElement.name);

                if (!sourceClass) {
                    throw createJsonGenerationError(`Could not generate instantiation for "${classElement.name}".`, {
                        step: JSON_GENERATION_STEPS.instantiationGeneration,
                        info: [
                            createJsonGenerationNodeInfo(classElement, {
                                code: "missing_instantiation_source",
                                title: "Instantiation source was not generated",
                                description: `Class "${classElement.name}" in package "${contextModule.name}" was not generated before its instanceOf relation was processed.`,
                            }),
                        ],
                    });
                }

                const targetClass = resolveClass?.(instanceOfClass)
                    ?? classes.find((item) => item.id === instanceOfClass.name);
                if (!targetClass) {
                    throw createJsonGenerationError(`Could not generate instantiation for "${classElement.name}".`, {
                        step: JSON_GENERATION_STEPS.instantiationGeneration,
                        info: [
                            createJsonGenerationNodeInfo(classElement, {
                                code: "missing_instantiation_target",
                                title: "Unresolved instanceOf target",
                                description: `Class "${classElement.name}" instantiates "${classElement.instanceOf?.$refText ?? instanceOfClass.name}", but that target class was not generated.`,
                            }),
                        ],
                    });
                }

                createInstantiation(packageItem, targetClass, sourceClass);
            }
        }
    });
}
