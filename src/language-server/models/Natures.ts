export enum OntologicalNature {
    functional_complex = 'functional-complex',
    collective = 'collective',
    quantity = 'quantity',
    relator = 'relator',
    intrinsic_mode = 'intrinsic-mode',
    extrinsic_mode = 'extrinsic-mode',
    quality = 'quality',
    event = 'event',
    situation = 'situation',
    type = 'type',
    abstract = 'abstract'
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
    OntologicalNature.relator
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
  
  export const natureUtils = {
    Natures,
    EndurantNatures,
    SubstantialNatures,
    MomentNatures,
    IntrinsicMomentNatures,
    ExtrinsicMomentNatures
  };
  