import { Command } from "commander";
import { TontoLanguageMetaData } from "../language-server";
import { generateAction } from "./actions/generateAction";
import { importAction } from "./actions/importAction";
import { generateModularAction } from "./actions/generateModularAction";
import { importModularAction } from "./actions/importModularAction";

export default function (): void {
  const program = new Command();

  program
    .name("tonto-cli")
    .description("A CLI to run commands in your Tonto project")
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    .version(require("../../package.json").version);

  const fileExtensions = TontoLanguageMetaData.fileExtensions.join(", ");

  program
    .command("generateModular")
    .argument("<dir>", "Directory of the actual project")
    .description("Generate JSON from your project")
    .action(generateModularAction);

  program
    .command("generate")
    .argument(
      "<file>",
      `source file (possible file extensions: ${fileExtensions})`
    )
    .option("-d, --destination <dir>", "destination directory of generating")
    .description("generates a JSON from your model to a source file")
    .action(generateAction);

  program
    .command("import")
    .argument("<file>", "source file (possible file extensions: json)")
    .option("-d, --destination <dir>", "destination directory of generating")
    .description("generates a tonto file from a JSON file")
    .action(importAction);

  program
    .command("importModular")
    .argument("<file>", "source file (possible file extensions: json)")
    .description("generates a tonto file from a JSON file")
    .action(importModularAction);
  program.parse(process.argv);
}

// Export actions
// export { generateAction, importAction, generateModularAction, importModularAction };