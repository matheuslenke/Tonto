import { NodeFileSystem } from "langium/node";
import { Model, createTontoServices } from "../../../src/language-server";
import { extractAstNode } from "../cli-util";
import {
  ErrorResultResponse,
  ResultResponse,
  validateTontoFile
} from "../ontoumljsValidator";

export const validateAction = async (
  fileName: string
): Promise<ResultResponse[] | ErrorResultResponse | void> => {
  const services = createTontoServices({ ...NodeFileSystem }).Tonto;
  const model = await extractAstNode<Model>(fileName, services);
  const validationResult = validateTontoFile(model, fileName);
  return validationResult;
};
