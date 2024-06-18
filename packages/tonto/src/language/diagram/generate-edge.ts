import { GeneratorContext } from "langium-sprotty";
import { SEdge, SLabel } from "sprotty-protocol";
import { ElementRelation, Model } from "../generated/ast.js";

export function generateEdge(relation: ElementRelation, { idCache }: GeneratorContext<Model>): SEdge {
    const sourceId = idCache.getId(relation.$container ?? relation.firstEnd?.ref);
    const targetId = idCache.getId(relation.secondEnd.ref);

    const edgeId = idCache.uniqueId(`${sourceId}:${relation.id ?? "unamed"}:${targetId}`, relation);
    return {
        type: "edge",
        id: edgeId,
        sourceId: sourceId!,
        targetId: targetId!,
        routerKind: "manhattan",
        children: [
            <SLabel>{
                type: "edge:label",
                id: idCache.uniqueId(edgeId + ".label"),
                text: relation.id ?? "",
                edgePlacement: {
                    position: 0.5,
                    offset: 10,
                    side: "top",
                    rotate: true,
                    moveMode: "edge",
                }
            }
        ]
    };
}