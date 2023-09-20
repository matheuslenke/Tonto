import { Command } from "commander";
import { TontoLanguageMetaData } from "../language-server";
import { generateAction } from "./actions/generateAction";
import { importAction } from "./actions/importAction";
import { importModularAction } from "./actions/importModularAction";
import { validateAction } from "./actions";
import { transformToGufoAction } from "./actions/gufoGenerateAction";
// import { viewAction } from "./actions/viewAction";

export default function (): void {
  const program = new Command();

  program
    .name("tonto-cli")
    .description("A CLI to run commands in your Tonto project")
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    .version(require("../../package.json").version);

  const fileExtensions = TontoLanguageMetaData.fileExtensions.join(", ");

  program
    .command("generate")
    .argument("<dir>", "Directory of the actual project")
    .option("-d, --destination <dir>", "Destination directory of generating")
    .description("Generate JSON from your project")
    .action(generateAction);

  program
    .command("generateSingle")
    .argument(
      "<file>",
      `Generate on single file projects providing source file (possible file extensions: ${fileExtensions})`
    )
    .option("-d", "--d <destination>", "Destination of generated JSON file")
    .action(generateAction)
    .description("Generate JSON from your project or a single file");

  program
    .command("import")
    .argument("<file>", "source file (possible file extensions: json)")
    .description("generates a tonto file from a JSON file")
    .action(importModularAction);

  program
    .command("importSingle")
    .argument("<file>", "source file (possible file extensions: json)")
    .option("-d, --destination <dir>", "destination directory of generating")
    .description("generates a tonto file from a JSON file")
    .action(importAction);

  // program
  //   .command("viewDiagram")
  //   .argument("<file>", "source file (possible file extensions: tonto)")
  //   .description("generates a diagram from a tonto file")
  //   .action(viewAction);

  program
    .command("validate")
    .argument("<dir>", "Directory of the actual project")
    .description("Validate your Tonto project with the ontouml-js API")
    .action(validateAction);

  program
    .command("transform")
    .argument("<dir>", "Directory of the actual project")
    .description("Transform you Tonto project to gufo with the ontouml-js API")
    .action(transformToGufoAction);

  program.parseAsync(process.argv);
}

export * from "./actions";
export * from "./utils/readManifest";
export * from "./model/TontoManifest";
