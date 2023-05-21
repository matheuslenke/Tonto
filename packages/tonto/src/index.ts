export * from "./language-server";

import * as GrammarAST from "./language-server/generated/ast";
import type { Model } from "./language-server/generated/ast";

export { GrammarAST, Model };