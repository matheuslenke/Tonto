import { Serializer } from "../../model-server/serializer.js";
import { Model } from "../generated/ast.js";

// const PROPERTY_ORDER = [
//     "id",
//     "name",
//     "description",
//     "entity",
//     "x",
//     "y",
//     "width",
//     "height",
// ];

// const ID_OR_IDREF = [
//     "id",
//     "relationship",
//     "entity",
// ];

export class TontoSerializer implements Serializer<Model> {

    serialize(root: Model): string {
        return this.serializeValue(root);
    }

    private serializeValue(value: Model): string {
        return "";
    }

    // private isIdOrIdRef(key: string): boolean {
    //     return ID_OR_IDREF.includes(key);
    // }
}

// 'systemDiagram:
//     id: NewSystemDiagram
//     name: "NewSystemDiagram"
//     nodes:
//       - id: CountryNode
//         entity: ExampleMasterdata.Country
//         x: 385
//         y: 264
//         width: 112.78125
//         height: 76
//       - id: CountryNode1
//         entity: ExampleMasterdata.Country
//         x: 220
//         y: 264
//         width: 112.78125
//         height: 76
//       - id: CountryNode2
//         entity: ExampleMasterdata.Country
//         x: 528
//         y: 264
//         width: 112.78125
//         height: 76'