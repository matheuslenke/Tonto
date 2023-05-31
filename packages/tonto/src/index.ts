export * from "./language-server";
export * from "./cli";

import * as GrammarAST from "./language-server/generated/ast";
import type { Model } from "./language-server/generated/ast";

export { GrammarAST, Model };