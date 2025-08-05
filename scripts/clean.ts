/**
 * @fileoverview A script to clean up TypeScript compilation artifacts.
 *
 * This script recursively searches a directory and removes files with the
 * following extensions: .d.ts, .d.ts.map, and .js.map.
 *
 * It's useful for cleaning your project directory before a fresh build,
 * before committing to version control, or before packaging for deployment.
 *
 * To Run:
 * 1. Save this file as `clean.ts` in your project's root or a `scripts` folder.
 * 2. Ensure you have `ts-node` installed (`npm install -g ts-node`) or use your
 * project's TypeScript compiler (`tsc`) to compile it to JavaScript first.
 * 3. Execute from your terminal:
 * `ts-node clean.ts [directory]`
 *
 * If no directory is provided, it will start from the current directory.
 * It will automatically skip the `node_modules` directory.
 */

import * as fs from 'fs';
import * as path from 'path';

// --- Configuration ---
// The file extensions to target for deletion.
const EXTENSIONS_TO_DELETE: string[] = ['.d.ts', '.d.ts.map', '.js.map'];

// Directories to always skip during the cleanup process.
const DIRS_TO_SKIP: string[] = ['node_modules', '.git', 'bin'];

/**
 * Recursively walks through a directory and deletes specified files.
 * @param {string} directory - The absolute or relative path to the directory to start cleaning.
 */
function cleanDirectory(directory: string): void {
  try {
    // Read all items in the current directory.
    const items = fs.readdirSync(directory);

    for (const item of items) {
      // Get the full path of the item.
      const fullPath = path.join(directory, item);

      // Skip specified directories to avoid unintended deletions and improve performance.
      if (DIRS_TO_SKIP.includes(item)) {
        console.log(`- Skipping directory: ${fullPath}`);
        continue;
      }

      // Get item stats to check if it's a file or directory.
      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch (err) {
        console.error(`Could not stat ${fullPath}, skipping. Error: ${err}`);
        continue;
      }


      if (stat.isDirectory()) {
        // If it's a directory, recurse into it.
        cleanDirectory(fullPath);
      } else {
        // If it's a file, check if its extension is in our deletion list.
        const fileExt = path.extname(fullPath);
        const secondExt = path.extname(fullPath.replace(fileExt, ''));
        const combinedExt = secondExt + fileExt; // Handles cases like .d.ts

        if (EXTENSIONS_TO_DELETE.includes(fileExt) || EXTENSIONS_TO_DELETE.includes(combinedExt)) {
          try {
            // Delete the file.
            fs.unlinkSync(fullPath);
            console.log(`Deleted: ${fullPath}`);
          } catch (err) {
            console.error(`Error deleting file ${fullPath}:`, err);
          }
        }
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${directory}:`, err);
  }
}

// --- Script Execution ---

// Determine the root directory from command-line arguments or default to the current directory.
const rootDir = process.argv[2] || '.';
const absoluteRootDir = path.resolve(rootDir);

console.log(`Starting cleanup of compilation files in: ${absoluteRootDir}\n`);

// Start the cleaning process.
cleanDirectory(absoluteRootDir);

console.log('\n✅ Cleanup complete.');
