import { setHTML } from "./diagram.config";
import { Configuration } from "../../utils/setExtensionConfig";
import { renderSvg } from 'nomnoml';
import { classViewer } from "./class.viewer";
import { relationViewer } from "./relation.viewer";
import { generalizationSetViewer, generalizationViewer } from "./specialization.viewer";
import { diagramContent } from "../diagramGenerator";

export const generateDiagram = (content: diagramContent, config: Configuration): string => {
  
  let svg: Array<string> = [];
  let initNomnomlCode = 
`
#edges: rounded
#padding: 20
#gravity: 1.5
#lineWidth: 1.5
#background: transparent
#ranker: tight-tree
`;

  content.packages.forEach((package_, i) => {
    // if(i > 1) console.log("TEM MAIS");

    let nomnomlCode = initNomnomlCode +  `${(package_.name.getText("en") || "null")}\n` //`[<frame>${(package_.name.getText("en") || "null")} |\n`;

    content.class[i].forEach((element) => {
      if((config.Datatype || !element.hasDatatypeStereotype()) && (config.Enumeration || !element.hasEnumerationStereotype()))
        nomnomlCode += classViewer(element, config);
    });
    content.specializations[i].forEach((generalization) => {
      nomnomlCode += generalizationViewer(generalization.getGeneralClass(), generalization.getSpecificClass(), config);
    });
    content.specializationSets[i].forEach((genSet) => {
      nomnomlCode += generalizationSetViewer(genSet, config);
    });
    content.relations[i].forEach((relation) => {
      nomnomlCode += relationViewer(relation, config);
    });

    // nomnomlCode += ']\n';
    // console.log(i+": ", nomnomlCode);
    // Generate the SVG for the diagram
    svg[i] = renderSvg(nomnomlCode);
  });

  return setHTML(svg[0]);
};