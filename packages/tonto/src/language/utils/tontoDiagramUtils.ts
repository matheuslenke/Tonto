import { ClassDeclaration, DataTypeOrClassOrRelation, ElementRelation, Model, PackageDeclaration } from "../generated/ast.js";

export type Specialization = {
    from: ClassDeclaration;
    to: ClassDeclaration;
}

export class TontoDiagramUtils {
    model: PackageDeclaration;
    referencedModels: Map<PackageDeclaration, DataTypeOrClassOrRelation[]> = new Map();

    constructor(model: PackageDeclaration) {
        this.model = model;
    }

    public getClassDeclarations(): ClassDeclaration[] {
        return this.model.declarations
            .filter(item => item.$type === "ClassDeclaration")
            .map(d => d as ClassDeclaration);
    }

    getRelations(): ElementRelation[] {
        // const internalRelations = this.model.declarations
        //     .filter(item => item.$type === "ClassDeclaration")
        //     .map(d => d as ClassDeclaration)
        //     .flatMap(d => d.references)
        //     .filter(item => item.$type === "ElementRelation")
        //     .map(d => d as ElementRelation)
        //     .filter(d => d.secondEnd.ref?.$container.id === this.model.id);
        // const externalRelations = this.model.declarations
        //     .filter(item => item.$type === "ElementRelation")
        //     .map(d => d as ElementRelation)
        //     .filter(d => d.firstEnd?.ref?.$container.id === this.model.id
        //         && d.secondEnd.ref?.$container.id === this.model.id);
        // return [...internalRelations, ...externalRelations];
        return [];
    }

    getSpecializations(withExternal: boolean): Specialization[] {
        return this.model.declarations.filter(item => item.$type === "ClassDeclaration")
            .map(d => d as ClassDeclaration)
            .flatMap(classD => {
                let specializations = classD.specializationEndurants
                    .flatMap(s => s.ref ?? []);
                if (!withExternal) {
                    specializations = specializations
                        .filter(s => s.$container.id === this.model.id);
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

    getReferencedClasses(): Map<PackageDeclaration, DataTypeOrClassOrRelation[]> {
        const referencedModels = new Map<PackageDeclaration, DataTypeOrClassOrRelation[]>();

        // Find all classes that are specialized
        this.getClassDeclarations()
            .forEach(classD => {
                classD.specializationEndurants
                    .forEach(specialization => {
                        const ref = specialization.ref;
                        if (ref) {
                            const model = ref.$container.$container as Model;
                            if (model.module && model.module.id !== this.model.id) {
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
        referencedModels: Map<PackageDeclaration, DataTypeOrClassOrRelation[]>
    ): void {
        // const source = relation.firstEnd;
        // const target = relation.secondEnd;
        // if (!source || !target) {
        //     return;
        // }
        // const sourceModel = source.ref?.$container as PackageDeclaration;
        // const targetModel = target.ref?.$container as PackageDeclaration;
        // if (sourceModel.id !== this.model.id) {
        //     if (!referencedModels.has(sourceModel)) {
        //         referencedModels.set(sourceModel, []);
        //     }
        //     if (source.ref) {
        //         referencedModels.get(sourceModel)?.push(source.ref);
        //     }
        // }
        // if (targetModel.id !== this.model.id) {
        //     if (!referencedModels.has(targetModel)) {
        //         referencedModels.set(targetModel, []);
        //     }
        //     if (target.ref) {
        //         referencedModels.get(targetModel)?.push(target.ref);
        //     }
        // }
    }
}