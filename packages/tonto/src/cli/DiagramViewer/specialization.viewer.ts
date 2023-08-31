import { Class, GeneralizationSet } from "ontouml-js";
import { Configuration } from "../../utils/setExtensionConfig";

export function generalizationViewer(
    general: Class,
    specific: Class,
    config: Configuration
): string {
    let nomnomlCode = "";
    const hiddenContent = `(${general.stereotype} ${(general.name.getText("en") || "")} <:- ${specific.stereotype} ${(specific.name.getText("en") || "")})`

    nomnomlCode += `[«${general.stereotype}» ${(general.name.getText("en") || "")}] <:- [<hidden> ${hiddenContent}]
[<hidden> ${hiddenContent}] - [«${specific.stereotype}» ${(specific.name.getText("en") || "")}]\n`;
  return nomnomlCode;
}

export function generalizationSetViewer(
  genSet: GeneralizationSet,
  config: Configuration
): string {
  let nomnomlCode = "";
  let genSetDefinition = "";
  let hiddenContent = `generalizationSet:`;

  genSet.getSpecifics().forEach((specific) => {
    hiddenContent += ` ${(specific.name.getText("en") || "")}`
  });

  if(genSet.isPartition())
    genSetDefinition += "disjoint, complete";
  else if(genSet.isDisjoint)
    genSetDefinition += "disjoint, incomplete";
  else if(genSet.isComplete)
    genSetDefinition += "overlapping, complete";
  else
  genSetDefinition += "overlapping, incomplete";  

  nomnomlCode += `[«${genSet.getGeneral().stereotype}» ${(genSet.getGeneral().name.getText("en") || "")}] <:- {${genSetDefinition}}[<hidden> ${hiddenContent}]\n`
  //`[<hidden> ${hiddenContent}] - [${specific.stereotype} ${(specific.name.getText("en") || "")}]\n`;
  genSet.getSpecifics().forEach((specific) => {
    nomnomlCode += `[<hidden> ${hiddenContent}] - [«${specific.stereotype}» ${(specific.name.getText("en") || "")}]\n`
  });

return nomnomlCode;
}