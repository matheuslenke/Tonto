import { NodeFileSystem } from "langium/node";
import { createTontoServices, Model } from "../../language-server";
import { extractAstNode } from "../cli-util";
import { extractContent } from "../diagramGenerator";
import { Configuration } from "../../utils/setExtensionConfig";
import { generateDiagram } from "../DiagramViewer/diagram.viewer";

export const viewAction = async (fileName: string): Promise<void> => {
  // modificar isto para que receba parametros opcionais como configuração do diagrama
  const rascunho: Configuration = {
    Entity: {
      Attributes: false,
      Colors: {
        stereotypes_1: 'aaa',
        stereotypes_2: 'bbb',
        stereotypes_3: 'ccc'
      },
    },
    Relation: {
      Cardinality: false,
      Associations: false,
      AssociationsEndNames: false
    },
    Datatype: false,
    Enumeration: false
  }
    viewCommand(fileName, rascunho);
};

export const viewCommand = async (fileName: string, config: Configuration): Promise<string> => {
  const services = createTontoServices({ ...NodeFileSystem }).Tonto;
  let model = await extractAstNode<Model>(fileName, services);
  const generatedPackages = extractContent(model, fileName?.split('/').pop());

  return generateDiagram(generatedPackages, config);
};
