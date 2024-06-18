// import { GeneratorContext, IdCacheImpl, LangiumDiagramGenerator, LangiumDiagramGeneratorArguments } from "langium-sprotty";
// import { SCompartment, SEdge, SGraph, SLabel, SModelRoot, SNode } from "sprotty-protocol";
// import { CancellationToken } from "vscode-languageserver";
// import { URI } from "vscode-uri";
// import { ClassDeclaration, PackageDeclaration, DataTypeOrClassOrRelation, Model } from "../generated/ast.js";
// import { TontoDiagramUtils } from "../utils/tontoDiagramUtils.js";
// import { generateEdge } from "./generate-edge.js";
// import { generateNode } from "./generate-node.js";

// export class TontoDiagramGenerator extends LangiumDiagramGenerator {

//     showExternalDiagrams: boolean = false;

//     override async generate(args: LangiumDiagramGeneratorArguments): Promise<SModelRoot> {
//         if (!args.document) {
//             const sourceUri = args.options.sourceUri as string;
//             if (!sourceUri) {
//                 return Promise.reject("Missing 'sourceUri' option in request.");
//             }
//             args.document = await this.langiumDocuments.getOrCreateDocument(URI.parse(sourceUri));
//         }
//         if (!args.cancelToken) {
//             args.cancelToken = CancellationToken.None;
//         }
//         if (!args.idCache) {
//             args.idCache = new IdCacheImpl();
//         }
//         return this.generateRoot(args as GeneratorContext<Model>);
//     }

//     protected generateRoot(args: GeneratorContext<Model>): SModelRoot {
//         const { document } = args;
//         const model = document.parseResult.value.module;
//         const tontoUtils = new TontoDiagramUtils(model);

//         const classDeclarations = tontoUtils.getClassDeclarations()
//             .flatMap(d => generateNode(d, args) ?? []);
//         const externalRelations = tontoUtils.getRelations()
//             .map(d => generateEdge(d, args));
//         const specializationEdges: SEdge[] = tontoUtils.getSpecializations(this.showExternalDiagrams)
//             .map(spec => {
//                 return this.generateSpecialization(spec.from, spec.to, args);
//             });
//         // // const referencedPackages = this.showExternalDiagrams ?
//         //     this.generateExternalPackages(args, tontoUtils.getReferencedClasses()) : [];

//         const packageId = args.idCache.uniqueId(model.name + "_package");

//         const graph: SGraph = {
//             type: "graph",
//             id: packageId + "_root",
//             layoutOptions: {
//                 vGap: 50,
//                 hGap: 5,
//                 hAlign: "left",
//                 paddingLeft: 7,
//                 paddingRight: 7,
//                 paddingTop: 7,
//                 paddingBottom: 7
//             },
//             children: [
//                 // <SCompartment>{
//                 //     id: "external",
//                 //     type: "node:external",
//                 //     children:
//                 //         this.showExternalDiagrams ? [...referencedPackages] : []
//                 // },
//                 // <SCompartment>{
//                 //     id: packageId,
//                 //     type: "node:package",
//                 //     children: [
//                 //         <SLabel>{
//                 //             id: packageId + "_label",
//                 //             type: "label:heading",
//                 //             text: model.name,
//                 //             position: {
//                 //                 x: 5,
//                 //                 y: 5
//                 //             }
//                 //         },
//                 ...classDeclarations,
//                 ...externalRelations,
//                 ...specializationEdges,
//                 // ],
//                 // },
//             ]
//         };
//         return graph;
//     }

//     protected generateSpecialization(sourceClass: ClassDeclaration, targetClass: ClassDeclaration, { idCache }: GeneratorContext<Model>): SEdge {
//         const sourceId = idCache.getId(sourceClass);
//         const targetId = idCache.getId(targetClass);
//         const edgeId = idCache.uniqueId(`${sourceId}:generalization:${targetId}`);
//         return {
//             type: "edge:specialization",
//             id: edgeId,
//             sourceId: sourceId!,
//             targetId: targetId!,
//             children: [
//             ]
//         };
//     }

//     protected generateExternalPackages(args: GeneratorContext<Model>, elements: Map<PackageDeclaration, DataTypeOrClassOrRelation[]>): SNode[] {
//         const packages: SNode[] = [];
//         elements.forEach((value, key) => {
//             const classNodes: SNode[] = value
//                 .filter(item => item.$type === "ClassDeclaration")
//                 .flatMap(item => generateNode(item, args) ?? []);
//             const packageId = args.idCache.uniqueId(key.name + "_pkg");
//             const element: SNode = {
//                 id: packageId,
//                 type: "node:package",
//                 layout: "vbox",
//                 children: [
//                     <SLabel>{
//                         id: key.name + "_label",
//                         type: "label:heading",
//                         text: key.name,
//                         position: {
//                             x: 5,
//                             y: 5
//                         }
//                     },
//                     <SCompartment>{
//                         id: key.name + "_content",
//                         type: "comp:pkgcontent",
//                         layout: "hbox",
//                         children: [
//                             ...classNodes
//                         ],
//                         layoutOptions: {
//                             paddingLeft: 10,
//                             paddingRight: 10,
//                             paddingTop: 10,
//                             paddingBottom: 10
//                         }
//                     }
//                 ],
//             };
//             packages.push(element);
//         });
//         return packages;
//     }
// }