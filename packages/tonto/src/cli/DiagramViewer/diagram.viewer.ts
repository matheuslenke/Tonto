import { setHTML } from "./diagram.config";
import { Configuration } from "../../utils/extensionConfig";
import { renderSvg } from 'nomnoml';
import { classViewer } from "./class.viewer";
import { relationViewer } from "./relation.viewer";
import { generalizationSetViewer, generalizationViewer } from "./specialization.viewer";
import { diagramContent } from "../diagramGenerator";
import { Uri } from "vscode";

export const generateDiagram = (content: diagramContent, domToImgUri: Uri, jsUri: Uri, cssUri: Uri, csp: string, title: string, config: Configuration): string => {
  
  let svg: string = '';

  let nomnomlCode = `
#edges: rounded
#padding: 20
#gravity: 1.5
#lineWidth: 1.5
#background: transparent
#ranker: tight-tree
`;

  content.specializations.forEach((generalization) => {
    const general = generalization.getGeneralClass();
    const specific = generalization.getSpecificClass();
    
    // This is necessary because there is an error in the ast
    if((config.Datatype && (general.hasDatatypeStereotype() || specific.hasDatatypeStereotype())) || (config.Enumeration && (general.hasEnumerationStereotype() || specific.hasEnumerationStereotype()))){
      nomnomlCode += generalizationViewer(generalization.id, specific, general);
    } else if(!(general.hasDatatypeStereotype() || specific.hasDatatypeStereotype() || general.hasEnumerationStereotype() || specific.hasEnumerationStereotype())){
      nomnomlCode += generalizationViewer(generalization.id, general, specific);
    }
  });

  content.specializationSets.forEach((genSet) => {
    nomnomlCode += generalizationSetViewer(genSet);
  });
    
  content.relations.forEach((relation, id) => {
    nomnomlCode += relationViewer(relation, id, config);
  });

  content.class.forEach((element) => {
    if((config.Datatype || !element.hasDatatypeStereotype()) && (config.Enumeration || !element.hasEnumerationStereotype()))
      nomnomlCode += classViewer(element, config);
  });

  // Generate the SVG for the diagram
  svg = renderSvg(nomnomlCode);

  return setHTML(svg, domToImgUri, jsUri, cssUri, csp, title);
};