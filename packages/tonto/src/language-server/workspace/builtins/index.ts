import { BuiltInLib } from "../../../cli/model/BuiltInLib";
import { basicDataTypes } from "./basicDataTypes";

const builtInLibs: BuiltInLib[] = [
  {
    uri: "builtin://basicDataTypes.tonto",
    content: basicDataTypes,
  },
];

export { builtInLibs };
