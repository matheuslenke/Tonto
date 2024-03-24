import chalk from "chalk";
import * as fs from "fs";
import { OntoumlType, Package, Project } from "ontouml-js";
import path from "path";
import { v4 } from "uuid";
import { formatForId } from "../../utils/replaceWhitespace.js";
import { TontoManifest } from "../grammar/TontoManifest.js";
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
        this.packages = [];
        this.projectName = name;
        this.projectSlug = formatForId(name);
        this.workingDir = path.dirname(workingDir);
        this.generationPath = path.join(this.workingDir, outDir);
        this.startPackages();

        const elementsCount = ontoumlProject.getAllPackages().reduce((previous, pack) => {
            const classes = pack.getContents().filter(item =>
                item.type === OntoumlType.CLASS_TYPE
            );
            const gensets = pack.getContents().filter(item =>
                item.type === OntoumlType.GENERALIZATION_SET_TYPE
            );
            const relations = pack.getContents().filter(item =>
                item.type === OntoumlType.RELATION_TYPE
            );
            const total = classes.length + gensets.length + relations.length;
            console.log(`Package ${pack.getNameOrId()}: ${classes.length} classes, ${gensets.length} gensets, ${relations.length} relations, ${total} total`);
            return previous + total;
        }, 0);

        console.log(chalk.green(` - Number of elements in Project: ${elementsCount}`));
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
        let total = 0;
        const allPackages = this.packages.flatMap(pack => pack.getInternalPackages());
        allPackages.forEach(pack => {
            total += pack.getNumberOfInternalElements();
        });

        console.log(chalk.green(`- Number of elements in Tonto: ${total}`));
    }
}