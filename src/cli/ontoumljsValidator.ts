import { CompositeGeneratorNode } from "langium";
import fetch from "node-fetch-native";
import { MultilingualText, Project } from "ontouml-js";
import { Model } from "../language-server/generated/ast";
import { extractName } from "./cli-util";
import { contextModuleGenerator } from "./JsonGenerators/contextModule.generator";

export interface ResultResponse {
  code?: string;
  data?: {
    source?: {
      id?: string;
      description?: string;
      stereotype?: string;
      type?: string;
    };
  };
  description?: string;
  severity?: string;
  title?: string;
}

export interface ErrorResultResponse {
  id?: string;
  message?: string;
  status?: number;
  info: ErrorInfo[];
}

interface ErrorInfo {
  keyword?: string;
  message?: string;
  dataPath?: string;
  schemaPath?: string;
}

export async function validateTontoFile(
  model: Model,
  filePath: string
): Promise<ResultResponse[] | ErrorResultResponse | undefined> {
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
    const resultResponse = json.result as ResultResponse[];
    if (resultResponse) {
      return resultResponse;
    } else {
      return json as ErrorResultResponse;
    }
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

  ctx.model.modules.forEach((contextModule, _) => {
    const createdPackage = rootModel.createPackage(contextModule.name);
    // Generate a contextModule
    contextModuleGenerator(contextModule, createdPackage);
  });
  return project;
}
