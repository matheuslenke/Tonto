import { Property, Relation } from "ontouml-js";
import { Configuration } from "../../utils/extensionConfig";

function getAssociation(
    relation: Relation,
    associationType: (string | undefined)[]
    ): [string, string] {
    
    if(associationType[0] !== 'NONE' ||  associationType[1] !== 'NONE')
        if(associationType[0] === 'COMPOSITE')
            return ["+-", "-"]
        else if(associationType[1] === 'COMPOSITE')
            return ["-", "-+"]
        else if(associationType[0] === 'SHARED')
            return ["o-", "-"]
        else if(associationType[1] === 'SHARED')
            return ["-", "-o"];
    if(relation.stereotype === "externalDependence")
        return ["--", "-->"]
    if(relation.stereotype === "instantiation" || relation.stereotype === "creation")
        return ["<:--", "-"]
    
return ["-", "->"];
}

function associationKey(
    relation: Relation,
    config: Configuration
): string{
    let nomnomlCode = "";
    const [firstAssociationType, secondAssociationType] = getAssociation(relation, [relation.properties[0].aggregationKind, relation.properties[1].aggregationKind]);

    nomnomlCode += firstAssociationType + " ";

    if(config.Relation.Associations && relation.stereotype && relation.getName('en')){
        nomnomlCode += `[<label> «${relation.stereotype || ""}» ${relation.getName('en') || ""}]\n`;
        nomnomlCode += `[<label> «${relation.stereotype || ""}» ${relation.getName('en') || ""}] `;
    } else {
        nomnomlCode += `[<hidden> ${relation.id}]\n`;
        nomnomlCode += `[<hidden> ${relation.id}] `;
    }
    nomnomlCode += secondAssociationType + " ";

return nomnomlCode;
}

function firstAssociation(
    relation: Property,
    config: Configuration
): string {

    let nomnomlCode = `[«${relation.propertyType.stereotype}» ${relation.propertyType.getName('en') || ""}] `

    if(config.Relation.Cardinality && relation.cardinality.value)
        nomnomlCode += `${relation.cardinality.value} `;

    if(config.Relation.AssociationsEndNames && relation.getName('en'))
        nomnomlCode += `${relation.getName('en')} `

    return nomnomlCode;
}

function secondAssociation(
    relation: Property,
    config: Configuration
): string {
    let nomnomlCode = "";

    if(config.Relation.Cardinality && relation.cardinality.value)
    nomnomlCode += `${relation.cardinality.value} `;
    
    if(config.Relation.AssociationsEndNames && relation.getName('en'))
        nomnomlCode += `${relation.getName('en')} `
    
    nomnomlCode += `[«${relation.propertyType.stereotype}» ${relation.propertyType.getName('en') || ""}]\n`;
return nomnomlCode;
}

export function relationViewer(
    relation: Relation,
    config: Configuration
): string {
    let nomnomlCode = "";

    const dtype = relation.properties[0].propertyType.stereotype === "datatype" || relation.properties[1].propertyType.stereotype === "datatype";
    const enumm = relation.properties[0].propertyType.stereotype === "enumeration" || relation.properties[1].propertyType.stereotype === "enumeration";

    if((config.Datatype || !dtype) && (config.Enumeration || !enumm)){
        nomnomlCode += firstAssociation(relation.properties[0], config);
        nomnomlCode += associationKey(relation, config);
        nomnomlCode += secondAssociation(relation.properties[1], config);
    }

return nomnomlCode;
}