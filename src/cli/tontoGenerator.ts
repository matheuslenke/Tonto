// import { CompositeGeneratorNode, processGeneratorNode } from "langium";
// import { Model } from "../language-server/generated/ast";
// import { extractDestinationAndName } from "./cli-util";
// import fs from "fs";
// import path from "path";
// import { Project, MultilingualText } from "ontouml-js";

// export function generateTontoFile(
//   originalFile: Model,
//   filePath: string,
//   destination: string | undefined
// ): string {
//   const data = extractDestinationAndName(filePath, destination);

//   const ctx = <GeneratorContext>{
//     model,
//     name: data.name,
//     fileName: `${data.name}.json`,
//     destination: data.destination,
//     fileNode: new CompositeGeneratorNode(),
//   };
//   return generate(ctx);
// }

// interface GeneratorContext {
//   model: Model;
//   name: string;
//   fileName: string;
//   destination: string;
//   fileNode: CompositeGeneratorNode;
// }

// function generate(ctx: GeneratorContext): string {
//   // Every OntoUML element can be created from a constructor that can receive a partial object
//   // as references for its creation

//   ctx.fileNode.append("[\n");

//   if (!fs.existsSync(ctx.destination)) {
//     fs.mkdirSync(ctx.destination, { recursive: true });
//   }
//   const generatedFilePath = path.join(ctx.destination, ctx.fileName);
//   fs.writeFileSync(generatedFilePath, processGeneratorNode(ctx.fileNode));
//   return generatedFilePath;
// }
