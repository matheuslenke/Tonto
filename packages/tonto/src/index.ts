export * from "./language-server";
export { Configuration } from "./utils/setExtensionConfig"
export * from "./cli";

import * as GrammarAST from "./language-server/generated/ast";
import type { Model } from "./language-server/generated/ast";

export { GrammarAST, Model };
