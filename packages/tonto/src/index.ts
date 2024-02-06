export * from "./language-server/index.js";
export * from "./cli/index.js";

import * as GrammarAST from "./language-server/generated/ast.js";
import type { Model } from "./language-server/generated/ast.js";

export { GrammarAST, Model };
