import { Command } from "commander";
import { TontoLanguageMetaData } from "../language/index.js";
import { TontoActions } from "./main.js";
// import { viewAction } from "./actions/viewAction";

export const cliVersion = "0.3.2";

export default function (): void {
    const program = new Command();
    const actions = new TontoActions();

    program
        .name("tonto-cli")
        .description("A CLI to run commands in your Tonto project")
        .version(cliVersion);

    const fileExtensions = TontoLanguageMetaData.fileExtensions.join(", ");

    program
        .command("generate")
        .argument("<dir>", "Directory of the actual project")
        .option("-d, --destination <dir>", "Destination directory of generating")
        .description("Generate JSON from your project")
        .action(actions.generateAction);

    program
        .command("generateSingle")
        .argument(
            "<file>",
            `Generate on single file projects providing source file (possible file extensions: ${fileExtensions})`
        )
        .option("-d", "--d <destination>", "Destination of generated JSON file")
        .action(actions.generateAction)
        .description("Generate JSON from your project or a single file");

    program
        .command("import")
        .argument("<file>", "source file (possible file extensions: json)")
        .option("-d, --destination <dir>", "destination directory of generating")
        .description("generates a tonto file from a JSON file")
        .action(actions.importAction);

    program
        .command("importSingle")
        .argument("<file>", "source file (possible file extensions: json)")
        .option("-d, --destination <dir>", "destination directory of generating")
        .description("generates a tonto file from a JSON file")
        .action(actions.importAction);

    // program
    //   .command("viewDiagram")
    //   .argument("<file>", "source file (possible file extensions: tonto)")
    //   .description("generates a diagram from a tonto file")
    //   .action(viewAction);

    program
        .command("validate")
        .argument("<dir>", "Directory of the actual project")
        .option("--local", "Running Local Tonto Checks, or running API checks")
        .description("Validate your Tonto project with the ontouml-js API")
        .action(actions.validateAction);

    program
        .command("transform")
        .argument("<dir>", "Directory of the actual project")
        .description("Transform you Tonto project to gufo with the ontouml-js API")
        .action(actions.transformToGufoAction);

    program.parseAsync(process.argv);
}

export * from "./actions/index.js";
export * from "./model/grammar/TontoManifest.js";
export * from "./requests/gufoTransform.js";
export * from "./requests/ontoumljsValidator.js";
export * from "./utils/readManifest.js";

