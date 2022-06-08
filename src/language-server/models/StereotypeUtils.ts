import { EndurantTypes } from "./EndurantType";

const NonSortalStereotypes = [
  EndurantTypes.CATEGORY,
  EndurantTypes.MIXIN,
  EndurantTypes.PHASE_MIXIN,
  EndurantTypes.ROLE_MIXIN,
  EndurantTypes.HISTORICAL_ROLE_MIXIN
];

const UltimateSortalStereotypes = [
  EndurantTypes.KIND,
  EndurantTypes.COLLECTIVE,
  EndurantTypes.QUANTITY,
  EndurantTypes.RELATOR,
  EndurantTypes.QUALITY,
  EndurantTypes.MODE
];

// TODO: consider renaming "base" to "lower"
const BaseSortalStereotypes = [
  EndurantTypes.SUBKIND,
  EndurantTypes.PHASE,
  EndurantTypes.ROLE,
  EndurantTypes.HISTORICAL_ROLE
];

const SortalStereotypes = [...UltimateSortalStereotypes, ...BaseSortalStereotypes];

// TODO: review if we should consider as rigid/anti-rigid/semi-rigid only those stereotypes whose respective types specialize Rigid/Anti-Rigid/Semi-Rigid in UFO. This introduces breaks to the gUFO transformation
const RigidStereotypes = [
  EndurantTypes.KIND,
  EndurantTypes.QUANTITY,
  EndurantTypes.COLLECTIVE,
  EndurantTypes.MODE,
  EndurantTypes.QUALITY,
  EndurantTypes.RELATOR,
  EndurantTypes.SUBKIND,
  EndurantTypes.CATEGORY,
  EndurantTypes.EVENT,
  EndurantTypes.SITUATION,
  EndurantTypes.TYPE,
  EndurantTypes.ABSTRACT,
  EndurantTypes.DATATYPE,
  EndurantTypes.ENUMERATION
];

const AntiRigidStereotypes = [
  EndurantTypes.ROLE,
  EndurantTypes.ROLE_MIXIN,
  EndurantTypes.HISTORICAL_ROLE,
  EndurantTypes.HISTORICAL_ROLE_MIXIN,
  EndurantTypes.PHASE,
  EndurantTypes.PHASE_MIXIN
];

const SemiRigidStereotypes = [EndurantTypes.MIXIN];

const MomentOnlyStereotypes = [EndurantTypes.MODE, EndurantTypes.QUALITY, EndurantTypes.RELATOR];

const SubstantialOnlyStereotypes = [EndurantTypes.KIND, EndurantTypes.QUANTITY, EndurantTypes.COLLECTIVE];

const EndurantStereotypes = [...SortalStereotypes, ...NonSortalStereotypes];

const AbstractStereotypes = [EndurantTypes.ABSTRACT, EndurantTypes.DATATYPE, EndurantTypes.ENUMERATION];




function isNonSortalClassStereotype(stereotype: EndurantTypes): boolean {
  return NonSortalStereotypes.includes(stereotype);
}

function isSortalClassStereotype(stereotype: EndurantTypes): boolean {
  return SortalStereotypes.includes(stereotype);
}

function isUltimateSortalClassStereotype(stereotype: EndurantTypes): boolean {
  return UltimateSortalStereotypes.includes(stereotype);
}

function isBaseSortalClassStereotype(stereotype: EndurantTypes): boolean {
  return BaseSortalStereotypes.includes(stereotype);
}

function isRigidClassStereotype(stereotype: EndurantTypes): boolean {
  return RigidStereotypes.includes(stereotype);
}

function isAntiRigidClassStereotype(stereotype: EndurantTypes): boolean {
  return AntiRigidStereotypes.includes(stereotype);
}

function isSemiRigidClassStereotype(stereotype: EndurantTypes): boolean {
  return SemiRigidStereotypes.includes(stereotype);
}

function isAbstractClassStereotype(stereotype: EndurantTypes): boolean {
  return AbstractStereotypes.includes(stereotype);
}

function isEndurantClassStereotype(stereotype: EndurantTypes): boolean {
  return EndurantStereotypes.includes(stereotype);
}

function isSubstantialClassStereotype(stereotype: EndurantTypes): boolean {
  return SubstantialOnlyStereotypes.includes(stereotype);
}

function isMomentClassStereotype(stereotype: EndurantTypes): boolean {
  return MomentOnlyStereotypes.includes(stereotype);
}

function isEventClassStereotype(stereotype: EndurantTypes): boolean {
  return stereotype === EndurantTypes.EVENT;
}

function isSituationClassStereotype(stereotype: EndurantTypes): boolean {
  return stereotype === EndurantTypes.SITUATION;
}

function isTypeClassStereotype(stereotype: EndurantTypes): boolean {
  return stereotype === EndurantTypes.TYPE;
}

export const stereotypeUtils = {
  // Class stereotypes arrays
  EndurantTypes,
  AbstractStereotypes,
  EndurantStereotypes,
  SubstantialOnlyStereotypes,
  MomentOnlyStereotypes,
  NonSortalStereotypes,
  SortalStereotypes,
  UltimateSortalStereotypes,
  BaseSortalStereotypes,
  RigidStereotypes,
  AntiRigidStereotypes,
  SemiRigidStereotypes,
  // Relation stereotypes arrays
  // RelationStereotypes,
  // ExistentialDependencyRelationStereotypes,
  // ExistentialDependentSourceRelationStereotypes,
  // ExistentialDependentTargetRelationStereotypes,
  // PartWholeRelationStereotypes,
  // // Property stereotypes arrays
  // PropertyStereotypes,
  // ClassStereotype utility methods
  isNonSortalClassStereotype,
  isSortalClassStereotype,
  isUltimateSortalClassStereotype,
  isBaseSortalClassStereotype,
  isRigidClassStereotype,
  isAntiRigidClassStereotype,
  isSemiRigidClassStereotype,
  isAbstractClassStereotype,
  isEndurantClassStereotype,
  isSubstantialClassStereotype,
  isMomentClassStereotype,
  isEventClassStereotype,
  isSituationClassStereotype,
  isTypeClassStereotype
};