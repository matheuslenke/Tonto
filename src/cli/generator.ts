import { ContextModule, ClassElement } from './../language-server/generated/ast';
import { CompositeGeneratorNode, processGeneratorNode } from 'langium';
import { Model } from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';
import fs from 'fs'
import path from 'path';
import { Project, Package, MultilingualText } from 'ontouml-js'
import { classElementGenerator } from './generators/class.generator';

export function generateJavaScript(model: Model, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);

    const ctx = <GeneratorContext> {
        model,
        name: data.name,
        fileName: `${data.name}.json`,
        destination: data.destination,
        fileNode: new CompositeGeneratorNode()
    }
    return generate(ctx);

}

interface GeneratorContext {
    model: Model,
    name: string;
    fileName: string;
    destination: string;
    fileNode: CompositeGeneratorNode
}

function generate(ctx: GeneratorContext): string {
    // Every OntoUML element can be created from a constructor that can receive a partial object as references for its creation
    
    ctx.fileNode.append("[\n")
    
    ctx.model.modules.forEach((contextModule, index) => {
        const project = new Project({ name: new MultilingualText(`${ctx.name}-${contextModule.name}`) }); // creates an OntoUML projects
        contextModuleGenerator(contextModule, project)
        const projectSerialization = JSON.stringify(project, null, 2);
        ctx.fileNode.append(projectSerialization)
        if (index !== ctx.model.modules.length - 1) {
            ctx.fileNode.append(',\n')
        }
    })
    ctx.fileNode.append("\n]")
    if (!fs.existsSync(ctx.destination)) {
        fs.mkdirSync(ctx.destination, { recursive: true });
    }
    const generatedFilePath = path.join(ctx.destination, ctx.fileName);
    fs.writeFileSync(generatedFilePath, processGeneratorNode(ctx.fileNode));
    return generatedFilePath;
}

function contextModuleGenerator(contextModule: ContextModule, project: Project): void {
    const packageItem = new Package({
        name: new MultilingualText(contextModule.name)
    })

    contextModule.elements.forEach(element => {
        switch (element.$type) {
            case 'ClassElement':
                const classElement = element as ClassElement
                classElementGenerator(classElement, packageItem)
                // console.log(packageItem)
            
            case 'GeneralizationSet':
                // console.log("Genset")
        }
    })

    project.createModel(packageItem)
}
