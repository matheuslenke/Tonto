import chalk from "chalk";
import * as fs from "node:fs";
import * as path from "node:path";
import { TontoDependency, readTontoManifest } from "tonto-cli";

interface AddOptions {
  name: string;
  url: string;
  version?: string;
  dir?: string;
}

export const addDependencyAction = async (currentDir: string, opts: AddOptions): Promise<void> => {
  const formattedDir = opts.dir ? opts.dir.trim() : opts.dir;
  const dependency = {
    url: opts.url.trim(),
    version: opts.version,
    directory: formattedDir,
  } as TontoDependency;

  // Read the JSON file
  const manifest = readTontoManifest(currentDir);

  if (manifest) {
    // Add the new dependency
    const formattedName = opts.name.trim();
    manifest.dependencies[formattedName] = dependency;
  } else {
    console.log(chalk.red("Tonto Manifest file not found!"));
    return;
  }

  // Write the updated JSON back to the file
  const folderAbsolutePath = path.resolve(currentDir);
  const manifestPath = path.join(folderAbsolutePath, "tonto.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(chalk.green(`Tonto dependency "${opts.name}" added successfully.`));
};
