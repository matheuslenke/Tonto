import chalk from "chalk";
import * as fs from "fs";
import { OntoumlElement, OntoumlType, Package, Project } from "ontouml-js";
import path from "path";
import { v4 } from "uuid";
import { formatForId } from "../../utils/replaceWhitespace.js";
import { TontoManifest } from "../TontoManifest.js";
import { PackageDeclarationItem } from "./PackageDeclarationItem.js";
/**
 * Tonto Project element is the main object of the whole project. It contains
 * every package declaration and TontoManifest file
 * 
 */
export class TontoProject {
    ontoumlProject: Project;
    packages: PackageDeclarationItem[];
    packageTable: Package[] = [];
    projectName: string;
    projectSlug: string;
    manifest?: TontoManifest;
    workingDir: string;
    generationPath: string;

    constructor(ontoumlProject: Project, workingDir: string, outDir: string) {
        this.ontoumlProject = ontoumlProject;
        const name: string = ontoumlProject.getNameOrId() ?? v4();
        const packages: PackageDeclarationItem[] = [];
        this.packages = packages;
        this.projectName = name;
        this.projectSlug = formatForId(name);
        this.workingDir = path.dirname(workingDir);
        this.generationPath = path.join(this.workingDir, outDir);
        this.startPackages();

        const allElements: OntoumlElement[] = ontoumlProject.getAllContentsByType(OntoumlType.CLASS_TYPE)
            .concat(ontoumlProject.getAllContentsByType(OntoumlType.RELATION_TYPE))
            .concat(ontoumlProject.getAllContentsByType(OntoumlType.GENERALIZATION_SET_TYPE));


        console.log(chalk.green(`Number of elements in model ${this.projectName}: ${allElements.length}`));
    }

    startPackages() {
        this.packageTable = this.ontoumlProject.getContents()
            .filter(item => item.type === OntoumlType.PACKAGE_TYPE)
            .map(item => item as Package);

        this.packages = this.packageTable.flatMap(ontoumlPackage => {
            try {
                return new PackageDeclarationItem(ontoumlPackage, this.generationPath);
            } catch (error) {
                console.log(error);
            }
            return [];
        });
    }

    addPackage(packageDeclaration: PackageDeclarationItem) {
        this.packages.push(packageDeclaration);
    }

    writeProject(dir: string): void {
        // Create a folder for the Project
        if (!fs.existsSync(this.generationPath)) {
            fs.mkdirSync(this.generationPath);
        }
        const projectFolder = path.join(this.generationPath, this.projectSlug);
        if (!fs.existsSync(projectFolder)) {
            fs.mkdirSync(projectFolder);
        }

        this.packages.forEach(pack => {
            try {
                pack.writePackage();
            } catch (error) {
                console.log(error);
            }
        });

        const createdItems = this.packages.reduce((previous, pack) => pack.getNumberOfInternalElements() + previous, 0);

        console.log(chalk.green(`Created ${createdItems} in Tonto.`));
    }
}