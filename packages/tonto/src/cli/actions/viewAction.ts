import { NodeFileSystem } from "langium/node";
import { Uri } from "vscode";
import { createTontoServices, Model } from "../../language/index.js";
import { Configuration } from "../../utils/extensionConfig.js";
import { extractAstNode } from "../cli-util.js";
import { extractContent } from "../diagramGenerator.js";
import { generateDiagram } from "../DiagramViewer/diagram.viewer.js";
// import jsPDF from 'jspdf';

// export const viewAction = async (fileName: string): Promise<void> => {
//   // modificar isto para que receba parametros opcionais como configuração do diagrama
//   const rascunho: Configuration = {
//     Entity: {
//       Attributes: false,
//       Colors: {
//         stereotypes_1: 'aaa',
//         stereotypes_2: 'bbb',
//         stereotypes_3: 'ccc'
//       },
//     },
//     Relation: {
//       Cardinality: false,
//       Associations: false,
//       AssociationsEndNames: false
//     },
//     Datatype: false,
//     Enumeration: false
//   }
//   const html = await viewCommand(fileName, rascunho);

//   const doc = new jsPDF();
//   doc.text(html, 15, 15);
//   doc.save(`${fileName?.split('/').pop()}.pdf`);
// };

export const viewCommand = async (fileName: string, domToImgUri: Uri, jsUri: Uri, cssUri: Uri, csp: string, title: string, config: Configuration): Promise<string> => {
    const services = createTontoServices({ ...NodeFileSystem }).Tonto;
    const model = await extractAstNode<Model>(fileName, services);
    const generatedPackages = extractContent(model, fileName?.split("/").pop());

    return generateDiagram(generatedPackages, domToImgUri, jsUri, cssUri, csp, title, config);
};
