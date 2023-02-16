import fs from "fs";
import { CompositeGeneratorNode } from "langium";
import { MultilingualText, Project } from "ontouml-js";
import path from "path";
import { Model } from "../language-server/generated/ast";
import { extractDestinationAndName } from "./cli-util";
import { contextModuleGenerator } from "./JsonGenerators/contextModule.generator";

export function generateJSONFile(
  model: Model,
  filePath: string,
  destination: string | undefined
): string {
  const data = extractDestinationAndName(filePath, destination);

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
  const project = parseProject(ctx);

  const projectSerialization = JSON.stringify(project, null, 2);
  ctx.fileNode.append(projectSerialization);

  if (!fs.existsSync(ctx.destination)) {
    fs.mkdirSync(ctx.destination, { recursive: true });
  }
  const generatedFilePath = path.join(ctx.destination, ctx.fileName);
  // fs.writeFileSync(generatedFilePath, isGeneratorNode(ctx.fileNode));
  return generatedFilePath;
}

export function parseProject(ctx: GeneratorContext): Project {
  const project = new Project({
    name: new MultilingualText(`${ctx.name}`),
  }); // creates an OntoUML projects
  const rootModel = project.createModel({
    name: new MultilingualText("root"),
  });

  ctx.model.modules.forEach((contextModule, _) => {
    const createdPackage = rootModel.createPackage(contextModule.name);
    // Generate a contextModule
    contextModuleGenerator(contextModule, createdPackage);
  });
  return project;
}
