import { GeneratorContext } from "langium-sprotty";
import { SLabel, SNode } from "sprotty-protocol";
import { ClassDeclaration, DataType, DataTypeOrClassOrRelation, Model } from "../generated/ast.js";
import { tontoNatureUtils } from "../utils/tontoNatureUtils.js";

export function generateNode(
    classDeclaration: DataTypeOrClassOrRelation,
    context: GeneratorContext<Model>): SNode | undefined {
    if (classDeclaration.$type === "ClassDeclaration") {
        return generateClassNode(classDeclaration, context);
    }
    if (classDeclaration.$type === "DataType") {
        return generateDatatypeNode(classDeclaration, context);
    }
    return undefined;
}

function generateClassNode(classDeclaration: ClassDeclaration, { idCache }: GeneratorContext<Model>): SNode {
    const packageName = classDeclaration.$container?.name ?? "";
    const nodeId = idCache.uniqueId(`${packageName}:${classDeclaration.name}`, classDeclaration);
    const nature = tontoNatureUtils.getTontoNature(classDeclaration);
    const semanticToken = tontoNatureUtils.getSemanticTokenFromNature(nature);
    return {
        type: "node:class",
        id: nodeId,
        cssClasses: [
            "node-fill",
            semanticToken
        ],
        children: [
            <SLabel>{
                type: "label",
                id: idCache.uniqueId(nodeId + ".label"),
                text: classDeclaration.name,
            },
        ],
        layout: "vbox",
        layoutOptions: {
            paddingTop: 15.0,
            paddingBottom: 15.0,
            paddingLeft: 15.0,
            paddingRight: 15.0,
            resizeContainer: true,
        }
    };
}

function generateDatatypeNode(datatype: DataType, { idCache }: GeneratorContext<Model>): SNode {
    const packageName = datatype.$container?.name ?? "";
    const nodeId = idCache.uniqueId(`${packageName}:${datatype.name}`, datatype);
    return {
        type: "node:class",
        id: nodeId,
        cssClasses: [
            datatype.ontologicalCategory ?? "datatype",
            "datatype"
        ],
        children: [
            <SLabel>{
                type: "label",
                id: idCache.uniqueId(nodeId + ".label"),
                text: datatype.name,
            },
        ],
        layout: "vbox",
        layoutOptions: {
            paddingTop: 15.0,
            paddingBottom: 15.0,
            paddingLeft: 15.0,
            paddingRight: 15.0,
            resizeContainer: true,
        }
    };
}
