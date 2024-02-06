export * from "./language/index.js";
export * from "./cli/main.js";

import * as GrammarAST from "./language/generated/ast.js";
import type { Model } from "./language/generated/ast.js";

export { GrammarAST, Model };
