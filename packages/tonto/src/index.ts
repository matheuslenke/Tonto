export * from "./cli/main.js";
export * from "./language/index.js";
export { Configuration } from "./utils/extensionConfig.js";

import type { Model } from "./language/generated/ast.js";
import * as GrammarAST from "./language/generated/ast.js";

export { GrammarAST, Model };
