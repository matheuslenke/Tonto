import chalk from "chalk";
import { TontoDependency, TontoManifest, readTontoManifest } from "tonto-cli";
import shell, { ShellString } from "shelljs";
import path from "path";
import fs from "fs";

interface InstallOptions {
  dir: string;
}

interface InstallResponse {
  fail: boolean;
  message: string;
}

const installAction = async (opts: InstallOptions): Promise<InstallResponse> => {
  const manifest = readTontoManifest(opts.dir);

  if (!manifest) {
    console.log(chalk.red("tonto.json manifest file not found. It is required in order to manage dependencies"));
    return {
      fail: true,
      message: "tonto.json manifest file not found. It is required in order to manage dependencies",
    } as InstallResponse;
  }

  const dependencyMap: Map<string, TontoDependency> = new Map();

  const absolutePath = path.resolve(opts.dir);
  const tmpPath = path.join(absolutePath, "tmp");
  const tontoDependenciesPath = path.join(absolutePath, "tonto_dependencies");

  deleteTempFolder(tmpPath);
  if (!fs.existsSync(tmpPath)) {
    fs.mkdirSync(tmpPath);
  }
  if (!fs.existsSync(tontoDependenciesPath)) {
    fs.mkdirSync(tontoDependenciesPath);
  }

  console.log(chalk.bold("Installing dependencies..."));

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
        dependency
      );
      joinDependencyMaps(dependencyMap, innerDependencies);
    }
    console.log(chalk.green.bold("Dependency map resolved!"));

    /**
     * Then, after all dependencies are correctly set, we can copy from our temporary folder to the final
     * tonto_dependencies folder
     */
    copyCorrectDependenciesToTontoDependenciesFolder(tmpPath, tontoDependenciesPath, dependencyMap);
  } catch (error) {
    return {
      fail: true,
      message: error,
    } as InstallResponse;
  } finally {
    deleteTempFolder(tmpPath);
  }
  console.log(chalk.green.bold("Dependencies install finished!"));
  return {
    fail: false,
    message: "Dependencies install finished!",
  } as InstallResponse;
};

async function deleteTempFolder(tmpPath: string) {
  if (fs.existsSync(tmpPath)) {
    shell.exec(`rm -r ${tmpPath}`);
  }
}

async function getPackageContentFromGitAndBuildDependencyMap(
  installDir: string,
  tontoDependenciesPath: string,
  dependencyName: string,
  dependency: TontoDependency
): Promise<Map<string, TontoDependency>> {
  try {
    if (!shell.which("git")) {
      shell.echo("Sorry, this script requires git");
      shell.exit(1);
    }
    const dependencyTempPath = path.join(installDir, dependencyName);

    if (!fs.existsSync(dependencyTempPath)) {
      fs.mkdirSync(dependencyTempPath);
    }
    /**
     * First, we need to check if the tag exists on the remote
     */
    if (dependency.version) {
      const response: ShellString = shell.exec(`git ls-remote --tags ${dependency.url}`);
      const tags = response.stdout.split("\n");
      const tagExists = tags.find((item) => item === dependency.version);

      if (!tagExists) {
        console.log(chalk.red(`Specified tag from dependency ${dependencyName} does not exist`));
        return Promise.reject(`Specified tag from dependency ${dependencyName} does not exist`);
      }
      /**
       * First, we clone the dependency to a temporary folder
       */
      shell.exec(`git clone ${dependency.url} ${dependencyTempPath} --single-branch --branch ${dependency.version}`);
    } else if (dependency.branch) {
      shell.exec(`git clone ${dependency.url} ${dependencyTempPath} --single-branch --branch ${dependency.branch}`);
    } else {
      shell.exec(`git clone ${dependency.url} ${dependencyTempPath}`);
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
          dep
        );
        joinDependencyMaps(innerDependencies, getInnerDependencies);
      }
    } else {
      console.log(
        chalk.bold.red(
          `The dependency ${dependencyName} does not seem to be a Tonto Project. Missing tonto.json manifest file`
        )
      );
      // TODO: Return error
    }

    return innerDependencies;
  } catch (error) {
    console.error("An error occurred while downloading files:", error);
    return Promise.reject();
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

function copyCorrectDependenciesToTontoDependenciesFolder(
  installDir: string,
  tontoDependenciesPath: string,
  dependencyMap: Map<string, TontoDependency>
): void {
  dependencyMap.forEach((dependency, dependencyName) => {
    if (!dependency) {
      return;
    }
    const dependencyTempPath = path.join(installDir, dependencyName);
    const dependencyFinalPath = path.join(tontoDependenciesPath);
    console.log(`Copying file from ${dependencyTempPath} to ${dependencyFinalPath}`);
    let dependencyTempPathWithDirectory = dependencyTempPath;
    if (dependency.directory) {
      const dependencyWithDir = path.join(dependencyTempPath, dependency.directory);
      dependencyTempPathWithDirectory = dependencyWithDir;
    }

    if (!fs.existsSync(dependencyFinalPath)) {
      fs.mkdirSync(dependencyFinalPath);
    }
    shell.exec(`cp -R ${dependencyTempPathWithDirectory} ${tontoDependenciesPath}`);
  });
}

function checkIfDependencyHasManifest(dependencyPath: string): TontoManifest | undefined {
  return readTontoManifest(dependencyPath);
}

export { installAction };
