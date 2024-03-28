import chalk from "chalk";
import { CompositeGeneratorNode, toString } from "langium/generate";
import * as fs from "node:fs";
import { Class, ClassStereotype, GeneralizationSet, OntoumlType, Package, Relation } from "ontouml-js";
import path from "path";
import { formatForId } from "../../utils/replaceWhitespace.js";
import { ASTDeclarationItem } from "./AstDeclarationItem.js";
import { ClassDeclarationItem } from "./ClassDeclarationItem.js";
import { ClassDeclarationOrDatatypeItem, DataTypeItem } from "./DatatypeItem.js";
import { EnumItem } from "./EnumItem.js";
import { GenSetItem } from "./GensetItem.js";
import { RelationItem } from "./RelationItem.js";

export class PackageDeclarationItem extends ASTDeclarationItem {
    ontoumlPackage: Package;
    isGlobal: boolean = false;
    name: string;
    nameSlug: string;
    imports: Map<string, Package> = new Map();
    packages: PackageDeclarationItem[] = [];
    classDeclarations: ClassDeclarationOrDatatypeItem[] = [];
    datatypes: DataTypeItem[] = [];
    enumerations: EnumItem[] = [];
    genSets: GenSetItem[] = [];
    dir: string;
    relations: RelationItem[] = [];

    constructor(ontoumlPackage: Package, dir: string) {
        super();
        this.ontoumlPackage = ontoumlPackage;
        this.dir = dir;
        this.name = ontoumlPackage.getNameOrId();
        this.nameSlug = formatForId(this.name);
        const internalPackages = ontoumlPackage.getContents()
            .filter(item => item.type === OntoumlType.PACKAGE_TYPE)
            .map(item => item as Package);
        ;
        this.packages = internalPackages.map(pack => new PackageDeclarationItem(pack, path.join(this.dir, this.nameSlug)));

        try {
            this.classDeclarations = this.getClasses();
            this.datatypes = this.getDatatypes();
            this.enumerations = this.getEnumerations();
            this.genSets = this.getGensets();
            const relations = this.getRelations();
            this.addRelationsToClasses(relations);

            this.getImports();
        } catch (error) {
            console.log(chalk.red("Error creating Package " + this.name, error));
        }
    }

    getInternalPackages(): PackageDeclarationItem[] {
        const internal = this.packages.flatMap(pack => pack.getInternalPackages());
        return [...internal, this];
    }

    getImports() {
        this.classDeclarations
            .map(item => item as ClassDeclarationItem)
            .filter(item => item !== undefined)
            .flatMap(item => item.getReferencedPackages())
            .forEach(pack => {
                this.imports.set(formatForId(pack.getNameOrId()), pack);
            });

        // this.genSets.
        //     flatMap(item => item.getReferencedPackages())
        //     .forEach(item => {
        //         this.imports.set(formatForId(item.getNameOrId()), item);
        //     });

        this.datatypes.flatMap(item => item.getReferencedPackages())
            .forEach(item => {
                this.imports.set(formatForId(item.getNameOrId()), item);
            });
        this.relations.flatMap(item => item.getReferencedPackages())
            .forEach(item => {
                this.imports.set(formatForId(item.getNameOrId()), item);
            });
    }

    getClasses(): ClassDeclarationItem[] {
        return this.ontoumlPackage.getContents()
            .filter(item => item.type === OntoumlType.CLASS_TYPE)
            .filter(item => item instanceof Class)
            .map(item => item as Class)
            .filter((item: Class) => (item.stereotype !== ClassStereotype.ENUMERATION &&
                item.stereotype !== ClassStereotype.DATATYPE))
            .flatMap((item: Class) => {
                try {
                    return new ClassDeclarationItem(item, this.nameSlug);
                } catch (error) {
                    console.log(`Error creating class ${item.name}`);
                }
                return [];
            });
    }

    getDatatypes(): DataTypeItem[] {
        return this.ontoumlPackage.getContents()
            .filter(item => item.type === OntoumlType.CLASS_TYPE)
            .map(item => item as Class)
            .filter(item => item.stereotype === ClassStereotype.DATATYPE)
            .map(item => new DataTypeItem(item));
    }

    getEnumerations(): EnumItem[] {
        return this.ontoumlPackage.getContents()
            .filter(item => item.type === OntoumlType.CLASS_TYPE)
            .map(item => item as Class)
            .filter(item => item.stereotype === ClassStereotype.ENUMERATION)
            .map(item => new EnumItem(item));
    }

    getGensets(): GenSetItem[] {
        return this.ontoumlPackage.getContents()
            .filter(item => item.type === OntoumlType.GENERALIZATION_SET_TYPE)
            .map(item => item as GeneralizationSet)
            .flatMap(item => {
                try {
                    return new GenSetItem(item);
                } catch (error) {
                    console.log(`Error creating Genset[${item.getNameOrId()}]: ${error}`);
                    return [];
                }
            });
    }

    getRelations(): RelationItem[] {
        return this.ontoumlPackage.getContents()
            .filter(item => item.type === OntoumlType.RELATION_TYPE)
            .map(item => item as Relation)
            .filter(item => item.container.id === this.ontoumlPackage.id)
            .flatMap(item => {
                try {
                    return new RelationItem(item, true);
                } catch (error) {
                    console.log(`Error creating Relation${item.getNameOrId()} : ${error}`);
                    return [];
                }
            });
    }

    addRelationsToClasses(relations: RelationItem[]) {
        const relationsWithClasses = relations
            .filter(item => item.firstEnd?.propertyType?.type === OntoumlType.CLASS_TYPE)
            .filter(relation => relation.firstEnd?.propertyType !== undefined && relation.secondEnd?.propertyType !== undefined);
        const relationsPerClass: Map<ClassDeclarationItem, RelationItem[]> = new Map();
        this.classDeclarations.map(item => {
            if (item instanceof ClassDeclarationItem) {
                const relations = relationsWithClasses.filter(relation => formatForId(relation.firstEnd?.propertyType?.getName()) === item.name);
                relationsPerClass.set(item, relations);
            }
        });

        this.classDeclarations.forEach(item => {
            if (item instanceof ClassDeclarationItem) {
                const relationItem = relationsPerClass.get(item);
                item.addRelations(relationItem ?? []);
            }
        });

        this.relations = relations.filter(item => item.firstEnd?.type !== OntoumlType.CLASS_TYPE) ?? [];
    }

    writePackage(): void {
        const node = new CompositeGeneratorNode();
        const packageDirPath = path.join(this.dir, this.nameSlug);
        if (!fs.existsSync(packageDirPath)) {
            fs.mkdirSync(packageDirPath);
        }
        this.writeToNode(node);

        const packagePath = path.join(packageDirPath, this.nameSlug + ".tonto");

        fs.writeFileSync(packagePath, toString(node));

        this.packages.forEach(pack => pack.writePackage());
    }

    override writeToNode(node: CompositeGeneratorNode): void {
        for (const importedItem of this.imports) {
            node.append(`import ${formatForId(importedItem[1].getNameOrId())}`).appendNewLine();
        }
        node.appendNewLine();
        node.append(`package ${this.nameSlug}`).appendNewLine().appendNewLine();

        this.classDeclarations.forEach(classDeclaration => {
            classDeclaration.writeToNode(node);
            node.appendNewLine().appendNewLine();
        });

        this.datatypes.forEach(datatype => {
            datatype.writeToNode(node);
            node.appendNewLine();
        });

        this.enumerations.forEach(enumeration => {
            enumeration.writeToNode(node);
            node.appendNewLine();
        });

        this.genSets.forEach(genSet => {
            genSet.writeToNode(node);
            node.appendNewLine();
        });

        this.relations.forEach(relation => {
            relation.writeToNode(node);
            node.appendNewLine();
        });
    }

    getElementNames(): string[] {
        const classNames = this.classDeclarations.map(item => item.name);
        const datatypeNames = this.datatypes.map(item => item.name);
        const enumNames = this.enumerations.map(item => item.name);
        // const attributeNames = this..map(item => item.name);
        return [...classNames, ...datatypeNames, ...enumNames];
    }

    override getNumberOfInternalElements(): number {
        const classes = this.classDeclarations.reduce((previous, item) => item.getNumberOfInternalElements() + previous, 0);
        const datatypes = this.datatypes.reduce((previous, item) => item.getNumberOfInternalElements() + previous, 0);
        const enums = this.enumerations.reduce((previous, item) => item.getNumberOfInternalElements() + previous, 0);
        const genSets = this.genSets.reduce((previous, item) => previous + item.getNumberOfInternalElements(), 0);
        const relations = this.relations.reduce((previous, item) => previous + item.getNumberOfInternalElements(), 0);

        const total = classes + datatypes + enums + genSets + relations;
        console.log(`Package ${this.name}: ${total} with ${this.classDeclarations.length} classes and ${this.relations.length} relations`);
        return total;
    }
}