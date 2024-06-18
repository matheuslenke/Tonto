export * from "./cli/main.js";
export * from "./language/index.js";
export { Configuration } from "./utils/extensionConfig.js";
export { GrammarAST, Model };

import type { Model } from "./language/generated/ast.js";
import * as GrammarAST from "./language/generated/ast.js";

