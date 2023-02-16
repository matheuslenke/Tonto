import { Command } from "commander";
import { TontoLanguageMetaData } from "../language-server/generated/module";
import { generateAction } from "./actions/generateAction";
import { importAction } from "./actions/importAction";

export default function(): void {
  const program = new Command();

  program
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    .version(require("../../package.json").version);

  const fileExtensions = TontoLanguageMetaData.fileExtensions.join(", ");
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

  program.parse(process.argv);
}
