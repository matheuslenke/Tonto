import { readFile } from "fs/promises";
import { OntoumlElement, serializationUtils } from "ontouml-js";
import { generateTontoFile } from "../tontoGenerator";

interface JsonElement {
    model?: any;
    diagrams?: any;
    type: string;
    id: string;
    name: string;
    description?: string;
}

export type ImportOptions = {
    destination?: string;
};

export const importAction = async (
  fileName: string,
  opts: ImportOptions
): Promise<void> => {
  console.log("Importing JSON!");
  const result = await importCommand(fileName, opts);
  if (result.success) {
    console.log(`Generated .tonto file at ${result.filePath}`);
  } else {
    console.log("Error generating .tonto");
  }
};

export const importCommand = async (
  fileName: string,
  opts: ImportOptions
): Promise<ImportReturn> => {
  try {
    const data = await readFile(fileName, { encoding: "utf8" });
    const obj: JsonElement[] = JSON.parse(data);
    const ontoumlElements: OntoumlElement[] = [];

    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        const ontoUMLModel = serializationUtils.parse(
          JSON.stringify(item),
          false
        );

        ontoumlElements.push(ontoUMLModel);
      });
    } else {
      const element: JsonElement = obj;
      const ontoUMLModel = serializationUtils.parse(
        JSON.stringify(element),
        false
      );
      const isValid = serializationUtils.validate(ontoUMLModel);
      if (isValid) {
        ontoumlElements.push(ontoUMLModel);
      } else {
        throw new Error("Model not valid");
      }
    }

    const generatedFilePath = generateTontoFile(
      ontoumlElements,
      fileName,
      opts.destination
    );
    return {
      success: true,
      message: "Tonto file generated",
      filePath: generatedFilePath,
    } as ImportReturn;
  } catch (error) {
    const importReturn: ImportReturn = {
      message: error as string,
      success: false,
    };
    return importReturn;
  }
};

export type ImportReturn = {
    success: boolean;
    message: string;
    filePath?: string;
};
