import chalk from "chalk";
import { CompositeGeneratorNode, toString } from "langium/generate";
import * as fs from "node:fs";
import { Class, ClassStereotype, GeneralizationSet, OntoumlType, Package } from "ontouml-js";
import path from "path";
import { formatForId } from "../../utils/replaceWhitespace.js";
import { ASTDeclarationItem } from "./AstDeclarationItem.js";
import { ClassDeclarationItem } from "./ClassDeclarationItem.js";
import { ClassDeclarationOrDatatypeItem, DataTypeItem } from "./DatatypeItem.js";
import { EnumItem } from "./EnumItem.js";
import { GenSetItem } from "./GensetItem.js";

export class PackageDeclarationItem extends ASTDeclarationItem {
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

    constructor(ontoumlPackage: Package, dir: string) {
        super();
        this.dir = dir;
        this.name = ontoumlPackage.getNameOrId();
        this.nameSlug = formatForId(this.name);
        const internalPackages = ontoumlPackage.getContents()
            .filter(item => item.type === OntoumlType.PACKAGE_TYPE)
            .map(item => item as Package);
        ;
        this.packages = internalPackages.map(pack => new PackageDeclarationItem(pack, path.join(this.dir, this.nameSlug)));

        try {
            this.classDeclarations = this.getClasses(ontoumlPackage);
            this.datatypes = this.getDatatypes(ontoumlPackage);
            this.enumerations = this.getEnumerations(ontoumlPackage);
            this.genSets = this.getGensets(ontoumlPackage);

            this.getImports();
        } catch (error) {
            console.log(chalk.red("Error creating Package " + this.name, error));
        }
    }

    getImports() {
        this.classDeclarations
            .map(item => item as ClassDeclarationItem)
            .filter(item => item !== undefined)
            .flatMap(item => item.getReferencedPackages())
            .forEach(pack => {
                this.imports.set(formatForId(pack.getNameOrId()), pack);
            });

        this.genSets.
            flatMap(item => item.getReferencedPackages())
            .forEach(item => {
                this.imports.set(formatForId(item.getNameOrId()), item);
            });

        this.datatypes.flatMap(item => item.getReferencedPackages())
            .forEach(item => {
                this.imports.set(formatForId(item.getNameOrId()), item);
            });
    }

    getClasses(ontoumlPackage: Package): ClassDeclarationItem[] {
        return ontoumlPackage.getContents()
            .filter(item => item.type === OntoumlType.CLASS_TYPE)
            .filter(item => item instanceof Class)
            .map(item => item as Class)
            .filter((item: Class) => (item.stereotype !== ClassStereotype.ENUMERATION &&
                item.stereotype !== ClassStereotype.DATATYPE))
            .map((item: Class) => new ClassDeclarationItem(item, this.nameSlug));
    }

    getDatatypes(ontoumlPackage: Package): DataTypeItem[] {
        return ontoumlPackage.getContents()
            .filter(item => item.type === OntoumlType.CLASS_TYPE)
            .map(item => item as Class)
            .filter(item => item.stereotype === ClassStereotype.DATATYPE)
            .map(item => new DataTypeItem(item));
    }

    getEnumerations(ontoumlPackage: Package): EnumItem[] {
        return ontoumlPackage.getContents()
            .filter(item => item.type === OntoumlType.CLASS_TYPE)
            .map(item => item as Class)
            .filter(item => item.stereotype === ClassStereotype.ENUMERATION)
            .map(item => new EnumItem(item));
    }

    getGensets(ontoumlPackage: Package): GenSetItem[] {
        return ontoumlPackage.getContents()
            .filter(item => item.type === OntoumlType.GENERALIZATION_SET_TYPE)
            .map(item => item as GeneralizationSet)
            .map(item => new GenSetItem(item));
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
    }

    override getNumberOfInternalElements(): number {
        const packageElements = this.packages.reduce((previous, item) => previous + item.getNumberOfInternalElements(), 0);
        const classes = this.classDeclarations.reduce((previous, item) => item.getNumberOfInternalElements() + previous, 0);
        const datatypes = this.datatypes.reduce((previous, item) => item.getNumberOfInternalElements() + previous, 0);
        const enums = this.enumerations.reduce((previous, item) => item.getNumberOfInternalElements() + previous, 0);
        const genSets = this.genSets.reduce((previous, item) => previous + item.getNumberOfInternalElements(), 0);

        return classes + datatypes + enums + genSets + packageElements;
    }
}