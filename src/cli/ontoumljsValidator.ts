import { CompositeGeneratorNode } from "langium";
import { Model } from "../language-server/generated/ast";
import { extractName } from "./cli-util";
import { Project, MultilingualText } from "ontouml-js";
import { contextModuleGenerator } from "./generators/contextModule.generator";
import fetch from "node-fetch";

export interface ResultResponse {
  code: string;
  data: {
    source: {
      id: string;
      description: string;
      stereotype: string;
      type: string;
    };
  };
  description: string;
  severity: string;
  title: string;
}

export async function validateTontoFile(
  model: Model,
  filePath: string
): Promise<ResultResponse[] | undefined> {
  const name = extractName(filePath);

  const ctx = <GeneratorContext>{
    model,
    name: name,
    fileNode: new CompositeGeneratorNode(),
  };

  const project = parseProject(ctx);
  const body = {
    project,
    options: undefined,
  };

  try {
    const response = await fetch("http://api.ontouml.org/v1/verify", {
      method: "post",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    const json = await response.json();
    return json.result as ResultResponse[];
  } catch (error) {
    console.log(error);
  }
  return undefined;
}

interface GeneratorContext {
  model: Model;
  name: string;
  fileNode: CompositeGeneratorNode;
}

export function parseProject(ctx: GeneratorContext): Project {
  const project = new Project({
    name: new MultilingualText(`${ctx.name}`),
  }); // creates an OntoUML projects
  const rootModel = project.createModel({
    name: new MultilingualText("root"),
  });

  ctx.model.modules.forEach((contextModule, index) => {
    const createdPackage = rootModel.createPackage(contextModule.name);
    // Generate a contextModule
    contextModuleGenerator(contextModule, createdPackage);
  });
  return project;
}
