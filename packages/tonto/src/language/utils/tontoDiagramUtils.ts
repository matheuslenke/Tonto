import { ClassDeclaration, ContextModule, DataTypeOrClassOrRelation, ElementRelation, Model } from "../generated/ast.js";

export type Specialization = {
    from: ClassDeclaration;
    to: ClassDeclaration;
}

export class TontoDiagramUtils {
    model: ContextModule;
    referencedModels: Map<ContextModule, DataTypeOrClassOrRelation[]> = new Map();

    constructor(model: ContextModule) {
        this.model = model;
    }

    public getClassDeclarations(): ClassDeclaration[] {
        return this.model.declarations
            .filter(item => item.$type === "ClassDeclaration")
            .map(d => d as ClassDeclaration);
    }

    getRelations(): ElementRelation[] {
        const internalRelations = this.model.declarations
            .filter(item => item.$type === "ClassDeclaration")
            .map(d => d as ClassDeclaration)
            .flatMap(d => d.references)
            .filter(item => item.$type === "ElementRelation")
            .map(d => d as ElementRelation)
            .filter(d => d.secondEnd.ref?.$container.name === this.model.name);
        const externalRelations = this.model.declarations
            .filter(item => item.$type === "ElementRelation")
            .map(d => d as ElementRelation)
            .filter(d => d.firstEnd?.ref?.$container.name === this.model.name
                && d.secondEnd.ref?.$container.name === this.model.name);
        return [...internalRelations, ...externalRelations];
    }

    getSpecializations(withExternal: boolean): Specialization[] {
        return this.model.declarations.filter(item => item.$type === "ClassDeclaration")
            .map(d => d as ClassDeclaration)
            .flatMap(classD => {
                let specializations = classD.specializationEndurants
                    .flatMap(s => s.ref ?? []);
                if (!withExternal) {
                    specializations = specializations
                        .filter(s => s.$container.name === this.model.name);
                }
                const specs: Specialization[] = specializations.map(specialization => {
                    return {
                        from: classD,
                        to: specialization
                    };
                });
                return specs;
            });
    }

    getReferencedClasses(): Map<ContextModule, DataTypeOrClassOrRelation[]> {
        const referencedModels = new Map<ContextModule, DataTypeOrClassOrRelation[]>();

        // Find all classes that are specialized
        this.getClassDeclarations()
            .forEach(classD => {
                classD.specializationEndurants
                    .forEach(specialization => {
                        const ref = specialization.ref;
                        if (ref) {
                            const model = ref.$container.$container as Model;
                            if (model.module.name !== this.model.name) {
                                if (!referencedModels.has(model.module)) {
                                    referencedModels.set(model.module, []);
                                }
                                referencedModels.get(model.module)?.push(ref);
                            }
                        }
                    });
                // Find reference from relations inside the class
                classD.references.forEach(relation => {
                    this.addReferencedClasses(relation, referencedModels);
                });
            });
        // Find references from relations
        this.getRelations()
            .forEach(relation => {
                this.addReferencedClasses(relation, referencedModels);
            });

        return referencedModels;
    }

    protected addReferencedClasses(
        relation: ElementRelation,
        referencedModels: Map<ContextModule, DataTypeOrClassOrRelation[]>
    ): void {
        const source = relation.firstEnd;
        const target = relation.secondEnd;
        if (!source || !target) {
            return;
        }
        const sourceModel = source.ref?.$container as ContextModule;
        const targetModel = target.ref?.$container as ContextModule;
        if (sourceModel.name !== this.model.name) {
            if (!referencedModels.has(sourceModel)) {
                referencedModels.set(sourceModel, []);
            }
            if (source.ref) {
                referencedModels.get(sourceModel)?.push(source.ref);
            }
        }
        if (targetModel.name !== this.model.name) {
            if (!referencedModels.has(targetModel)) {
                referencedModels.set(targetModel, []);
            }
            if (target.ref) {
                referencedModels.get(targetModel)?.push(target.ref);
            }
        }
    }
}