import { OntologicalNature as ASTNature } from "../generated/ast";

export enum OntologicalNature {
    functional_complex = "functional-complex",
    collective = "collective",
    quantity = "quantity",
    relator = "relator",
    intrinsic_mode = "intrinsic-mode",
    extrinsic_mode = "extrinsic-mode",
    quality = "quality",
    event = "event",
    situation = "situation",
    type = "type",
    abstract = "abstract"
}

const Natures = [
  OntologicalNature.functional_complex,
  OntologicalNature.collective,
  OntologicalNature.quantity,
  OntologicalNature.intrinsic_mode,
  OntologicalNature.extrinsic_mode,
  OntologicalNature.quality,
  OntologicalNature.relator,
  OntologicalNature.event,
  OntologicalNature.situation,
  OntologicalNature.type,
  OntologicalNature.abstract
];

const EndurantNatures = [
  OntologicalNature.functional_complex,
  OntologicalNature.collective,
  OntologicalNature.quantity,
  OntologicalNature.intrinsic_mode,
  OntologicalNature.extrinsic_mode,
  OntologicalNature.quality,
  OntologicalNature.relator,
  OntologicalNature.type
];

const SubstantialNatures = [OntologicalNature.functional_complex, OntologicalNature.collective, OntologicalNature.quantity];

const MomentNatures = [
  OntologicalNature.intrinsic_mode,
  OntologicalNature.extrinsic_mode,
  OntologicalNature.quality,
  OntologicalNature.relator
];

const IntrinsicMomentNatures = [OntologicalNature.intrinsic_mode, OntologicalNature.quality];

const ExtrinsicMomentNatures = [OntologicalNature.extrinsic_mode, OntologicalNature.relator];

const naturesArrays = [
  Natures,
  EndurantNatures,
  SubstantialNatures,
  MomentNatures,
  IntrinsicMomentNatures,
  ExtrinsicMomentNatures
];

naturesArrays.forEach((array: OntologicalNature[]) => Object.freeze(array));

function getNatureFromAst(nature: ASTNature): OntologicalNature | undefined {
  switch (nature) {
  case "collectives":
    return OntologicalNature.collective;
  case "extrinsic-modes":
    return OntologicalNature.extrinsic_mode;
  case "intrinsic-modes":
    return OntologicalNature.intrinsic_mode;
  case "functional-complexes":
    return OntologicalNature.functional_complex;
  case "objects":
    return OntologicalNature.functional_complex;
  case "qualities":
    return OntologicalNature.quality;
  case "quantities":
    return OntologicalNature.quantity;
  case "relators":
    return OntologicalNature.relator;
  case "types":
    return OntologicalNature.type;
  case "abstracts":
    return OntologicalNature.abstract;
  case "events":
    return OntologicalNature.event;
  case "situations":
    return OntologicalNature.situation;
  }
}

export const natureUtils = {
  Natures,
  EndurantNatures,
  SubstantialNatures,
  MomentNatures,
  IntrinsicMomentNatures,
  ExtrinsicMomentNatures,
  getNatureFromAst
};
