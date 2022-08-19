import {
  ContextModule,
  ClassElement,
  ElementRelation,
  DataType,
  EnumData,
} from "../language-server/generated/ast";
import { CompositeGeneratorNode, processGeneratorNode } from "langium";
import { Model } from "../language-server/generated/ast";
import { extractDestinationAndName } from "./cli-util";
import fs from "fs";
import path from "path";
import { Project, Package, MultilingualText, Class } from "ontouml-js";
import {
  attributeGenerator,
  classElementGenerator,
  customDataTypeGenerator,
  enumGenerator,
  generalizationGenerator,
} from "./generators/class.generator";
import { relationGenerator } from "./generators/relation.generator";

export function generateJSONFile(
  model: Model,
  filePath: string,
  destination: string | undefined
): string {
  const data = extractDestinationAndName(filePath, destination);
  console.log(destination, data);
  const ctx = <GeneratorContext>{
    model,
    name: data.name,
    fileName: `${data.name}.json`,
    destination: data.destination,
    fileNode: new CompositeGeneratorNode(),
  };
  return generate(ctx);
}

interface GeneratorContext {
  model: Model;
  name: string;
  fileName: string;
  destination: string;
  fileNode: CompositeGeneratorNode;
}

function generate(ctx: GeneratorContext): string {
  // Every OntoUML element can be created from a constructor that can receive a partial object
  // as references for its creation

  ctx.fileNode.append("[\n");

  ctx.model.modules.forEach((contextModule, index) => {
    const project = new Project({
      name: new MultilingualText(`${ctx.name}-${contextModule.name}`),
    }); // creates an OntoUML projects
    contextModuleGenerator(contextModule, project);
    const projectSerialization = JSON.stringify(project, null, 2);
    ctx.fileNode.append(projectSerialization);
    if (index !== ctx.model.modules.length - 1) {
      ctx.fileNode.append(",\n");
    }
  });
  ctx.fileNode.append("\n]");
  if (!fs.existsSync(ctx.destination)) {
    fs.mkdirSync(ctx.destination, { recursive: true });
  }
  const generatedFilePath = path.join(ctx.destination, ctx.fileName);
  fs.writeFileSync(generatedFilePath, processGeneratorNode(ctx.fileNode));
  return generatedFilePath;
}

function contextModuleGenerator(
  contextModule: ContextModule,
  project: Project
): void {
  const packageItem = new Package({
    name: new MultilingualText(contextModule.name),
  });
  let classes: Class[] = [];
  let dataTypes: Class[] = createBaseDatatypes(packageItem);
  // Creating base datatypes

  contextModule.elements.forEach((element) => {
    switch (element.$type) {
      case "ClassElement":
        const classElement = element as ClassElement;
        const newClass = classElementGenerator(classElement, packageItem);
        attributeGenerator(classElement, newClass, dataTypes);
        classes.push(newClass);
        break;

      case "DataType":
        const dataType = element as DataType;
        customDataTypeGenerator(dataType, packageItem, dataTypes);
        break;

      case "EnumData":
        const enumData = element as EnumData;
        enumGenerator(enumData, packageItem);
        break;
    }
  });
  generateInternalRelations(contextModule, classes, packageItem);
  generateSpecializations(contextModule, classes, packageItem);
  generateExternalRelations(contextModule, classes, packageItem);

  project.createModel(packageItem);
}

function createBaseDatatypes(model: Package): Class[] {
  const data = model.createDatatype("Date");
  const string = model.createDatatype("string");
  const number = model.createDatatype("number");
  const boolean = model.createDatatype("boolean");

  return [data, string, number, boolean];
}

function generateSpecializations(
  contextModule: ContextModule,
  classes: Class[],
  packageItem: Package
): void {
  contextModule.elements.forEach((element) => {
    if (element.$type === "ClassElement") {
      const classElement = element as ClassElement;
      if (classElement.specializationEndurants) {
        const classElementCreated = classes.find(
          (item) => item.name.getText() === classElement.name
        );

        if (classElementCreated) {
          classElement.specializationEndurants.forEach((endurant) => {
            const targetClass = classes.find(
              (item) => item.name.getText() === endurant.ref?.name
            );
            if (targetClass) {
              generalizationGenerator(
                packageItem,
                classElementCreated,
                targetClass
              );
            }
          });
        }
      }
    }
  });
}

function generateExternalRelations(
  contextModule: ContextModule,
  classes: Class[],
  packageItem: Package
): void {
  contextModule.elements.forEach((element) => {
    switch (element.$type) {
      case "ElementRelation":
        const elementRelation = element as ElementRelation;
        relationGenerator(elementRelation, packageItem, classes);
    }
  });
}

function generateInternalRelations(
  contextModule: ContextModule,
  classes: Class[],
  packageItem: Package
): void {
  contextModule.elements.forEach((element) => {
    if (element.$type === 'ClassElement') {
      const classElement = element as ClassElement;

      classElement.references.forEach(reference => {
        console.log(reference.name)
        relationGenerator(reference, packageItem, classes, classElement);
      })
    }
  });
}
