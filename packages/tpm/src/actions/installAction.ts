import chalk from "chalk";
import * as path from "node:path";
import * as fs from "node:fs";
import ora, { Ora } from "ora";
import { TontoDependency, readTontoManifest, createDefaultTontoManifest, TontoManifest } from "tonto-cli";
import execa from "execa";

interface InstallOptions {
  dir: string;
}

interface InstallResponse {
  fail: boolean;
  message: string;
}

const installAction = async (opts: InstallOptions): Promise<void> => {
  await installCommand(opts);
};

const installCommand = async (opts: InstallOptions): Promise<InstallResponse> => {
  const manifest = readTontoManifest(opts.dir);

  if (!manifest) {
    console.log(
      chalk.red("tonto.json manifest file not found. The manifest is required in order to manage dependencies. We created a default one")
    );
    createDefaultManifest(opts.dir);
    return {
      fail: true,
      message: "tonto.json manifest file not found. The manifest is required in order to manage dependencies, so we created a default one",
    } as InstallResponse;
  }

  const dependencyMap: Map<string, TontoDependency> = new Map();

  const absolutePath = path.resolve(opts.dir);
  const tmpPath = path.join(absolutePath, "tmp");
  const tontoDependenciesPath = path.join(absolutePath, "tonto_dependencies");

  if (fs.existsSync(tmpPath)) {
    deleteTempFolder(tmpPath);
  }
  if (!fs.existsSync(tmpPath)) {
    fs.mkdirSync(tmpPath);
  }
  if (!fs.existsSync(tontoDependenciesPath)) {
    fs.mkdirSync(tontoDependenciesPath);
  }

  const spinner = ora({ text: "Installing dependencies" }).start();

  try {
    /**
     * First, we need to clone each dependency and get all inner dependencies recursively, until we have all the
     * required dependencies on dependencyMap
     */
    for (const dependencyName in manifest.dependencies) {
      const dependency = manifest.dependencies[dependencyName];
      dependencyMap.set(dependencyName, dependency);
      const innerDependencies = await getPackageContentFromGitAndBuildDependencyMap(
        tmpPath,
        tontoDependenciesPath,
        dependencyName,
        dependency,
        spinner,
        false
      );
      joinDependencyMaps(dependencyMap, innerDependencies);
    }
    spinner.text = "Dependency map resolved! Moving folders...";
    /**
     * Then, after all dependencies are correctly set, we can copy from our temporary folder to the final
     * tonto_dependencies folder
     */
    await copyCorrectDependenciesToTontoDependenciesFolder(tmpPath, tontoDependenciesPath, dependencyMap, spinner);
    spinner.succeed("Dependencies installed!");
  } catch (error) {
    spinner.fail(`Install dependencies failed! Reason: ${error}`);
    return {
      fail: true,
      message: error,
    } as InstallResponse;
  } finally {
    deleteTempFolder(tmpPath);
  }
  return {
    fail: false,
    message: "Dependencies install finished!",
  } as InstallResponse;
};

async function deleteTempFolder(tmpPath: string) {
  if (fs.existsSync(tmpPath)) {
    try {
      fs.rmSync(tmpPath, { recursive: true });
    } catch (error) {
      console.log(error);
    }
  }
}

async function getPackageContentFromGitAndBuildDependencyMap(
  installDir: string,
  tontoDependenciesPath: string,
  dependencyName: string,
  dependency: TontoDependency,
  spinner: Ora,
  verbose: boolean
): Promise<Map<string, TontoDependency>> {
  try {
    const dependencyTempPath = path.join(installDir, dependencyName);

    if (fs.existsSync(dependencyTempPath)) {
      return new Map();
    }
    if (!fs.existsSync(dependencyTempPath)) {
      fs.mkdirSync(dependencyTempPath);
    }
    /**
     * First, we need to check if the tag exists on the remote
     */
    spinner.text = `Installing ${dependencyName}`;
    let cloneResponse: execa.ExecaReturnValue<string>;
    if (dependency.version) {
      const response = await execa.command(`git ls-remote --tags  ${dependency.url}`, {reject: verbose});
      if (response.failed) {
        console.log(chalk.red("Error while getting repository tags"));
        spinner.fail("Error while getting repository tags");
        return new Map();
      }
      const tags = parseRemoteTags(response.stdout);
      const tagExists = tags.find((item) => item === dependency.version);

      if (!tagExists) {
        // console.log(chalk.red(`Specified tag from dependency ${dependencyName} does not exist`));
        return Promise.reject(`Specified tag from dependency ${dependencyName} does not exist`);
      }
      /**
       * First, we clone the dependency to a temporary folder
       */
      cloneResponse = await execa.command(
        `git clone ${dependency.url} ${dependencyTempPath} --depth=1 --single-branch --branch ${dependency.version}`,
        {reject: verbose}
        );
    } else if (dependency.branch) {
      cloneResponse = await execa.command(
        `git clone ${dependency.url} ${dependencyTempPath} --single-branch --branch ${dependency.branch}`,
        {reject: verbose}
      );
    } else {
      cloneResponse = await execa.command(`git clone ${dependency.url} ${dependencyTempPath}`, {reject: verbose});
    }

    if (cloneResponse.failed) {
      // console.log(chalk.red("Error while cloning repository"));
      return Promise.reject(`Error while clning repository ${dependency.url}`);
    }

    let dependencyTempPathWithDirectory = dependencyTempPath;
    if (dependency.directory) {
      const dependencyWithDir = path.join(dependencyTempPath, dependency.directory);
      dependencyTempPathWithDirectory = dependencyWithDir;
    }
    const tontoManifest = checkIfDependencyHasManifest(dependencyTempPathWithDirectory);

    const innerDependencies: Map<string, TontoDependency> = new Map();
    if (tontoManifest) {
      for (const depName in tontoManifest.dependencies) {
        const dep = tontoManifest.dependencies[depName];
        innerDependencies.set(depName, dep);
        const getInnerDependencies = await getPackageContentFromGitAndBuildDependencyMap(
          installDir,
          tontoDependenciesPath,
          depName,
          dep,
          spinner,
          verbose
        );
        joinDependencyMaps(innerDependencies, getInnerDependencies);
      }
    } else {

      return Promise.reject(
        `The dependency ${dependencyName} does not seem to be a Tonto Project. Missing tonto.json manifest file`);
    }

    return innerDependencies;
  } catch (error) {
    return Promise.reject("Error while downloading files:" + error);
  }
}
/**
 * This method copies all dependencies from map2 to map1 without creating a copy
 * @param map1 The map that will receive the dependencies
 * @param map2 The map which dependencies will be copied from
 */
function joinDependencyMaps(map1: Map<string, TontoDependency>, map2: Map<string, TontoDependency>): void {
  map2.forEach((value, key) => {
    map1.set(key, value);
  });
}

async function copyCorrectDependenciesToTontoDependenciesFolder(
  installDir: string,
  tontoDependenciesPath: string,
  dependencyMap: Map<string, TontoDependency>,
  spinner: Ora
) {
  dependencyMap.forEach(async (dependency, dependencyName) => {
    if (!dependency) {
      return;
    }
    const dependencyTempPath = path.join(installDir, dependencyName);
    const dependencyFinalPath = path.join(tontoDependenciesPath);

    let dependencyTempPathWithDirectory = dependencyTempPath;
    if (dependency.directory) {
      const dependencyWithDir = path.join(dependencyTempPath, dependency.directory);
      dependencyTempPathWithDirectory = dependencyWithDir;
    }

    if (!fs.existsSync(dependencyFinalPath)) {
      fs.mkdirSync(dependencyFinalPath);
    }
    try {
      if (fs.existsSync(path.join(tontoDependenciesPath, dependencyName))) {
        spinner.fail(`Error while moving dependencies. Folder already exists: ${tontoDependenciesPath}`);
      } else {
        const response = await execa.command(`cp -R ${dependencyTempPathWithDirectory} ${tontoDependenciesPath}`,
        {reject: false});
        if (response.failed) {
          spinner.fail("Error while moving dependencies.");
        }
      }
    } catch (error) {
      spinner.clear();
      console.log(error);
    }
  });
}

function createDefaultManifest(dependencyPath: string) {
  const manifestFile = path.join(dependencyPath, "tonto.json");
  if (!fs.existsSync(manifestFile)) {
    const defaultManifest = createDefaultTontoManifest();
    fs.writeFileSync(manifestFile, JSON.stringify(defaultManifest, null,2 ));
  }
}

function checkIfDependencyHasManifest(dependencyPath: string): TontoManifest | undefined {
  return readTontoManifest(dependencyPath);
}

function parseRemoteTags(output: string): string[] {
  // Extract tag names from the `ls-remote` output
  const regex = /refs\/tags\/([^/]+)/g;
  const tags: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(output))) {
    tags.push(match[1]);
  }
  return tags;
}

export { installAction, installCommand };
