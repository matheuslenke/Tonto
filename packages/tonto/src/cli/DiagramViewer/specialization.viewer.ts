import { Class, GeneralizationSet } from "ontouml-js";

export function generalizationViewer(
    id: string,
    general: Class,
    specific: Class
): string {
    let nomnomlCode = "";

    nomnomlCode += `[«${general.stereotype}» ${(general.name.getText("en") || "")}] <:- [<hidden> ${id}]
[<hidden> ${id}] - [«${specific.stereotype}» ${(specific.name.getText("en") || "")}]\n`;
    return nomnomlCode;
}

export function generalizationSetViewer(
    genSet: GeneralizationSet
): string {
    let nomnomlCode = "";
    let genSetDefinition = "";

    if(genSet.isPartition())
        genSetDefinition += "disjoint, complete";
    else if(genSet.isDisjoint)
        genSetDefinition += "disjoint, incomplete";
    else if(genSet.isComplete)
        genSetDefinition += "overlapping, complete";
    else
        genSetDefinition += "overlapping, incomplete";  

    nomnomlCode += `[«${genSet.getGeneral().stereotype}» ${(genSet.getGeneral().name.getText("en") || "")}] <:- {${genSetDefinition}}-${genSet.getSpecifics().length} [<hidden> ${genSet.id}]\n`;
    genSet.getSpecifics().forEach((specific) => {
        nomnomlCode += `[<hidden> ${genSet.id}] - [«${specific.stereotype}» ${(specific.name.getText("en") || "")}]\n`;
    });

    return nomnomlCode;
}